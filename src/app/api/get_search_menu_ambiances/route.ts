/**
 * API route to get ambiances based on filters for the search ambiance menu.
 *
 * @param request - GET request with optional query parameters:
 *   - search: string to filter by ambiance name (partial match)
 *   - category: one or more categories (must all match)
 *   - theme: one or more themes (must all match)
 *
 * If the user is logged in, adds `is_favorite` and total number of favorites per ambiance.
 * If no filters are applied, returns the user's favorite ambiances (if logged in).
 *
 * @returns JSON response with an array of ambiance metadata
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

// Zod schema for query validation
const getAmbiancesQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  theme: z.union([z.string(), z.array(z.string())]).optional(),
});

type GetAmbiancesQueryParams = z.infer<typeof getAmbiancesQuerySchema>;

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

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Extract and validate query parameters using Zod
    let params: GetAmbiancesQueryParams;
    try {
      const rawParams = {
        search: searchParams.get("search") ?? undefined,
        category: searchParams.getAll("category") ?? undefined,
        theme: searchParams.getAll("theme") ?? undefined,
      };

      params = getAmbiancesQuerySchema.parse(rawParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const { search, category, theme } = params;
    const categories = Array.isArray(category)
      ? category
      : category
      ? [category]
      : [];

    const themes = Array.isArray(theme) ? theme : theme ? [theme] : [];

    const isFilterEmpty =
      !search?.trim() && categories.length === 0 && themes.length === 0;

    // Base query
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
        },
        COALESCE(fav_counts.count, 0) AS number_of_favorites
      FROM ambiances a
      LEFT JOIN (
        SELECT ambiance_id, COUNT(*) AS count
        FROM user_has_favorite_ambiances
        GROUP BY ambiance_id
      ) AS fav_counts ON a.id = fav_counts.ambiance_id
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

    if (search && search.trim()) {
      conditions.push(`a.ambiance_name ILIKE $${paramIndex}`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (categories.length > 0) {
      conditions.push(
        `a.categories @> ARRAY[${categories
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::category[]`
      );
      values.push(...categories);
      paramIndex += categories.length;
    }

    if (themes.length > 0) {
      conditions.push(
        `a.themes @> ARRAY[${themes
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::theme[]`
      );
      values.push(...themes);
      paramIndex += themes.length;
    }

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
