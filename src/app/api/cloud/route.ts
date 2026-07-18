import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, decodeSession } from "@/lib/demo-auth";

interface DocRow {
  id: string;
  owner: string;
  doc: unknown;
  sort?: number;
}

/** The email of the currently signed-in account, used to scope all data. */
async function currentOwner(): Promise<string | null> {
  const store = await cookies();
  const session = decodeSession(store.get(SESSION_COOKIE)?.value);
  return session?.email?.toLowerCase() ?? null;
}

/**
 * Upsert this owner's rows and delete any of *their* rows not in the set.
 * Other accounts' rows are never touched.
 */
async function syncTable(
  client: SupabaseClient,
  table: string,
  owner: string,
  rows: DocRow[]
) {
  if (rows.length > 0) {
    const { error } = await client.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
  }
  const keepIds = rows.map((r) => r.id);
  const { data: existing, error: selErr } = await client
    .from(table)
    .select("id")
    .eq("owner", owner);
  if (selErr) throw new Error(`${table} select: ${selErr.message}`);
  const toDelete = (existing ?? [])
    .map((r) => (r as { id: string }).id)
    .filter((id) => !keepIds.includes(id));
  if (toDelete.length > 0) {
    const { error } = await client.from(table).delete().in("id", toDelete);
    if (error) throw new Error(`${table} delete: ${error.message}`);
  }
}

// Push the signed-in account's full local state to Supabase (tagged by owner).
export async function POST(request: Request) {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }
  const owner = await currentOwner();
  if (!owner) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const s = await request.json();
    const rows = <T extends { id: string }>(
      arr: T[] | undefined,
      extra?: (item: T, i: number) => Partial<DocRow>
    ): DocRow[] =>
      (arr ?? []).map((item, i) => ({
        id: item.id,
        owner,
        doc: item,
        ...(extra ? extra(item, i) : {}),
      }));

    await syncTable(client, "products", owner, rows(s.products));
    await syncTable(client, "orders", owner, rows(s.orders));
    await syncTable(client, "customers", owner, rows(s.customers));
    await syncTable(client, "employees", owner, rows(s.employees));
    await syncTable(client, "stocks", owner, rows(s.stocks));
    await syncTable(
      client,
      "cup_sizes",
      owner,
      rows(s.cupSizes, (_z, i) => ({ sort: i }))
    );
    await syncTable(client, "settings", owner, [
      { id: `settings:${owner}`, owner, doc: s.settings },
    ]);

    return NextResponse.json({ ok: true, owner, syncedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Pull the signed-in account's state from Supabase.
export async function GET() {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }
  const owner = await currentOwner();
  if (!owner) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const [products, orders, customers, employees, stocks, cupSizes, settings] =
      await Promise.all([
        client.from("products").select("doc").eq("owner", owner),
        client.from("orders").select("doc").eq("owner", owner),
        client.from("customers").select("doc").eq("owner", owner),
        client.from("employees").select("doc").eq("owner", owner),
        client.from("stocks").select("doc").eq("owner", owner),
        client
          .from("cup_sizes")
          .select("doc")
          .eq("owner", owner)
          .order("sort", { ascending: true }),
        client
          .from("settings")
          .select("doc")
          .eq("owner", owner)
          .eq("id", `settings:${owner}`)
          .maybeSingle(),
      ]);

    const docs = (res: { data: { doc: unknown }[] | null }) =>
      (res.data ?? []).map((r) => r.doc);

    return NextResponse.json({
      products: docs(products),
      orders: docs(orders),
      customers: docs(customers),
      employees: docs(employees),
      stocks: docs(stocks),
      cupSizes: docs(cupSizes),
      settings: settings.data?.doc ?? null,
      empty:
        (products.data?.length ?? 0) === 0 &&
        (orders.data?.length ?? 0) === 0 &&
        (customers.data?.length ?? 0) === 0 &&
        (employees.data?.length ?? 0) === 0 &&
        (stocks.data?.length ?? 0) === 0 &&
        (cupSizes.data?.length ?? 0) === 0 &&
        !settings.data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pull failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
