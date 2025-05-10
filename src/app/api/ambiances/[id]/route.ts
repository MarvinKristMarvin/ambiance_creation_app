import { NextResponse } from "next/server";
import pool from "@/lib/db_client";

// Get the ambiance informations
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Extract ID from URL
  const ambianceId = url.pathname.split("/").pop();

  if (!ambianceId || isNaN(Number(ambianceId))) {
    return NextResponse.json({ error: "Invalid ambiance ID" }, { status: 400 });
  }

  try {
    const result = await pool.query(`SELECT * FROM ambiances WHERE id = $1;`, [
      ambianceId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Ambiance not found" },
        { status: 404 }
      );
    }
    // Returns { id, ambiance_name, ... }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
