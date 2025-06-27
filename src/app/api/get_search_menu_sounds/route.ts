import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

// GET /api/get_search_menu_sounds
export async function GET(request: Request) {
  try {
    let session = null;
    let userId = null;

    try {
      session = await auth.api.getSession({ headers: request.headers });
      userId = session?.user?.id || null;
      console.log("Session retrieved successfully:", {
        hasSession: !!session,
        userId,
      });
    } catch (sessionError) {
      console.log(
        "Session retrieval failed (user likely not logged in):",
        sessionError
      );
    }

    const { searchParams } = new URL(request.url);
    const searchString = searchParams.get("search");
    const category = searchParams.get("category");
    const themes = searchParams.getAll("theme");

    const isFilterEmpty =
      !searchString?.trim() && !category && themes.length === 0;

    // Base SELECT
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
            ? "CASE WHEN ufs.user_id IS NOT NULL THEN true ELSE false END as is_favorite"
            : "false as is_favorite"
        }
      FROM sounds s
    `;

    if (userId) {
      query += `
        LEFT JOIN user_has_favorite_sounds ufs
        ON s.id = ufs.sound_id AND ufs.user_id = $1
      `;
    }

    const conditions: string[] = [];
    const values: string[] = [];
    let paramIndex = userId ? 2 : 1;

    if (userId) values.push(userId);

    // Search by sound name
    if (searchString && searchString.trim()) {
      conditions.push(`s.sound_name ILIKE $${paramIndex}`);
      values.push(`%${searchString.trim()}%`);
      paramIndex++;
    }

    // Filter by category
    if (category) {
      conditions.push(`s.category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    // Theme filter (all required)
    if (themes.length > 0) {
      conditions.push(
        `s.themes @> ARRAY[${themes
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::theme[]`
      );
      values.push(...themes);
      paramIndex += themes.length;
    }

    // WHERE clause
    if (isFilterEmpty) {
      if (userId) {
        query += ` WHERE ufs.user_id IS NOT NULL`;
      } else {
        return NextResponse.json([]);
      }
    } else if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Match score: fewer themes = higher relevance
    const themeScore = themes
      .map((theme) => `COALESCE(array_position(s.themes, '${theme}'), 1000)`)
      .join(" + ");
    const totalScore = themes.length > 0 ? `(${themeScore})` : "0";

    // ORDER BY
    if (!isFilterEmpty && themes.length > 0) {
      query += `
        ORDER BY
          ${userId ? "is_favorite DESC," : ""}
          ${totalScore} ASC,
          cardinality(s.themes) ASC
      `;
    } else {
      query += `
        ORDER BY
          ${userId ? "is_favorite DESC," : ""}
          cardinality(s.themes) ASC
      `;
    }

    console.log("Final query:", query);
    console.log("Final values:", values);

    const result = await pool.query(query, values);
    console.log("Query executed successfully, rows:", result.rows.length);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error when getting sounds basic information:");
    console.error("Full error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
