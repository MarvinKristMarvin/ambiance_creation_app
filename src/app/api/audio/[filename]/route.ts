// src/app/api/audio/[filename]/route.ts
// API route to limit audio files downloads for unsigned/signed/premium users

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/lib/auth";
import pool from "@/lib/db_client";

// Types
interface IpRow {
  id: number;
  ip_address: string;
  number_of_sounds_downloaded: number;
  reset_date: Date;
}

// Limits (adjust if you want different numbers)
const MAX_UNSIGNED_DOWNLOADS = 5;
const MAX_SIGNED_DOWNLOADS = 10;
const MAX_PREMIUM_DOWNLOADS = 200;

// Reset delay (in ms)
const RESET_DELAY = 1 * 60 * 1000;

// Shared logic to extract IP from request
function getIP(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return ip;
}

/**
 * Helper: returns limit number based on user status string.
 */
function getLimitForStatus(status: "unsigned" | "signed" | "premium") {
  if (status === "premium") return MAX_PREMIUM_DOWNLOADS;
  if (status === "signed") return MAX_SIGNED_DOWNLOADS;
  return MAX_UNSIGNED_DOWNLOADS;
}

/**
 * Attempt to increment the IP count by 1 atomically (only when shouldIncrement===true).
 * If shouldIncrement is false, it only returns the current count (after reset logic).
 *
 * Returns: { allowed: boolean, number_of_sounds_downloaded: number }
 */
