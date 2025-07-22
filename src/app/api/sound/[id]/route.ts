/**
 * API route to get a specific sound by ID
 *
 * @param request - GET request with soundId in the URL path
 * @returns JSON response with the sound data
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db_client";

// Zod schema for URL parameter validation
const getSoundParamsSchema = z.object({
  soundId: z
    .string()
    .regex(/^\d+$/, "soundId must be a valid number")
    .transform(Number),
});

// Type inference from Zod schema
type GetSoundParams = z.infer<typeof getSoundParamsSchema>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const soundIdParam = url.pathname.split("/").pop(); // Extract ID from URL

    // Validate the URL parameter using Zod
    let params: GetSoundParams;
    try {
      params = getSoundParamsSchema.parse({ soundId: soundIdParam });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid sound ID",
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

    const { soundId } = params;

    const result = await pool.query("SELECT * FROM sounds WHERE id = $1", [
      soundId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Sound not found" }, { status: 404 });
    }

    const rawSound = result.rows[0];
    const parsedSound = {
      ...rawSound,
      direction:
        rawSound.direction !== null ? parseFloat(rawSound.direction) : 0,
      speed: rawSound.speed !== null ? parseFloat(rawSound.speed) : 1,
      reverb_duration:
        rawSound.reverb_duration !== null
          ? parseFloat(rawSound.reverb_duration)
          : 0,
      // add other conversions as needed
    };

    return NextResponse.json([parsedSound]);
  } catch (error) {
    // Send the error message on the console
    console.error("Database error:", error);
    // Send the error to the front
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
