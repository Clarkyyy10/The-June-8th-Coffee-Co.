"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, LogOut, Check, X, Inbox } from "lucide-react";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function DeveloperPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const res = await fetch("/api/dev/requests");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Failed to load requests");
      setAuthed(false);
      return;
    }
    setRequests(data.requests ?? []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Invalid developer key");
        return;
      }
      setKey("");
      await loadRequests();
      toast.success("Developer access granted");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/dev/session", { method: "DELETE" });
    setAuthed(false);
    setRequests([]);
  };

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/dev/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Action failed");
        return;
      }
      setRequests((rs) => rs.filter((r) => r.id !== id));
      toast.success(action === "approve" ? "Account approved" : "Request rejected");
    } finally {
      setBusyId(null);
    }
  };

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-radial">
        <Loader2 className="h-6 w-6 animate-spin text-caramel" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-radial p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coffee-gradient">
              <ShieldCheck className="h-6 w-6 text-cream" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Developer Access</h1>
              <p className="text-xs text-muted-foreground">Approve account requests</p>
            </div>
          </div>

          <div className="mt-6 space-y-1.5">
            <label className="text-sm font-medium">Developer key</label>
            <Input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && key && login()}
              placeholder="Enter your DEVELOPER_KEY"
            />
          </div>

          <Button className="mt-4 w-full" onClick={login} disabled={loading || !key}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-cream-radial px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coffee-gradient">
            <ShieldCheck className="h-6 w-6 text-cream" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Account Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Approve or reject pending sign-ups.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" /> Lock
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium">No pending requests</p>
          <p className="text-sm text-muted-foreground">
            New account requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.name}</p>
                  <Badge>{r.role.charAt(0) + r.role.slice(1).toLowerCase()}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.email}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Requested {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => decide(r.id, "approve")}
                  disabled={busyId === r.id}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => decide(r.id, "reject")}
                  disabled={busyId === r.id}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
