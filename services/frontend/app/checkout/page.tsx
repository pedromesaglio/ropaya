"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const DEMO_USER_ID = 1;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  const handleCheckout = async () => {
    if (!address.trim()) {
      setError("Ingresá tu dirección de entrega");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const order = await api.orders.create({
        user_id: DEMO_USER_ID,
        delivery_address: address,
        items: items.map((i) => ({
          product_id: i.product.id,
          size: i.size,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
      });

      const { client_secret } = await api.payments.createIntent(order.id);

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: { token: "tok_visa" },
        },
      });

      if (stripeError) throw new Error(stripeError.message);

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        Checkout
      </h1>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-foreground">Dirección de entrega</Label>
        <Input
          id="address"
          placeholder="Ej: Corrientes 1234, CABA"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-background border-border focus-visible:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <p className="text-muted-foreground text-sm">{items.length} producto(s)</p>
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-primary">{formattedTotal}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Stripe cobra ~2.9% + $0.30 adicional por transacción
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        size="lg"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all disabled:opacity-40 disabled:shadow-none"
      >
        {loading ? "Procesando..." : "Confirmar y pagar"}
      </Button>

      <p className="text-muted-foreground text-xs text-center">
        Pago 100% seguro vía Stripe. Modo test activo.
      </p>
    </main>
  );
}
