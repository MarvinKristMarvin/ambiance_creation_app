import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db_client";

/**
 * API route to toggle an ambiance's favorite status for the authenticated user
 *
 * This endpoint handles both adding and removing ambiances from user favorites.
 * It uses Better Auth for authentication and PostgreSQL for data persistence.
 *
 * @param request - POST request containing ambianceId in the body
 * @returns JSON response with the updated favorite status
 */
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
    const body = await request.json();
    const { ambianceId } = body;

    if (!ambianceId || typeof ambianceId !== "number") {
      return NextResponse.json(
        {
          error:
            "Invalid request - ambianceId is required and must be a number",
        },
        { status: 400 }
      );
    }

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
