import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get searched sounds basic information to display in the search sound menu
export async function GET() {
  try {
    const result = await pool.query("SELECT id, ambiance_name FROM ambiances");
    return NextResponse.json(result.rows);
  } catch (error) {
    // Send the error message on the console
    console.error(
      "Database error when getting ambiances basic informations:",
      error
    );
    // Send the error to the front
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
