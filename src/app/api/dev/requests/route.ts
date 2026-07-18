import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEV_COOKIE, isValidDeveloperKey } from "@/lib/developer";
import {
  approveRequest,
  isNotConfigured,
  listPending,
  rejectRequest,
} from "@/lib/accounts";

async function requireDeveloper(): Promise<boolean> {
  const store = await cookies();
  return isValidDeveloperKey(store.get(DEV_COOKIE)?.value);
}

// List pending account requests (developer-only).
export async function GET() {
  if (!(await requireDeveloper())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ requests: await listPending() });
  } catch (err) {
    if (isNotConfigured(err)) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "Failed to load requests";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const actionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

// Approve or reject a request (developer-only).
export async function POST(request: Request) {
  if (!(await requireDeveloper())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (parsed.data.action === "approve") {
      await approveRequest(parsed.data.id);
    } else {
      await rejectRequest(parsed.data.id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotConfigured(err)) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
