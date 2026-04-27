"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, total } = useCart();

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Tu carrito está vacío
        </h1>
        <p className="text-muted-foreground">Explorá los locales y encontrá lo que buscás.</p>
        <Link href="/stores">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
            Ver locales
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        Tu carrito
      </h1>
      <div>
        {items.map((item) => (
          <CartItem key={`${item.product.id}-${item.size}`} item={item} />
        ))}
      </div>
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-primary">{formattedTotal}</span>
      </div>
      <Link href="/checkout">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all"
        >
          Ir a pagar
        </Button>
      </Link>
    </main>
  );
}
