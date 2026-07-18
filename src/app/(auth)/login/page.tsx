"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bean, Lock, Mail, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Sign in failed");
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`, { icon: "☕" });
      const from = new URLSearchParams(window.location.search).get("from");
      router.push(from && from !== "/login" ? from : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-coffee-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-float-slow absolute left-[10%] top-[15%] text-8xl opacity-10">☕</div>
          <div className="animate-float-slower absolute right-[12%] top-[45%] text-9xl opacity-10">🫘</div>
          <div className="animate-float-slow absolute bottom-[12%] left-[30%] text-7xl opacity-10">🌱</div>
        </div>
        <div className="relative flex items-center gap-3 text-cream">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream/10 backdrop-blur">
            <Bean className="h-7 w-7 text-caramel" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">The June 8th Coffee Co.</p>
            <p className="text-xs uppercase tracking-[0.2em] text-cream/60">Management System</p>
          </div>
        </div>
        <div className="relative text-cream">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md font-display text-4xl font-bold leading-tight"
          >
            Craft every cup. Run every shift. All in one place.
          </motion.h2>
          <p className="mt-4 max-w-sm text-cream/70">
            The premium platform for managing your café — POS, inventory, orders,
            customers, and insights, beautifully unified.
          </p>
        </div>
        <p className="relative text-xs text-cream/50">
          © {new Date().getFullYear()} The June 8th Coffee Co. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-cream-radial p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coffee-gradient">
              <Bean className="h-6 w-6 text-cream" />
            </div>
            <p className="font-display text-lg font-semibold">June 8th Coffee Co.</p>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your dashboard to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("email")} placeholder="you@june9.co" className="pl-9" />
              </div>
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <button type="button" className="text-xs text-caramel-dark hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-border accent-[var(--color-caramel)]"
              />
              Remember me for 30 days
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-caramel-dark hover:underline">
              Request access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
