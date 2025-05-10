import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get all ambiances
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM ambiances");
    return NextResponse.json(result.rows);
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
