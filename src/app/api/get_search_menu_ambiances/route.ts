import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get searched ambiances basic information to display in the search ambiance menu
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const searchString = searchParams.get("search");
    const categories = searchParams.getAll("category");
    const themes = searchParams.getAll("theme");

    // Build the base query
    let query = `
      SELECT 
        id, 
        ambiance_name, 
        categories, 
        themes,
        author_id
      FROM ambiances
    `;

    const conditions: string[] = [];
    const values: string[] = [];
    let paramIndex = 1;

    // Add search string filter (searches in ambiance_name)
    if (searchString && searchString.trim()) {
      conditions.push(`ambiance_name ILIKE $${paramIndex}`);
      values.push(`%${searchString.trim()}%`);
      paramIndex++;
    }

    // Add category filters
    if (categories.length > 0) {
      const categoryConditions = categories.map(() => {
        const condition = `categories && ARRAY[$${paramIndex}]::category[]`;
        values.push(categories[paramIndex - 1]);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${categoryConditions.join(" OR ")})`);
    }

    // Add theme filters
    if (themes.length > 0) {
      const themeConditions = themes.map(() => {
        const condition = `themes && ARRAY[$${paramIndex}]::theme[]`;
        values.push(themes[paramIndex - 1]);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${themeConditions.join(" OR ")})`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ordering
    query += ` ORDER BY ambiance_name ASC`;

    console.log("Query:", query);
    console.log("Values:", values);

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    // Send the error message on the console
    console.error(
      "Database error when getting ambiances basic informations:",
      error
    );
    // Send the error to the front
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
