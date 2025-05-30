import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import { auth } from "@/lib/auth";

// Create a new ambiance or update an existing one when user saves his current ambiance
export async function POST(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const ambianceData = await request.json();

    // Validate required fields (author_id is now set from session)
    if (!ambianceData.ambiance_name) {
      return NextResponse.json(
        { error: "Missing required field: ambiance_name" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Start transaction
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
          userId, // Ensure user can only update their own ambiances
        ]);

        if (ambianceResult.rows.length === 0) {
          throw new Error("Ambiance not found");
        }

        ambianceId = ambianceData.id;

        // Delete existing ambiance_sounds for this ambiance
        await client.query(
          "DELETE FROM ambiances_sounds WHERE ambiance_id = $1",
          [ambianceId]
        );
      } else {
        // Insert new ambiance
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

      // Insert ambiance_sounds if they exist
      if (
        ambianceData.ambiance_sounds &&
        ambianceData.ambiance_sounds.length > 0
      ) {
        const insertSoundsQuery = `
          INSERT INTO ambiances_sounds (ambiance_id, sound_id, volume, reverb, direction)
          VALUES ($1, $2, $3, $4, $5)
        `;

        for (const sound of ambianceData.ambiance_sounds) {
          await client.query(insertSoundsQuery, [
            ambianceId,
            sound.sound_id,
            sound.volume || 50, // Default volume if not provided
            sound.reverb || 0, // Default reverb if not provided
            sound.direction || 0, // Default direction if not provided
          ]);
        }
      }

      // Commit transaction
      await client.query("COMMIT");

      // Fetch the complete ambiance with sounds to return
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

      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      // Rollback transaction on error
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
