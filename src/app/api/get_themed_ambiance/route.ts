import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db_client";

// POST /api/get_themed_ambiance
// Attempts to find the most favorited ambiance where the given theme is the primary theme
// (i.e., first in the `themes` array). If not found, it checks the 2nd through 5th positions,
// and finally falls back to any position in the `themes` array.

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 });
    }

    const capitalizedTheme =
      theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();

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
              'repeat_delay', asnd.repeat_delay
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
        [i, capitalizedTheme]
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
              'repeat_delay', asnd.repeat_delay
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
        [capitalizedTheme]
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
