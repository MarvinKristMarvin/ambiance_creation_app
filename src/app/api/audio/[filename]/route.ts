// src/app/api/audio/[filename]/route.ts
// API route to limit audio files downloads for unsigned/signed/premium users
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/lib/auth";

// User interface
interface User {
  ip: string;
  status: "unsigned" | "signed" | "premium";
  number_of_downloaded_sounds: number;
  reset_date: Date;
}

// In-memory users list (will be cleared when server restarts)
const users: User[] = [];

// Limits
const MAX_UNSIGNED_DOWNLOADS = 5;
const MAX_SIGNED_DOWNLOADS = 10;
const MAX_PREMIUM_DOWNLOADS = 200;
const RESET_DELAY = 1 * 60 * 1000; // 12 hours

// Helper function to get or create a user (used in both GET and HEAD)
function getOrCreateUser(ip: string): User {
  const existingUser = users.find((user) => user.ip === ip);
  if (existingUser) {
    return existingUser;
  }

  const newUser: User = {
    ip,
    status: "unsigned",
    number_of_downloaded_sounds: 0,
    reset_date: new Date(Date.now() + RESET_DELAY),
  };
  users.push(newUser);
  return newUser;
}

// Shared logic to extract IP from request
function getIP(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return ip;
}

// Handle GET requests for audio files (serves + increments count)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const ip = getIP(req);
  const user = getOrCreateUser(ip);
  // Check if user is really signed in or premium using better auth
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Determine user status
  user.status = "unsigned";
  if (session?.user?.role === "premium") user.status = "premium";
  else if (session?.user) user.status = "signed";

  // Logs
  console.log(`Download limitation total users: ${users.length}`);
  users.forEach((user, index) => {
    console.log(
      `User ${index + 1} (${user.status}) downloaded ${
        user.number_of_downloaded_sounds
      } sounds, IP: ${user.ip}`
    );
  });
  console.log(`User IP: ${ip} fetched audio: ${filename}`);

  // Only increment if the file name is name.mp3 or name_1.mp3 (first sound of a group)
  if (/^.*(?:_1)?\.mp3$/.test(filename)) {
    user.number_of_downloaded_sounds += 1;
  }

  // Serve the file if the user's limit is not reached
  if (
    user.status === "unsigned" &&
    user.number_of_downloaded_sounds > MAX_UNSIGNED_DOWNLOADS
  ) {
    user.number_of_downloaded_sounds = MAX_UNSIGNED_DOWNLOADS;
    return new NextResponse("You have reached your download limit", {
      status: 403,
    });
  } else if (
    user.status === "signed" &&
    user.number_of_downloaded_sounds > MAX_SIGNED_DOWNLOADS
  ) {
    user.number_of_downloaded_sounds = MAX_SIGNED_DOWNLOADS;
    return new NextResponse("You have reached your download limit", {
      status: 403,
    });
  } else if (
    user.status === "premium" &&
    user.number_of_downloaded_sounds > MAX_PREMIUM_DOWNLOADS
  ) {
    user.number_of_downloaded_sounds = MAX_PREMIUM_DOWNLOADS;
    return new NextResponse("You have reached your download limit", {
      status: 403,
    });
  }

  // If authorized to download, serve the file
  const filePath = join(process.cwd(), "public", "audio", filename);
  try {
    const fileBuffer = readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("File not found:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}

// ✅ Handle HEAD requests: do not serve file or increment, just return metadata
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const ip = getIP(req);
  const user = getOrCreateUser(ip); // Create user if not tracked yet

  // Reset the user's download count if the reset date has passed
  if (user.reset_date < new Date()) {
    user.number_of_downloaded_sounds = 0;
    user.reset_date = new Date(Date.now() + RESET_DELAY);
  }
  // Build path to check if the file exists
  const filePath = join(process.cwd(), "public", "audio", filename);

  try {
    // Just check existence of the file
    readFileSync(filePath);

    // ✅ Respond with headers only, no body
    return new NextResponse(null, {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Download-Count": user.number_of_downloaded_sounds.toString(),
      },
    });
  } catch (error) {
    console.error("HEAD request: File not found:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
