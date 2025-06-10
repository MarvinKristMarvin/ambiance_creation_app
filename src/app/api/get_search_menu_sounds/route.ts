import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const searchString = searchParams.get("search");
    const category = searchParams.get("category");
    const themes = searchParams.getAll("theme");

    // Build the SQL query dynamically
    let query = `
      SELECT 
        s.id, 
        s.sound_name, 
        s.image_path, 
        s.audio_paths, 
        s.looping, 
        s.volume, 
        s.category, 
        s.themes,
        ${
          userId
            ? "CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_favorite"
            : "false as is_favorite"
        }
      FROM sounds s
    `;

    // Add LEFT JOIN for favorites if user is logged in
    if (userId) {
      query += `
        LEFT JOIN user_has_favorite_sounds uf
        ON s.id = uf.sound_id AND uf.user_id = $1
      `;
    }

    const conditions: string[] = [];
    const values: (string | string[])[] = [];
    let paramCounter = userId ? 2 : 1; // Start from 2 if userId is used

    // Add userId to values if logged in
    if (userId) {
      values.push(userId);
    }

    // Add search string condition
    if (searchString && searchString.trim()) {
      conditions.push(`s.sound_name ILIKE $${paramCounter}`);
      values.push(`%${searchString.trim()}%`);
      paramCounter++;
    }

    // Add category condition
    if (category) {
      conditions.push(`s.category = $${paramCounter}`);
      values.push(category);
      paramCounter++;
    }

    // Add themes condition
    if (themes.length > 0) {
      conditions.push(`s.themes && $${paramCounter}`);
      values.push(themes);
      paramCounter++;
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Modify ORDER BY to show favorites first, then alphabetically
    query += ` ORDER BY ${userId ? "is_favorite DESC, " : ""}s.sound_name ASC`;

    console.log("Executing query:", query);
    console.log("With values:", values);

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
