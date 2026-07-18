"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bean, Lock, Mail, User, Loader2, CheckCircle2 } from "lucide-react";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "OWNER", label: "Admin (Owner)" },
  { value: "MANAGER", label: "Manager" },
  { value: "CASHIER", label: "Cashier" },
  { value: "BARISTA", label: "Barista" },
  { value: "KITCHEN", label: "Kitchen" },
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "MANAGER", "CASHIER", "BARISTA", "KITCHEN"]),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "OWNER" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Request failed");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-radial p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coffee-gradient">
            <Bean className="h-6 w-6 text-cream" />
          </div>
          <p className="font-display text-lg font-semibold">The June 8th Coffee Co.</p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-border bg-card/60 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 font-display text-xl font-bold">Request submitted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account request is now pending. A developer will review and approve
              it before you can sign in.
            </p>
            <Link href="/login">
              <Button className="mt-6 w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Request an account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an account request. A developer approves it before first login.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...register("name")} placeholder="Juan Dela Cruz" className="pl-9" />
                </div>
                {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...register("email")} placeholder="you@june8.co" className="pl-9" />
                </div>
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Requested role</label>
                <select
                  {...register("role")}
                  className="flex h-10 w-full rounded-lg border border-input bg-card/60 px-3 text-sm outline-none focus-visible:border-caramel"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit request"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-caramel-dark hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
