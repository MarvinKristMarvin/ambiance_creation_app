/**
 * API route to get all sounds used in a specific ambiance
 *
 * @param request - GET request with ambianceId in the URL path
 * @returns JSON response with the list of sounds associated with the ambiance
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import * as Sentry from "@sentry/nextjs";

// Zod schema to validate ambianceId as a numeric string
const getAmbianceParamsSchema = z.object({
  ambianceId: z
    .string()
    .regex(/^\d+$/, "ambianceId must be a valid number")
    .transform(Number),
});

type GetAmbianceParams = z.infer<typeof getAmbianceParamsSchema>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ambianceIdParam = url.pathname.split("/").pop(); // Extract ID from URL

    // Validate using Zod
    let params: GetAmbianceParams;
    try {
      params = getAmbianceParamsSchema.parse({ ambianceId: ambianceIdParam });
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
        sounds.id,
        sounds.sound_name,
        sounds.audio_paths,
        sounds.image_path,
        sounds.looping,
        sounds.volume,
        sounds.reverb,
        sounds.direction,
        sounds.repeat_delay,
        sounds.category
      FROM ambiances_sounds
      JOIN sounds ON ambiances_sounds.sound_id = sounds.id
      WHERE ambiances_sounds.ambiance_id = $1;`,
      [ambianceId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
