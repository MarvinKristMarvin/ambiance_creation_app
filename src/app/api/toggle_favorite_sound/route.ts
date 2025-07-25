/**
 * API route to toggle a sound's favorite status for the authenticated user
 *
 * This endpoint handles both adding and removing sounds from user favorites.
 * It uses Better Auth for authentication and PostgreSQL for data persistence.
 *
 * @param request - POST request containing soundId in the body
 * @returns JSON response with the updated favorite status
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import pool from "@/lib/db_client";
import * as Sentry from "@sentry/nextjs";

// Zod schema for request body validation
const toggleFavoriteSchema = z.object({
  soundId: z.number().int().positive("soundId must be a positive integer"),
});

// Type inference from Zod schema
type ToggleFavoriteRequest = z.infer<typeof toggleFavoriteSchema>;

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session using Better Auth
    // This automatically handles JWT token validation and user extraction
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    // Better Auth returns null if no valid session exists
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to save sounds in favorites" },
        { status: 401 }
      );
    }

    // Extract the user ID from the authenticated session
    const userId = session.user.id;

    // Parse and validate the request body using Zod
    let body: ToggleFavoriteRequest;
    try {
      const rawBody = await request.json();
      body = toggleFavoriteSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

    const { soundId } = body;

    // First, verify that the sound actually exists in the database
    // This prevents users from favoriting non-existent sounds
    const soundExists = await pool.query(
      "SELECT id FROM sounds WHERE id = $1",
      [soundId]
    );

    if (soundExists.rows.length === 0) {
      return NextResponse.json({ error: "Sound not found" }, { status: 404 });
    }

    // Check if the sound is already in user's favorites
    // We use the unique constraint (user_id, sound_id) to prevent duplicates
    const existingFavorite = await pool.query(
      "SELECT id FROM user_has_favorite_sounds WHERE user_id = $1 AND sound_id = $2",
      [userId, soundId]
    );

    let isFavorite: boolean;

    if (existingFavorite.rows.length > 0) {
      // Sound is already favorited, so we remove it
      // DELETE operation for unfavoriting
      await pool.query(
        "DELETE FROM user_has_favorite_sounds WHERE user_id = $1 AND sound_id = $2",
        [userId, soundId]
      );
      isFavorite = false;
      console.log(`User ${userId} removed sound ${soundId} from favorites`);
    } else {
      // Sound is not favorited, so we add it
      // INSERT operation for favoriting
      await pool.query(
        "INSERT INTO user_has_favorite_sounds (user_id, sound_id) VALUES ($1, $2)",
        [userId, soundId]
      );
      isFavorite = true;
      console.log(`User ${userId} added sound ${soundId} to favorites`);
    }

    // Return success response with the updated favorite status
    // The frontend uses this to update the star icon appropriately
    return NextResponse.json({
      success: true,
      is_favorite: isFavorite,
      soundId: soundId,
      message: isFavorite
        ? "Sound added to favorites successfully"
        : "Sound removed from favorites successfully",
    });
  } catch (error) {
    // Log the error for debugging purposes
    // In production, you might want to use a proper logging service
    console.error("Error toggling favorite sound:", error);
    Sentry.captureException(error);

    // Return generic error response to avoid exposing internal details
    // This helps maintain security while still providing useful feedback
    return NextResponse.json(
      {
        error: "Internal server error - Unable to update favorites",
        success: false,
      },
      { status: 500 }
    );
  }
}
