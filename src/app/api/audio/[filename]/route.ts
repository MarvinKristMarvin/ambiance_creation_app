// src/app/api/audio/[filename]/route.ts
// API route to limit audio files downloads for unsigned/signed/premium users
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// User interface
interface User {
  ip: string;
  status: "unsigned" | "signed" | "premium";
  number_of_downloaded_sounds: number;
}

// In-memory users list (will be cleared when server restarts)
const users: User[] = [];

// Helper function to get or create a user (used in both GET and HEAD)
function getOrCreateUser(ip: string): User {
  const existingUser = users.find((user) => user.ip === ip);
  if (existingUser) {
    return existingUser;
  }

  const newUser: User = {
    ip,
    status: "unsigned",
    number_of_downloaded_sounds: 0, // initialized as 0, only incremented in GET
  };
  users.push(newUser);
  return newUser;
}

// Shared logic to extract IP from request
function getIP(req: NextRequest): string {
  let ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const testIp = req.nextUrl.searchParams.get("testip");
  if (testIp) ip = testIp;
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

  // ✅ Count small sounds (ending by _.mp3 for example) as 0.1
  const isSmallSound = /_\d+\.mp3$/.test(filename);
  const increment = isSmallSound ? 0.1 : 1;
  user.number_of_downloaded_sounds += increment;
  user.number_of_downloaded_sounds =
    Math.round(user.number_of_downloaded_sounds * 10) / 10;

  // Log users info
  console.log(`Download limitation total users: ${users.length}`);
  users.forEach((user, index) => {
    console.log(
      `User ${index + 1} (${user.status}) downloaded ${
        user.number_of_downloaded_sounds
      } sounds, IP: ${user.ip}`
    );
  });
  console.log(`User IP: ${ip} fetched audio: ${filename}`);

  // Serve the file
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

  // Build path to check if the file exists
  const filePath = join(process.cwd(), "public", "audio", filename);

  try {
    // Just check existence of the file
    readFileSync(filePath);

    // ✅ Respond with headers only, no body
    return new NextResponse(null, {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Download-Count": (1 + user.number_of_downloaded_sounds).toString(),
      },
    });
  } catch (error) {
    console.error("HEAD request: File not found:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
