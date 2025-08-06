// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const GLOBAL_LIMIT = 1000;

// Regex routes needed for dynamic routes
const ROUTE_LIMITS: Array<{ pattern: RegExp; limit: number; name: string }> = [
  {
    pattern: /^\/api\/toggle_favorite_sound$/,
    limit: 200,
    name: "toggle_favorite_sound",
  },
  {
    pattern: /^\/api\/toggle_favorite_ambiance$/,
    limit: 200,
    name: "toggle_favorite_ambiance",
  },
  { pattern: /^\/api\/ambiances\/[^\/]+$/, limit: 100, name: "ambiances_id" },
  {
    pattern: /^\/api\/ambiances\/sounds\/[^\/]+$/,
    limit: 100,
    name: "ambiances_sounds_id",
  },
  { pattern: /^\/api\/ambiances$/, limit: 100, name: "ambiances" },
  { pattern: /^\/api\/auth\/.*$/, limit: 50, name: "auth_all" },
  {
    pattern: /^\/api\/get_search_menu_ambiances$/,
    limit: 200,
    name: "get_search_menu_ambiances",
  },
  {
    pattern: /^\/api\/get_search_menu_sounds$/,
    limit: 200,
    name: "get_search_menu_sounds",
  },
  {
    pattern: /^\/api\/get_themed_ambiance$/,
    limit: 50,
    name: "get_themed_ambiance",
  },
  { pattern: /^\/api\/get_used_sounds$/, limit: 100, name: "get_used_sounds" },
  { pattern: /^\/api\/post_ambiance$/, limit: 100, name: "post_ambiance" },
  { pattern: /^\/api\/sound\/[^\/]+$/, limit: 100, name: "sound_id" },
];

const ipMap = new Map<string, { count: number; startTime: number }>();
const routeMap = new Map<
  string,
  Map<string, { count: number; startTime: number }>
>();

function getRouteLimit(
  pathname: string
): { limit: number; routeKey: string } | null {
  for (const { pattern, limit, name } of ROUTE_LIMITS) {
    if (pattern.test(pathname)) {
      return { limit, routeKey: name };
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const pathname = request.nextUrl.pathname;

  // ---- GLOBAL LIMIT ----
  const globalEntry = ipMap.get(ip);
  if (!globalEntry || now - globalEntry.startTime > RATE_LIMIT_WINDOW) {
    ipMap.set(ip, { count: 1, startTime: now });
  } else {
    if (globalEntry.count >= GLOBAL_LIMIT) {
      return new NextResponse("Too many requests (global limit)", {
        status: 429,
      });
    }
    globalEntry.count += 1;
  }

  // ---- PER-ROUTE LIMIT ----
  const routeConfig = getRouteLimit(pathname);
  if (routeConfig) {
    const { limit: routeLimit, routeKey } = routeConfig;

    if (!routeMap.has(routeKey)) routeMap.set(routeKey, new Map());
    const routeIPMap = routeMap.get(routeKey)!;
    const routeEntry = routeIPMap.get(ip);

    if (!routeEntry || now - routeEntry.startTime > RATE_LIMIT_WINDOW) {
      routeIPMap.set(ip, { count: 1, startTime: now });
    } else {
      if (routeEntry.count >= routeLimit) {
        return new NextResponse("Too many requests (route limit)", {
          status: 429,
        });
      }
      routeEntry.count += 1;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
