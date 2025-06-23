import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get the ambiance informations (with ambiance_sounds modified options)
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Extract ID from URL
  const ambianceId = url.pathname.split("/").pop();

  if (!ambianceId || isNaN(Number(ambianceId))) {
    return NextResponse.json({ error: "Invalid ambiance ID" }, { status: 400 });
  }

  try {
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
    'repeat_delay', asound.repeat_delay
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
    // Returns { id, ambiance_name, ... }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
