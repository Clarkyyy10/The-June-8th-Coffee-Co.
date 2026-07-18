import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";

interface DocRow {
  id: string;
  doc: unknown;
  sort?: number;
}

/** Upsert the given rows and delete any rows in the table not in the set. */
async function syncTable(
  client: SupabaseClient,
  table: string,
  rows: DocRow[]
) {
  if (rows.length > 0) {
    const { error } = await client.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
  }
  const keepIds = rows.map((r) => r.id);
  const { data: existing, error: selErr } = await client.from(table).select("id");
  if (selErr) throw new Error(`${table} select: ${selErr.message}`);
  const toDelete = (existing ?? [])
    .map((r) => (r as { id: string }).id)
    .filter((id) => !keepIds.includes(id));
  if (toDelete.length > 0) {
    const { error } = await client.from(table).delete().in("id", toDelete);
    if (error) throw new Error(`${table} delete: ${error.message}`);
  }
}

// Push the full local state to Supabase.
export async function POST(request: Request) {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  try {
    const s = await request.json();

    await syncTable(client, "products", (s.products ?? []).map((p: { id: string }) => ({ id: p.id, doc: p })));
    await syncTable(client, "orders", (s.orders ?? []).map((o: { id: string }) => ({ id: o.id, doc: o })));
    await syncTable(client, "customers", (s.customers ?? []).map((c: { id: string }) => ({ id: c.id, doc: c })));
    await syncTable(client, "employees", (s.employees ?? []).map((e: { id: string }) => ({ id: e.id, doc: e })));
    await syncTable(client, "stocks", (s.stocks ?? []).map((x: { id: string }) => ({ id: x.id, doc: x })));
    await syncTable(
      client,
      "cup_sizes",
      (s.cupSizes ?? []).map((z: { id: string }, i: number) => ({ id: z.id, doc: z, sort: i }))
    );
    await syncTable(client, "settings", [{ id: "singleton", doc: s.settings }]);

    return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Pull the full state from Supabase.
export async function GET() {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  try {
    const [products, orders, customers, employees, stocks, cupSizes, settings] =
      await Promise.all([
        client.from("products").select("doc"),
        client.from("orders").select("doc"),
        client.from("customers").select("doc"),
        client.from("employees").select("doc"),
        client.from("stocks").select("doc"),
        client.from("cup_sizes").select("doc").order("sort", { ascending: true }),
        client.from("settings").select("doc").eq("id", "singleton").maybeSingle(),
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
        (orders.data?.length ?? 0) === 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pull failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
