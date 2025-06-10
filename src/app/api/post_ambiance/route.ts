import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const ambianceData = await request.json();

    if (!ambianceData.ambiance_name) {
      return NextResponse.json(
        { error: "Missing required field: ambiance_name" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      let ambianceId;

      if (ambianceData.id) {
        // Update existing ambiance
        const updateAmbianceQuery = `
          UPDATE ambiances 
          SET ambiance_name = $1, author_id = $2 
          WHERE id = $3 AND author_id = $4
          RETURNING id
        `;
        const ambianceResult = await client.query(updateAmbianceQuery, [
          ambianceData.ambiance_name,
          userId,
          ambianceData.id,
          userId,
        ]);

        if (ambianceResult.rows.length === 0) {
          throw new Error("Ambiance not found");
        }

        ambianceId = ambianceData.id;

        await client.query(
          "DELETE FROM ambiances_sounds WHERE ambiance_id = $1",
          [ambianceId]
        );
      } else {
        // Create new ambiance
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

      // Add to favorites (works for both new and updated ambiances)
      const addFavoriteQuery = `
        INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, ambiance_id) DO NOTHING
      `;
      await client.query(addFavoriteQuery, [userId, ambianceId]);

      // Add sounds to ambiance
      if (ambianceData.ambiance_sounds?.length > 0) {
        const insertSoundsQuery = `
          INSERT INTO ambiances_sounds (ambiance_id, sound_id, volume, reverb, direction)
          VALUES ($1, $2, $3, $4, $5)
        `;

        for (const sound of ambianceData.ambiance_sounds) {
          await client.query(insertSoundsQuery, [
            ambianceId,
            sound.sound_id,
            sound.volume ?? 50,
            sound.reverb ?? 0,
            sound.direction ?? 0,
          ]);
        }
      }

      // Get category frequencies
      const aggregateQuery = `
        SELECT 
          s.category::text as category,
          COUNT(*) as category_count
        FROM ambiances_sounds ass
        JOIN sounds s ON s.id = ass.sound_id
        WHERE ass.ambiance_id = $1
        GROUP BY s.category
        ORDER BY COUNT(*) DESC
      `;
      const aggregateResult = await client.query(aggregateQuery, [ambianceId]);

      // Get theme frequencies
      const themesQuery = `
        SELECT 
          unnested_theme::text as theme,
          COUNT(*) as theme_count
        FROM ambiances_sounds ass
        JOIN sounds s ON s.id = ass.sound_id
        LEFT JOIN LATERAL unnest(s.themes) AS unnested_theme ON true
        WHERE ass.ambiance_id = $1 AND unnested_theme IS NOT NULL
        GROUP BY unnested_theme
        ORDER BY COUNT(*) DESC
      `;
      const themesResult = await client.query(themesQuery, [ambianceId]);

      // Prepare categories and themes arrays
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

      // Get the complete ambiance data to return
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
                'direction', ass.direction
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
    return NextResponse.json(
      {
        error: "Failed to save ambiance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
