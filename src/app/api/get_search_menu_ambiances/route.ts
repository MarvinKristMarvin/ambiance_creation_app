import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

// Get searched ambiances basic information to display in the search ambiance menu
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
    const categories = searchParams.getAll("category");
    const themes = searchParams.getAll("theme");

    const isFilterEmpty =
      !searchString?.trim() && categories.length === 0 && themes.length === 0;

    // Base SELECT
    let query = `
      SELECT
        a.id,
        a.ambiance_name,
        a.categories,
        a.themes,
        a.author_id,
        ${
          userId
            ? "CASE WHEN uhfa.user_id IS NOT NULL THEN true ELSE false END as is_favorite"
            : "false as is_favorite"
        }
      FROM ambiances a
    `;

    if (userId) {
      query += `
        LEFT JOIN user_has_favorite_ambiances uhfa
        ON a.id = uhfa.ambiance_id AND uhfa.user_id = $1
      `;
    }

    const conditions: string[] = [];
    const values: string[] = [];
    let paramIndex = userId ? 2 : 1;

    if (userId) {
      values.push(userId);
    }

    // Search filter
    if (searchString && searchString.trim()) {
      conditions.push(`a.ambiance_name ILIKE $${paramIndex}`);
      values.push(`%${searchString.trim()}%`);
      paramIndex++;
    }

    // Category filter (all required)
    if (categories.length > 0) {
      conditions.push(
        `a.categories @> ARRAY[${categories
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::category[]`
      );
      values.push(...categories);
      paramIndex += categories.length;
    }

    // Theme filter (all required)
    if (themes.length > 0) {
      conditions.push(
        `a.themes @> ARRAY[${themes
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::theme[]`
      );
      values.push(...themes);
      paramIndex += themes.length;
    }

    // Apply WHERE clause
    if (isFilterEmpty) {
      if (userId) {
        query += ` WHERE uhfa.user_id IS NOT NULL`;
      } else {
        return NextResponse.json([]);
      }
    } else {
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }
    }

    // Ordering based on match quality
    const categoryScore = categories
      .map((cat) => `COALESCE(array_position(a.categories, '${cat}'), 1000)`)
      .join(" + ");

    const themeScore = themes
      .map((theme) => `COALESCE(array_position(a.themes, '${theme}'), 1000)`)
      .join(" + ");

    const totalScore =
      categories.length && themes.length
        ? `(${categoryScore}) + (${themeScore})`
        : categories.length
        ? `(${categoryScore})`
        : `(${themeScore})`;

    // ORDER BY
    if (!isFilterEmpty && (categories.length > 0 || themes.length > 0)) {
      query += ` ORDER BY ${
        userId ? "is_favorite DESC," : ""
      } ${totalScore} ASC, a.ambiance_name ASC`;
    } else {
      query += ` ORDER BY ${
        userId ? "is_favorite DESC," : ""
      } a.ambiance_name ASC`;
    }

    console.log("Final query:", query);
    console.log("Final values:", values);
    console.log("User ID:", userId);

    const result = await pool.query(query, values);
    console.log(
      "Query executed successfully, rows returned:",
      result.rows.length
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error when getting ambiances basic informations:");
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
