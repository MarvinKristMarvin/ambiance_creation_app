/**
 * API route to save or update an ambiance
 *
 * This endpoint handles creating new ambiances or updating existing ones.
 * It uses Better Auth for authentication and PostgreSQL with transactions.
 *
 * @param request - POST request containing ambiance data
 * @returns JSON response with the saved ambiance data
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";

// Zod schema for ambiance sound validation
const ambianceSoundSchema = z.object({
  sound_id: z.number().int().positive("sound_id must be a positive integer"),
  volume: z.number().min(0).max(100).optional().default(50),
  reverb: z.number().min(0).optional().default(0),
  direction: z.number().optional().default(0),
  speed: z.number().positive("speed must be positive").optional().default(1),
  reverb_duration: z.number().min(0).optional().default(0),
  repeat_delay: z
    .union([z.tuple([z.number(), z.number()]), z.null()])
    .optional()
    .default(null),
  low: z.number().optional().default(0),
  mid: z.number().optional().default(0),
  high: z.number().optional().default(0),
  low_cut: z
    .number()
    .positive("low_cut must be positive")
    .optional()
    .default(20),
  high_cut: z
    .number()
    .positive("high_cut must be positive")
    .optional()
    .default(20000),
});

// Zod schema for the main request body
const saveAmbianceSchema = z.object({
  ambiance_name: z
    .string()
    .min(1, "ambiance_name is required and cannot be empty"),
  ambiance_sounds: z.array(ambianceSoundSchema).optional().default([]),
});

// Type inference from Zod schemas
type SaveAmbianceRequest = z.infer<typeof saveAmbianceSchema>;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: "Please log in to save an ambiance in favorites" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate the request body using Zod
    let ambianceData: SaveAmbianceRequest;
    try {
      const rawBody = await request.json();
      ambianceData = saveAmbianceSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        Sentry.captureException(error);
        return NextResponse.json(
          {
            error: "Invalid request data",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if ambiance with same name exists
      const existingAmbianceQuery = `
        SELECT a.id, a.author_id FROM ambiances a
        WHERE a.ambiance_name = $1
      `;
      const existingAmbianceResult = await client.query(existingAmbianceQuery, [
        ambianceData.ambiance_name,
      ]);

      let ambianceId;

      if (
        existingAmbianceResult.rows.length > 0 &&
        existingAmbianceResult.rows[0].author_id === userId
      ) {
        // User is author → update
        ambianceId = existingAmbianceResult.rows[0].id;

        const updateAmbianceQuery = `
          UPDATE ambiances 
          SET ambiance_name = $1
          WHERE id = $2 AND author_id = $3
          RETURNING id
        `;
        const ambianceResult = await client.query(updateAmbianceQuery, [
          ambianceData.ambiance_name,
          ambianceId,
          userId,
        ]);

        if (ambianceResult.rows.length === 0) {
          throw new Error("Ambiance not found or not authorized to update");
        }

        await client.query(
          "DELETE FROM ambiances_sounds WHERE ambiance_id = $1",
          [ambianceId]
        );
      } else {
        // New ambiance (either no match or match with different author)
        const insertAmbianceQuery = `
          INSERT INTO ambiances (ambiance_name, author_id) 
          VALUES ($1, $2) 
          RETURNING id
        `;
        const ambianceResult = await client.query(insertAmbianceQuery, [
          ambianceData.ambiance_name,
          userId,
        ]);
        ambianceId = ambianceResult.rows[0].id;
      }

      // Add to favorites
      const addFavoriteQuery = `
        INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, ambiance_id) DO NOTHING
      `;
      await client.query(addFavoriteQuery, [userId, ambianceId]);

      // Add sounds
      if (ambianceData.ambiance_sounds.length > 0) {
        const insertSoundsQuery = `
          INSERT INTO ambiances_sounds (
            ambiance_id, sound_id, volume, reverb, direction, speed,
            reverb_duration, repeat_delay, low, mid, high, low_cut, high_cut
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;

        for (const sound of ambianceData.ambiance_sounds) {
          await client.query(insertSoundsQuery, [
            ambianceId,
            sound.sound_id,
            sound.volume,
            sound.reverb,
            sound.direction,
            sound.speed,
            sound.reverb_duration,
            sound.repeat_delay,
            sound.low,
            sound.mid,
            sound.high,
            sound.low_cut,
            sound.high_cut,
          ]);
        }
      }

      // Get category frequencies
      const aggregateQuery = `
        SELECT s.category::text as category, COUNT(*) as category_count
        FROM ambiances_sounds ass
        JOIN sounds s ON s.id = ass.sound_id
        WHERE ass.ambiance_id = $1
        GROUP BY s.category
        ORDER BY COUNT(*) DESC
      `;
      const aggregateResult = await client.query(aggregateQuery, [ambianceId]);

      // Get theme frequencies
      const themesQuery = `
        SELECT unnested_theme::text as theme, COUNT(*) as theme_count
        FROM ambiances_sounds ass
        JOIN sounds s ON s.id = ass.sound_id
        LEFT JOIN LATERAL unnest(s.themes) AS unnested_theme ON true
        WHERE ass.ambiance_id = $1 AND unnested_theme IS NOT NULL
        GROUP BY unnested_theme
        ORDER BY COUNT(*) DESC
      `;
      const themesResult = await client.query(themesQuery, [ambianceId]);

      // Build arrays
      const sortedCategories = aggregateResult.rows.map((row) => row.category);
      const sortedThemes = themesResult.rows.map((row) => row.theme);

      const categoriesArrayLiteral =
        sortedCategories.length > 0
          ? `{${sortedCategories.map((cat) => `"${cat}"`).join(",")}}`
          : "{}";
      const themesArrayLiteral =
        sortedThemes.length > 0
          ? `{${sortedThemes.map((theme) => `"${theme}"`).join(",")}}`
          : "{}";

      // Update ambiance with categories and themes
      await client.query(
        `
          UPDATE ambiances
          SET categories = $1::category[], themes = $2::theme[]
          WHERE id = $3
        `,
        [categoriesArrayLiteral, themesArrayLiteral, ambianceId]
      );

      await client.query("COMMIT");

      // Return full ambiance
      const selectQuery = `
        SELECT 
          a.id,
          a.ambiance_name,
          a.author_id,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ass.id,
                'sound_id', ass.sound_id,
                'volume', ass.volume,
                'reverb', ass.reverb,
                'direction', ass.direction,
                'speed', ass.speed,
                'reverb_duration', ass.reverb_duration,
                'repeat_delay', ass.repeat_delay,
                'low', ass.low,
                'mid', ass.mid,
                'high', ass.high,
                'low_cut', ass.low_cut,
                'high_cut', ass.high_cut
              ) ORDER BY ass.id
            ) FILTER (WHERE ass.id IS NOT NULL),
            '[]'::json
          ) as ambiance_sounds
        FROM ambiances a
        LEFT JOIN ambiances_sounds ass ON a.id = ass.ambiance_id
        WHERE a.id = $1
        GROUP BY a.id, a.ambiance_name, a.author_id
      `;

      const result = await client.query(selectQuery, [ambianceId]);

      return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving ambiance:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      {
        error: "Failed to save ambiance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
