/**
 * API route to get detailed information about a specific ambiance,
 * including its modified sound options (ambiance_sounds).
 *
 * @param request - GET request with ambianceId in the URL path
 * @returns JSON response with ambiance metadata and an array of ambiance_sounds
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import * as Sentry from "@sentry/nextjs";

// Zod schema to validate ambianceId
const getAmbianceDetailsParamsSchema = z.object({
  ambianceId: z
    .string()
    .regex(/^\d+$/, "ambianceId must be a valid number")
    .transform(Number),
});

type GetAmbianceDetailsParams = z.infer<typeof getAmbianceDetailsParamsSchema>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ambianceIdParam = url.pathname.split("/").pop();

    // Validate using Zod
    let params: GetAmbianceDetailsParams;
    try {
      params = getAmbianceDetailsParamsSchema.parse({
        ambianceId: ambianceIdParam,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid ambiance ID",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const { ambianceId } = params;

    const result = await pool.query(
      `SELECT 
        a.id,
        a.ambiance_name,
        a.author_id,
        json_agg(json_build_object(
          'id', asound.id,
          'sound_id', asound.sound_id,
          'volume', asound.volume,
          'reverb', asound.reverb,
          'reverb_duration', asound.reverb_duration,
          'direction', asound.direction,
          'speed', asound.speed,
          'repeat_delay', asound.repeat_delay,
          'low', asound.low,
          'mid', asound.mid,
          'high', asound.high,
          'low_cut', asound.low_cut,
          'high_cut', asound.high_cut
        )) AS ambiance_sounds
      FROM ambiances a
      LEFT JOIN ambiances_sounds asound ON asound.ambiance_id = a.id
      WHERE a.id = $1
      GROUP BY a.id;`,
      [ambianceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Ambiance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
