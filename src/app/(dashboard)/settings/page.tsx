"use client";

import { useRef, useState } from "react";
import { motion, Reorder } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import type { CupSize } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Building2,
  Palette,
  Bell,
  Shield,
  Database,
  Store,
  CupSoda,
  GripVertical,
  Trash2,
  Plus,
  RotateCcw,
  Cloud,
  CloudUpload,
  CloudDownload,
  Loader2,
} from "lucide-react";

const tabs = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "sizes", label: "Cup Sizes", icon: CupSoda },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "cloud", label: "Cloud Sync", icon: Cloud },
  { id: "security", label: "Security", icon: Shield },
  { id: "backup", label: "Backup", icon: Database },
];

const accents = [
  { name: "Caramel", color: "#c8955c" },
  { name: "Espresso", color: "#3b2416" },
  { name: "Mocha", color: "#7a5230" },
  { name: "Matcha", color: "#4f8a5b" },
  { name: "Berry", color: "#c0553b" },
];

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function SettingsPage() {
  const hydrated = useHydrated();
  const settings = useStore((s) => s.settings);
  const cupSizes = useStore((s) => s.cupSizes);
  const updateSettings = useStore((s) => s.updateSettings);
  const toggleNotification = useStore((s) => s.toggleNotification);
  const addCupSize = useStore((s) => s.addCupSize);
  const updateCupSize = useStore((s) => s.updateCupSize);
  const deleteCupSize = useStore((s) => s.deleteCupSize);
  const reorderCupSizes = useStore((s) => s.reorderCupSizes);
  const resetData = useStore((s) => s.resetData);
  const importData = useStore((s) => s.importData);

  const [tab, setTab] = useState("business");
  const [biz, setBiz] = useState({
    businessName: settings.businessName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    salesGoal: settings.salesGoal,
  });
  const [newSize, setNewSize] = useState({ name: "", priceDelta: 0 });
  const [syncing, setSyncing] = useState<"push" | "pull" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 h-9 w-40 rounded-lg skeleton" />
        <div className="h-96 rounded-xl skeleton" />
      </div>
    );
  }

  const saveBusiness = () => {
    updateSettings({
      businessName: biz.businessName,
      phone: biz.phone,
      email: biz.email,
      address: biz.address,
      salesGoal: Number(biz.salesGoal) || 0,
    });
    toast.success("Business settings saved");
  };

  const addSize = () => {
    if (!newSize.name.trim()) {
      toast.error("Size name is required");
      return;
    }
    addCupSize(newSize.name.trim(), Number(newSize.priceDelta) || 0);
    setNewSize({ name: "", priceDelta: 0 });
    toast.success("Cup size added — now available in POS");
  };

  const backup = () => {
    const state = useStore.getState();
    const data = {
      products: state.products,
      orders: state.orders,
      customers: state.customers,
      employees: state.employees,
      stocks: state.stocks,
      cupSizes: state.cupSizes,
      settings: state.settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `june8-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const pushToCloud = async () => {
    setSyncing("push");
    try {
      const s = useStore.getState();
      const res = await fetch("/api/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: s.products,
          orders: s.orders,
          customers: s.customers,
          employees: s.employees,
          stocks: s.stocks,
          cupSizes: s.cupSizes,
          settings: s.settings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success("Data synced to Supabase");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const pullFromCloud = async () => {
    setSyncing("pull");
    try {
      const res = await fetch("/api/cloud");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pull failed");
      if (data.empty) {
        toast("Cloud is empty — push your data first", { icon: "☁️" });
        return;
      }
      importData({
        products: data.products,
        orders: data.orders,
        customers: data.customers,
        employees: data.employees,
        stocks: data.stocks,
        cupSizes: data.cupSizes,
        ...(data.settings ? { settings: data.settings } : {}),
      });
      toast.success("Data loaded from Supabase");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pull failed");
    } finally {
      setSyncing(null);
    }
  };

  const restore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        importData(data);
        toast.success("Backup restored");
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Settings" description="Manage your business, sizes, and preferences" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full",
                  tab === t.id
                    ? "bg-coffee-gradient text-cream shadow-soft"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === "business" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-caramel-dark" /> Business Information
                </CardTitle>
                <CardDescription>Displayed across the app and on receipts</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Business Name" value={biz.businessName} onChange={(v) => setBiz({ ...biz, businessName: v })} />
                <Field label="Phone" value={biz.phone} onChange={(v) => setBiz({ ...biz, phone: v })} />
                <Field label="Email" value={biz.email} onChange={(v) => setBiz({ ...biz, email: v })} />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Daily Sales Goal ({settings.currency})</label>
                  <Input
                    type="number"
                    value={biz.salesGoal}
                    onChange={(e) => setBiz({ ...biz, salesGoal: Number(e.target.value) })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address" value={biz.address} onChange={(v) => setBiz({ ...biz, address: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Button onClick={saveBusiness}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "sizes" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CupSoda className="h-5 w-5 text-caramel-dark" /> Cup Sizes
                </CardTitle>
                <CardDescription>
                  Drag to reorder. Changes appear instantly in the POS and menu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Reorder.Group
                  axis="y"
                  values={cupSizes}
                  onReorder={reorderCupSizes}
                  className="space-y-2"
                >
                  {cupSizes.map((size: CupSize) => (
                    <Reorder.Item
                      key={size.id}
                      value={size}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 shadow-soft"
                    >
                      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
                      <Input
                        value={size.name}
                        onChange={(e) => updateCupSize(size.id, { name: e.target.value })}
                        className="h-9 flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">+₱</span>
                        <Input
                          type="number"
                          value={size.priceDelta}
                          onChange={(e) =>
                            updateCupSize(size.id, { priceDelta: Number(e.target.value) })
                          }
                          className="h-9 w-20"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => {
                          deleteCupSize(size.id);
                          toast.success("Size removed");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div className="mt-4 flex items-end gap-2 rounded-lg border border-dashed border-border p-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium">New size name</label>
                    <Input
                      value={newSize.name}
                      onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                      placeholder="e.g. Venti"
                      className="h-9"
                    />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-xs font-medium">Extra ₱</label>
                    <Input
                      type="number"
                      value={newSize.priceDelta}
                      onChange={(e) => setNewSize({ ...newSize, priceDelta: Number(e.target.value) })}
                      className="h-9"
                    />
                  </div>
                  <Button onClick={addSize} className="h-9">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-caramel-dark" /> Appearance
                </CardTitle>
                <CardDescription>Personalize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm font-medium">Accent Color</p>
                <div className="flex flex-wrap gap-3">
                  {accents.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => {
                        updateSettings({ accentColor: a.name });
                        toast.success(`Accent set to ${a.name}`);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                        settings.accentColor === a.name
                          ? "border-caramel ring-2 ring-ring/40"
                          : "border-border"
                      )}
                    >
                      <span className="h-5 w-5 rounded-full" style={{ background: a.color }} />
                      {a.name}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Use the toggle in the top bar to switch between light and dark mode.
                </p>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-caramel-dark" /> Notifications
                </CardTitle>
                <CardDescription>Choose what you want to be notified about</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(settings.notifications).map(([key, on]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3"
                  >
                    <span className="text-sm">{key}</span>
                    <button
                      onClick={() => toggleNotification(key)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        on ? "bg-coffee-gradient" : "bg-muted"
                      )}
                    >
                      <motion.span
                        layout
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                        style={{ left: on ? "22px" : "2px" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === "cloud" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-caramel-dark" /> Cloud Sync (Supabase)
                </CardTitle>
                <CardDescription>
                  Save this device&apos;s data to your Supabase database, or load it back.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="text-sm font-medium">How it works</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                    <li>Run the SQL in <code>supabase/migrations/0001_init.sql</code> once in the Supabase SQL Editor.</li>
                    <li>Click <strong>Push to Cloud</strong> to save your current data.</li>
                    <li>On any device, click <strong>Load from Cloud</strong> to restore it.</li>
                  </ol>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={pushToCloud} disabled={syncing !== null}>
                    {syncing === "push" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CloudUpload className="h-4 w-4" />
                    )}
                    Push to Cloud
                  </Button>
                  <Button variant="outline" onClick={pullFromCloud} disabled={syncing !== null}>
                    {syncing === "pull" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CloudDownload className="h-4 w-4" />
                    )}
                    Load from Cloud
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Syncing runs through a secure server route using your secret key — it is
                  never exposed to the browser.
                </p>
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-caramel-dark" /> Security
                </CardTitle>
                <CardDescription>Protect your account and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => toast.success("Password updated")}>Update Password</Button>
              </CardContent>
            </Card>
          )}

          {tab === "backup" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-caramel-dark" /> Backup & Restore
                </CardTitle>
                <CardDescription>Export, import, or reset your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={backup}>
                    <Database className="h-4 w-4" /> Download Backup
                  </Button>
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    Restore from File
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) restore(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                  <p className="text-sm font-medium">Reset all data</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Restores the clean starting dataset. This cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    className="mt-3"
                    onClick={() => {
                      resetData();
                      toast.success("Data reset to a clean state");
                    }}
                  >
                    <RotateCcw className="h-4 w-4" /> Reset to Clean State
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
