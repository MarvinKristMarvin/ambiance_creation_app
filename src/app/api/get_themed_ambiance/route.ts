/**
 * API route to get the most favorited ambiance for a given theme
 *
 * Attempts to find the most favorited ambiance where the given theme is the primary theme
 * (i.e., first in the `themes` array). If not found, it checks the 2nd through 5th positions,
 * and finally falls back to any position in the `themes` array.
 *
 * @param req - POST request containing theme in the body
 * @returns JSON response with the ambiance data including sounds
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";

// Zod schema for request body validation
const getThemedAmbianceSchema = z.object({
  theme: z
    .string()
    .min(1, "Theme cannot be empty")
    .max(50, "Theme must be 50 characters or less")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "Theme can only contain letters, spaces, and hyphens"
    )
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),
});

// Type inference from Zod schema
type GetThemedAmbianceRequest = z.infer<typeof getThemedAmbianceSchema>;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body using Zod
    let body: GetThemedAmbianceRequest;
    try {
      const rawBody = await req.json();
      body = getThemedAmbianceSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid request data",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { theme } = body; // theme is already capitalized by Zod transform

    let rows = [];

    // Try positions 1 through 5 in themes array
    for (let i = 1; i <= 5; i++) {
      const result = await pool.query(
        `
        SELECT
          a.*,
          json_agg(
            json_build_object(
              'id', asnd.id,
              'sound_id', s.id,
              'volume', asnd.volume,
              'reverb', asnd.reverb,
              'reverb_duration', asnd.reverb_duration,
              'speed', asnd.speed,
              'direction', asnd.direction,
              'repeat_delay', asnd.repeat_delay,
              'low', asnd.low,
              'mid', asnd.mid,
              'high', asnd.high,
              'low_cut', asnd.low_cut,
              'high_cut', asnd.high_cut
            )
          ) AS ambiance_sounds
        FROM ambiances a
        JOIN user_has_favorite_ambiances ufa ON ufa.ambiance_id = a.id
        JOIN ambiances_sounds asnd ON asnd.ambiance_id = a.id
        JOIN sounds s ON s.id = asnd.sound_id
        WHERE a.themes[$1] = $2
        GROUP BY a.id
        ORDER BY COUNT(ufa.ambiance_id) DESC
        LIMIT 1;
        `,
        [i, theme]
      );
      if (result.rows.length > 0) {
        rows = result.rows;
        break;
      }
    }

    // If still not found, try ANY position
    if (!rows.length) {
      const fallback = await pool.query(
        `
        SELECT
          a.*,
          json_agg(
            json_build_object(
              'id', asnd.id,
              'sound_id', s.id,
              'volume', asnd.volume,
              'reverb', asnd.reverb,
              'reverb_duration', asnd.reverb_duration,
              'speed', asnd.speed,
              'direction', asnd.direction,
              'repeat_delay', asnd.repeat_delay,
              'low', asnd.low,
              'mid', asnd.mid,
              'high', asnd.high,
              'low_cut', asnd.low_cut,
              'high_cut', asnd.high_cut
            )
          ) AS ambiance_sounds
        FROM ambiances a
        JOIN user_has_favorite_ambiances ufa ON ufa.ambiance_id = a.id
        JOIN ambiances_sounds asnd ON asnd.ambiance_id = a.id
        JOIN sounds s ON s.id = asnd.sound_id
        WHERE $1 = ANY(a.themes)
        GROUP BY a.id
        ORDER BY COUNT(ufa.ambiance_id) DESC
        LIMIT 1;
        `,
        [theme]
      );
      rows = fallback.rows;
    }

    if (!rows.length) {
      return NextResponse.json(
        { error: "No ambiance found for this theme" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
