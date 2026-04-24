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
        <ShoppingBag size={48} className="text-zinc-700 mx-auto" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-zinc-400">Explorá los locales y encontrá lo que buscás.</p>
        <Link href="/stores">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
            Ver locales
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      <div>
        {items.map((item) => (
          <CartItem key={`${item.product.id}-${item.size}`} item={item} />
        ))}
      </div>
      <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-emerald-400">{formattedTotal}</span>
      </div>
      <Link href="/checkout">
        <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
          Ir a pagar
        </Button>
      </Link>
    </main>
  );
}
