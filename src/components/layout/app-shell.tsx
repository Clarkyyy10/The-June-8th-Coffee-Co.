"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { UserProvider } from "@/lib/user-context";
import type { SessionPayload } from "@/lib/demo-auth";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionPayload;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProvider user={user}>
    <div className="relative flex h-screen overflow-hidden bg-cream-radial">
      {/* Decorative floating beans */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-float-slow absolute left-[12%] top-[18%] text-6xl opacity-[0.04]">☕</div>
        <div className="animate-float-slower absolute right-[8%] top-[30%] text-7xl opacity-[0.04]">🫘</div>
        <div className="animate-float-slow absolute bottom-[12%] left-[45%] text-5xl opacity-[0.04]">🌱</div>
      </div>

      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-espresso-dark/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
    </UserProvider>
  );
}
