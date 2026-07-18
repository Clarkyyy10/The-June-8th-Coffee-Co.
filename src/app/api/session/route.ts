import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, encodeSession } from "@/lib/demo-auth";
import { verifyAccount } from "@/lib/accounts";
import type { SessionPayload } from "@/lib/demo-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

// Login:
//  - Built-in demo accounts (fixed password).
//  - Approved accounts created via signup + developer approval.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const { email, password, remember } = parsed.data;

  // Only accounts created via signup and approved by the developer can log in.
  let session: SessionPayload | null = null;
  try {
    const account = await verifyAccount(email, password);
    if (account) {
      session = { name: account.name, email: account.email, role: account.role };
    }
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({
    user: { name: session.name, email: session.email, role: session.role },
  });
  res.cookies.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });
  return res;
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
