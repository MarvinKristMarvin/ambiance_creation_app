import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get searched sounds basic information to display in the search sound menu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const searchString = searchParams.get("search");
    const category = searchParams.get("category");
    const themes = searchParams.getAll("theme"); // Get all theme parameters

    // Build the SQL query dynamically
    let query = `
      SELECT id, sound_name, image_path, audio_paths, looping, volume, category, themes
      FROM sounds
    `;

    const conditions: string[] = [];
    const values: (string | string[])[] = [];
    let paramCounter = 1;

    // Add search string condition (case insensitive)
    if (searchString && searchString.trim()) {
      conditions.push(`sound_name ILIKE $${paramCounter}`);
      values.push(`%${searchString.trim()}%`);
      paramCounter++;
    }

    // Add category condition
    if (category) {
      conditions.push(`category = $${paramCounter}`);
      values.push(category);
      paramCounter++;
    }

    // Add themes condition (OR logic - sound must have at least one of the selected themes)
    if (themes.length > 0) {
      // Use array overlap operator to check if any selected theme exists in the sound's themes array
      conditions.push(`themes && $${paramCounter}`);
      values.push(themes);
      paramCounter++;
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY clause for alphabetical sorting
    query += ` ORDER BY sound_name ASC`;

    console.log("Executing query:", query);
    console.log("With values:", values);

    const result = await pool.query(query, values);

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
