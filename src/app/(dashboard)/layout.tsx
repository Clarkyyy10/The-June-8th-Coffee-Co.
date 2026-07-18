import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SESSION_COOKIE, decodeSession } from "@/lib/demo-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const session = decodeSession(store.get(SESSION_COOKIE)?.value);

  if (!session) redirect("/login");

  return <AppShell user={session}>{children}</AppShell>;
}
