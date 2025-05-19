import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get all the sounds used in the specified ambiance
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ambianceId = url.pathname.split("/").pop(); // Extract ID from URL

  if (!ambianceId || isNaN(Number(ambianceId))) {
    return NextResponse.json({ error: "Invalid ambiance ID" }, { status: 400 });
  }

  try {
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
        sounds.category
      FROM ambiances_sounds
      JOIN sounds ON ambiances_sounds.sound_id = sounds.id
      WHERE ambiances_sounds.ambiance_id = $1;`,
      [ambianceId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
