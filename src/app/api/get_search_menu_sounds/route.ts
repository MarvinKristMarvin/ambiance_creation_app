import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get searched sounds basic information to display in the search sound menu
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, sound_name, image_path, audio_paths, looping, volume FROM sounds"
    );
    return NextResponse.json(result.rows);
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