async function tryIncrementIpCount(
  ip: string,
  shouldIncrement: boolean,
  limit: number
): Promise<{ allowed: boolean; number_of_sounds_downloaded: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the row for this IP (or create it if missing)
    let selectRes = await client.query(
      `SELECT id, ip_address, number_of_sounds_downloaded, reset_date
       FROM ips_download_limits
       WHERE ip_address = $1
       FOR UPDATE`,
      [ip]
    );

    const now = new Date();

    if (selectRes.rowCount === 0) {
      // Create initial row
      const newReset = new Date(Date.now() + RESET_DELAY);
      const insertRes = await client.query(
        `INSERT INTO ips_download_limits (ip_address, number_of_sounds_downloaded, reset_date)
         VALUES ($1, $2, $3)
         RETURNING id, ip_address, number_of_sounds_downloaded, reset_date`,
        [ip, 0, newReset]
      );
      selectRes = insertRes;
    }

    const row = selectRes.rows[0] as IpRow;

    // If reset_date passed -> reset counter and reset_date
    if (row.reset_date && new Date(row.reset_date) < now) {
      const newReset = new Date(Date.now() + RESET_DELAY);
      await client.query(
        `UPDATE ips_download_limits
         SET number_of_sounds_downloaded = $2, reset_date = $3
         WHERE ip_address = $1`,
        [ip, 0, newReset]
      );
      row.number_of_sounds_downloaded = 0;
    }

    const current = row.number_of_sounds_downloaded;

    if (!shouldIncrement) {
      // HEAD request or uncounted GET: return current number without changing it
      await client.query("COMMIT");
      return { allowed: true, number_of_sounds_downloaded: current };
    }

    // We are asked to increment. Check limit before incrementing.
    if (current + 1 > limit) {
      // Not allowed — cap value in DB at limit (optional, keeps DB consistent)
      await client.query(
        `UPDATE ips_download_limits
         SET number_of_sounds_downloaded = $2
         WHERE ip_address = $1`,
        [ip, limit]
      );

      await client.query("COMMIT");
      return { allowed: false, number_of_sounds_downloaded: limit };
    }

    // Allowed: increment and persist
    const newCount = current + 1;
    await client.query(
      `UPDATE ips_download_limits
       SET number_of_sounds_downloaded = $2
       WHERE ip_address = $1`,
      [ip, newCount]
    );

    await client.query("COMMIT");
    return { allowed: true, number_of_sounds_downloaded: newCount };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// GET handler: serve file and (conditionally) increment the DB counter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const ip = getIP(req);

  // Determine user status using auth.session (same idea as your original code)
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  let status: "unsigned" | "signed" | "premium" = "unsigned";
  if (session?.user?.role === "premium") status = "premium";
  else if (session?.user) status = "signed";

  const limit = getLimitForStatus(status);

  // Build path to file and ensure it exists BEFORE we increment.
  const filePath = join(process.cwd(), "public", "audio", filename);
  let fileBuffer: Buffer;
  try {
    fileBuffer = readFileSync(filePath);
  } catch (err) {
    console.error("File not found:", err);
    return new NextResponse("File not found", { status: 404 });
  }

  // Decide whether this filename triggers counting (if file name != xxx_2.mp3, xxx_3.mp3, etc.)
  const shouldCount = /^(.*_1\.mp3|.*(?<!_\d)\.mp3)$/.test(filename);
  try {
    if (shouldCount) {
      // atomic check + increment
      const { allowed, number_of_sounds_downloaded } =
        await tryIncrementIpCount(ip, true, limit);

      if (!allowed) {
        // Rate-limited
        return new NextResponse("You have reached your download limit", {
          status: 403,
          headers: {
            "X-Download-Count": String(number_of_sounds_downloaded),
          },
        });
      }

      // If allowed, return file with headers including current count
      const uint8Array = new Uint8Array(fileBuffer);
      return new NextResponse(uint8Array, {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Download-Count": String(number_of_sounds_downloaded),
        },
      });
    } else {
      // Not a counted file — just serve it; still return current count (no increment).
      const { number_of_sounds_downloaded } = await tryIncrementIpCount(
        ip,
        false,
        limit
      );
      const uint8Array = new Uint8Array(fileBuffer);
      return new NextResponse(uint8Array, {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Download-Count": String(number_of_sounds_downloaded),
        },
      });
    }
  } catch (error) {
    console.error("GET: DB error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// HEAD handler: only return headers and current count. DO NOT increment.
export async function HEAD(req: NextRequest) {
  const ip = getIP(req);

  // Determine session status so we can compute the correct limit and show counts
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  let status: "unsigned" | "signed" | "premium" = "unsigned";
  if (session?.user?.role === "premium") status = "premium";
  else if (session?.user) status = "signed";

  const limit = getLimitForStatus(status);

  try {
    const { number_of_sounds_downloaded } = await tryIncrementIpCount(
      ip,
      false, // do not increment for HEAD
      limit
    );

    return new NextResponse(null, {
      headers: {
        "X-Download-Count": String(number_of_sounds_downloaded),
      },
    });
  } catch (error) {
    console.error("HEAD: DB error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// // src/app/api/audio/[filename]/route.ts
// // API route to limit audio files downloads for unsigned/signed/premium users
// import { NextRequest, NextResponse } from "next/server";
// import { readFileSync } from "fs";
// import { join } from "path";
// import { auth } from "@/lib/auth";
// import pool from "@/lib/db_client";

// // User interface
// interface User {
//   ip: string;
//   status: "unsigned" | "signed" | "premium";
//   number_of_downloaded_sounds: number;
//   reset_date: Date;
// }

// // In-memory users list (will be cleared when server restarts)
// const users: User[] = [];

// // Limits
// const MAX_UNSIGNED_DOWNLOADS = 5;
// const MAX_SIGNED_DOWNLOADS = 10;
// const MAX_PREMIUM_DOWNLOADS = 200;
// const RESET_DELAY = 1 * 60 * 1000; // 12 hours

// // Helper function to get or create a user (used in both GET and HEAD)
// function getOrCreateUser(ip: string): User {
//   const existingUser = users.find((user) => user.ip === ip);
//   if (existingUser) {
//     return existingUser;
//   }

//   const newUser: User = {
//     ip,
//     status: "unsigned",
//     number_of_downloaded_sounds: 0,
//     reset_date: new Date(Date.now() + RESET_DELAY),
//   };
//   users.push(newUser);
//   return newUser;
// }

// // Shared logic to extract IP from request
// function getIP(req: NextRequest): string {
//   const ip =
//     req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
//   return ip;
// }

// // Handle GET requests for audio files (serves + increments count)
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ filename: string }> }
// ) {
//   const { filename } = await params;
//   const ip = getIP(req);
//   const user = getOrCreateUser(ip);
//   // Check if user is really signed in or premium using better auth
//   const session = await auth.api.getSession({
//     headers: req.headers,
//   });

//   // Determine user status
//   user.status = "unsigned";
//   if (session?.user?.role === "premium") user.status = "premium";
//   else if (session?.user) user.status = "signed";

//   // Logs
//   console.log(`Download limitation total users: ${users.length}`);
//   users.forEach((user, index) => {
//     console.log(
//       `User ${index + 1} (${user.status}) downloaded ${
//         user.number_of_downloaded_sounds
//       } sounds, IP: ${user.ip}`
//     );
//   });
//   console.log(`User IP: ${ip} fetched audio: ${filename}`);

//   // Only increment if the file name is name.mp3 or name_1.mp3 (first sound of a group)
//   if (/^.*(?:_1)?\.mp3$/.test(filename)) {
//     user.number_of_downloaded_sounds += 1;
//   }

//   // Serve the file if the user's limit is not reached
//   if (
//     user.status === "unsigned" &&
//     user.number_of_downloaded_sounds > MAX_UNSIGNED_DOWNLOADS
//   ) {
//     user.number_of_downloaded_sounds = MAX_UNSIGNED_DOWNLOADS;
//     return new NextResponse("You have reached your download limit", {
//       status: 403,
//     });
//   } else if (
//     user.status === "signed" &&
//     user.number_of_downloaded_sounds > MAX_SIGNED_DOWNLOADS
//   ) {
//     user.number_of_downloaded_sounds = MAX_SIGNED_DOWNLOADS;
//     return new NextResponse("You have reached your download limit", {
//       status: 403,
//     });
//   } else if (
//     user.status === "premium" &&
//     user.number_of_downloaded_sounds > MAX_PREMIUM_DOWNLOADS
//   ) {
//     user.number_of_downloaded_sounds = MAX_PREMIUM_DOWNLOADS;
//     return new NextResponse("You have reached your download limit", {
//       status: 403,
//     });
//   }

//   // If authorized to download, serve the file
//   const filePath = join(process.cwd(), "public", "audio", filename);
//   try {
//     const fileBuffer = readFileSync(filePath);
//     // Convert Buffer to Uint8Array to satisfy NextResponse type requirements
//     const uint8Array = new Uint8Array(fileBuffer);

//     return new NextResponse(uint8Array, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//       },
//     });
//   } catch (error) {
//     console.error("File not found:", error);
//     return new NextResponse("File not found", { status: 404 });
//   }
// }

// // ✅ Handle HEAD requests: do not serve file or increment, just return metadata
// export async function HEAD(
//   req: NextRequest,
//   { params }: { params: Promise<{ filename: string }> }
// ) {
//   const { filename } = await params;
//   const ip = getIP(req);
//   const user = getOrCreateUser(ip); // Create user if not tracked yet

//   // Reset the user's download count if the reset date has passed
//   if (user.reset_date < new Date()) {
//     user.number_of_downloaded_sounds = 0;
//     user.reset_date = new Date(Date.now() + RESET_DELAY);
//   }
//   // Build path to check if the file exists
//   const filePath = join(process.cwd(), "public", "audio", filename);

//   try {
//     // Just check existence of the file
//     readFileSync(filePath);

//     // ✅ Respond with headers only, no body
//     return new NextResponse(null, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "X-Download-Count": user.number_of_downloaded_sounds.toString(),
//       },
//     });
//   } catch (error) {
//     console.error("HEAD request: File not found:", error);
//     return new NextResponse("File not found", { status: 404 });
//   }
// }
