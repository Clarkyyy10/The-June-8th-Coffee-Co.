import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-radial text-center">
      <span className="text-7xl">☕</span>
      <h1 className="mt-6 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        We couldn&apos;t brew that page. It may have been moved or never existed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
