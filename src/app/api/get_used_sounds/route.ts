// app/api/sounds/by-ids/route.ts
import pool from "@/lib/db_client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { soundIds } = await request.json();

    if (!Array.isArray(soundIds) || soundIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty sound IDs array" },
        { status: 400 }
      );
    }

    // Get all sound details for these sound_ids
    const sounds = await pool.query(`SELECT * FROM sounds WHERE id = ANY($1)`, [
      soundIds,
    ]);

    return NextResponse.json(sounds.rows);
  } catch (error) {
    console.error("Error fetching sounds by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sounds by IDs" },
      { status: 500 }
    );
  }
}
