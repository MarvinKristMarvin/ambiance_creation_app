import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

// Get searched ambiances basic information to display in the search ambiance menu
export async function GET(request: Request) {
  try {
    let session = null;
    let userId = null;
    // Safely get session with error handling
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
      // Continue with null userId for anonymous users
    }

    const { searchParams } = new URL(request.url);
    // Extract query parameters
    const searchString = searchParams.get("search");
    const categories = searchParams.getAll("category");
    const themes = searchParams.getAll("theme");

    // Build the base query
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

    // Add LEFT JOIN for favorites only if user is logged in
    if (userId) {
      query += `
        LEFT JOIN user_has_favorite_ambiances uhfa
        ON a.id = uhfa.ambiance_id AND uhfa.user_id = $1
      `;
    }

    const conditions: string[] = [];
    const values: string[] = [];
    let paramIndex = userId ? 2 : 1; // Start from 2 if userId is used, otherwise 1

    // Add userId to values array if logged in
    if (userId) {
      values.push(userId);
    }

    // Add search string filter (searches in ambiance_name)
    if (searchString && searchString.trim()) {
      conditions.push(`a.ambiance_name ILIKE $${paramIndex}`);
      values.push(`%${searchString.trim()}%`);
      paramIndex++;
    }

    // Add category filters
    if (categories.length > 0) {
      const categoryConditions = categories.map((category) => {
        const condition = `a.categories && ARRAY[$${paramIndex}]::category[]`;
        values.push(category);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${categoryConditions.join(" OR ")})`);
    }

    // Add theme filters
    if (themes.length > 0) {
      const themeConditions = themes.map((theme) => {
        const condition = `a.themes && ARRAY[$${paramIndex}]::theme[]`;
        values.push(theme);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${themeConditions.join(" OR ")})`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ordering: favorites first, then by name
    if (userId) {
      query += ` ORDER BY is_favorite DESC, a.ambiance_name ASC`;
    } else {
      query += ` ORDER BY a.ambiance_name ASC`;
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
    // Send the error message on the console with more details
    console.error("Database error when getting ambiances basic informations:");
    console.error("Full error:", error);
    // Send the error to the front
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
