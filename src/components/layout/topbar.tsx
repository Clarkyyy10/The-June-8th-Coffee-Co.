"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Bell, Search, Menu, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { LiveClock } from "./live-clock";
import type { SessionPayload } from "@/lib/demo-auth";

function usePageTitle() {
  const pathname = usePathname();
  for (const group of navigation) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return item.label;
      }
    }
  }
  return "Dashboard";
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function Topbar({
  user,
  onMenuClick,
}: {
  user: SessionPayload;
  onMenuClick?: () => void;
}) {
  const title = usePageTitle();
  const router = useRouter();

  const openPalette = () =>
    window.dispatchEvent(new Event("open-command-palette"));

  const signOut = async () => {
    await fetch("/api/session", { method: "DELETE" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:block">
        <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
        <LiveClock />
      </div>

      <button
        onClick={openPalette}
        className="ml-auto flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:border-caramel/50 md:ml-6"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <ThemeToggle />
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 py-1 pl-1 pr-2 transition-colors hover:bg-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-coffee-gradient text-xs font-semibold text-cream">
                {initials(user.name)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-xs font-semibold">
                  {user.name.split(" ")[0]}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {roleLabel(user.role)}
                </span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p>{user.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={signOut}
              className="text-danger focus:bg-danger/10 [&_svg]:text-danger"
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
