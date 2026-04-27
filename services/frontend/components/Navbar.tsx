"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingBag, Sun, Moon } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-md bg-background/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Ropaya
        </Link>

        {/* Nav links + actions */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link href="/stores" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Locales
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingBag size={20} className="text-foreground" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
