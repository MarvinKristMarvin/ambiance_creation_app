/**
 * API route to get filtered or favorite sounds for the search menu
 *
 * @param request - GET request with optional query parameters:
 *   - search: string to filter by sound name (partial match)
 *   - category: string to filter by category
 *   - theme: one or more themes to filter by (must all match)
 *
 * If the user is logged in, it also includes `is_favorite` status for each sound.
 * If no filters are applied, it returns the user's favorites (if logged in).
 *
 * @returns JSON response with an array of sound metadata
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";

// Zod schema for query parameters
const getSearchMenuSoundsSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  theme: z.union([z.string(), z.array(z.string())]).optional(),
});

// Type inference from schema
type GetSearchMenuSoundsParams = z.infer<typeof getSearchMenuSoundsSchema>;

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

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse and validate with Zod
    let params: GetSearchMenuSoundsParams;
    try {
      const rawParams = {
        search: searchParams.get("search") ?? undefined,
        category: searchParams.get("category") ?? undefined,
        theme: searchParams.getAll("theme") ?? undefined,
      };

      params = getSearchMenuSoundsSchema.parse(rawParams);
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
    const themes = Array.isArray(theme) ? theme : theme ? [theme] : [];

    const isFilterEmpty = !search?.trim() && !category && themes.length === 0;

    // Base SELECT query
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

    if (search && search.trim()) {
      conditions.push(`s.sound_name ILIKE $${paramIndex}`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`s.category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (themes.length > 0) {
      conditions.push(
        `s.themes @> ARRAY[${themes
          .map((_, i) => `$${paramIndex + i}`)
          .join(", ")}]::theme[]`
      );
      values.push(...themes);
      paramIndex += themes.length;
    }

    if (isFilterEmpty) {
      if (userId) {
        query += ` WHERE ufs.user_id IS NOT NULL`;
      } else {
        return NextResponse.json([]);
      }
    } else if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const themeScore = themes
      .map((theme) => `COALESCE(array_position(s.themes, '${theme}'), 1000)`)
      .join(" + ");
    const totalScore = themes.length > 0 ? `(${themeScore})` : "0";

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
    Sentry.captureException(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
