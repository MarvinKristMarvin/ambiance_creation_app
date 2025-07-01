import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get all ambiances
export async function GET(request: Request) {
  const url = new URL(request.url);
  const soundId = url.pathname.split("/").pop(); // Extract ID from URL

  if (!soundId || isNaN(Number(soundId))) {
    return NextResponse.json({ error: "Invalid sound ID" }, { status: 400 });
  }
  try {
    const result = await pool.query("SELECT * FROM sounds WHERE id = $1", [
      soundId,
    ]);

    const rawSound = result.rows[0];

    const parsedSound = {
      ...rawSound,
      direction:
        rawSound.direction !== null ? parseFloat(rawSound.direction) : 0,
      speed: rawSound.speed !== null ? parseFloat(rawSound.speed) : 1,
      reverb_duration:
        rawSound.reverb_duration !== null
          ? parseFloat(rawSound.reverb_duration)
          : 0,
      // add other conversions as needed
    };
    return NextResponse.json([parsedSound]);
  } catch (error) {
    // Send the error message on the console
    console.error("Database error:", error);
    // Send the error to the front
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
