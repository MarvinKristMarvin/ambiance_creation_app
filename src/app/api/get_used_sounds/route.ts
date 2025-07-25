/**
 * API route to get multiple sounds by their IDs
 *
 * This endpoint fetches sound details for an array of sound IDs.
 * It uses PostgreSQL's ANY operator for efficient bulk querying.
 *
 * @param request - POST request containing soundIds array in the body
 * @returns JSON response with array of sound objects
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";
import * as Sentry from "@sentry/nextjs";

// Zod schema for request body validation
const getSoundsByIdsSchema = z.object({
  soundIds: z
    .array(z.number().int().positive("Each soundId must be a positive integer"))
    .min(1, "soundIds array cannot be empty")
    .max(100, "Cannot request more than 100 sounds at once"), // Optional: add reasonable limit
});

// Type inference from Zod schema
type GetSoundsByIdsRequest = z.infer<typeof getSoundsByIdsSchema>;

export async function POST(request: Request) {
  try {
    // Parse and validate the request body using Zod
    let body: GetSoundsByIdsRequest;
    try {
      const rawBody = await request.json();
      body = getSoundsByIdsSchema.parse(rawBody);
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

    const { soundIds } = body;

    // Get all sound details for these sound_ids
    const sounds = await pool.query(`SELECT * FROM sounds WHERE id = ANY($1)`, [
      soundIds,
    ]);

    return NextResponse.json(sounds.rows);
  } catch (error) {
    console.error("Error fetching sounds by IDs:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch sounds by IDs" },
      { status: 500 }
    );
  }
}
