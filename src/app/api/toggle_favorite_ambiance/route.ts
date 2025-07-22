/**
 * API route to toggle an ambiance's favorite status for the authenticated user
 *
 * This endpoint handles both adding and removing ambiances from user favorites.
 * It uses Better Auth for authentication and PostgreSQL for data persistence.
 *
 * @param request - POST request containing ambianceId in the body
 * @returns JSON response with the updated favorite status
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import pool from "@/lib/db_client";

// Zod schema for request body validation
const toggleFavoriteAmbianceSchema = z.object({
  ambianceId: z
    .number()
    .int()
    .positive("ambianceId must be a positive integer"),
});

// Type inference from Zod schema
type ToggleFavoriteAmbianceRequest = z.infer<
  typeof toggleFavoriteAmbianceSchema
>;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to save an ambiance in favorites" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate the request body using Zod
    let body: ToggleFavoriteAmbianceRequest;
    try {
      const rawBody = await request.json();
      body = toggleFavoriteAmbianceSchema.parse(rawBody);
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

    const { ambianceId } = body;

    const ambianceExists = await pool.query(
      "SELECT id FROM ambiances WHERE id = $1",
      [ambianceId]
    );

    if (ambianceExists.rows.length === 0) {
      return NextResponse.json(
        { error: "Ambiance not found" },
        { status: 404 }
      );
    }

    const existingFavorite = await pool.query(
      "SELECT id FROM user_has_favorite_ambiances WHERE user_id = $1 AND ambiance_id = $2",
      [userId, ambianceId]
    );

    let isFavorite: boolean;

    if (existingFavorite.rows.length > 0) {
      await pool.query(
        "DELETE FROM user_has_favorite_ambiances WHERE user_id = $1 AND ambiance_id = $2",
        [userId, ambianceId]
      );
      isFavorite = false;
      console.log(
        `User ${userId} removed ambiance ${ambianceId} from favorites`
      );
    } else {
      await pool.query(
        "INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id) VALUES ($1, $2)",
        [userId, ambianceId]
      );
      isFavorite = true;
      console.log(`User ${userId} added ambiance ${ambianceId} to favorites`);
    }

    return NextResponse.json({
      success: true,
      is_favorite: isFavorite,
      ambianceId: ambianceId,
      message: isFavorite
        ? "Ambiance added to favorites successfully"
        : "Ambiance removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error toggling favorite ambiance:", error);
    return NextResponse.json(
      {
        error: "Internal server error - Unable to update favorites",
        success: false,
      },
      { status: 500 }
    );
  }
}
