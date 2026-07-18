import { NextResponse } from "next/server";
import { z } from "zod";
import { DEV_COOKIE, developerKey, isValidDeveloperKey } from "@/lib/developer";

const schema = z.object({ key: z.string().min(1) });

// Developer login: exchange the DEVELOPER_KEY for an httpOnly gate cookie.
export async function POST(request: Request) {
  if (!developerKey()) {
    return NextResponse.json(
      { error: "Developer access is not configured (missing DEVELOPER_KEY)" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !isValidDeveloperKey(parsed.data.key)) {
    return NextResponse.json({ error: "Invalid developer key" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEV_COOKIE, parsed.data.key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return res;
}

// Developer logout.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEV_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
