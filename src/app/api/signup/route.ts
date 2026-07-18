import { NextResponse } from "next/server";
import { z } from "zod";
import { createRequest, emailTaken, isNotConfigured } from "@/lib/accounts";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "MANAGER", "CASHIER", "BARISTA", "KITCHEN"]),
});

// Public: create a pending account request. Requires developer approval before login.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid details";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (await emailTaken(parsed.data.email)) {
      return NextResponse.json(
        { error: "An account or pending request already uses this email" },
        { status: 409 }
      );
    }
    await createRequest(parsed.data);
    return NextResponse.json({
      ok: true,
      message: "Request submitted. A developer will review and approve your account.",
    });
  } catch (err) {
    if (isNotConfigured(err)) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
