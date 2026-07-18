"use client";

import { createContext, useContext } from "react";
import type { SessionPayload } from "./demo-auth";

const UserContext = createContext<SessionPayload | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/** Returns the current authenticated user, or null if unavailable. */
export function useCurrentUser() {
  return useContext(UserContext);
}
