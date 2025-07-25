/**
 * API route to get all ambiances
 *
 * @returns JSON response with an array of all ambiances
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db_client";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM ambiances");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
