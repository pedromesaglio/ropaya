"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api, type Product } from "@/lib/api";
import { SizeTable } from "@/components/SizeTable";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    api.products.get(Number(id)).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="aspect-[4/5] bg-muted rounded max-w-sm" />
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] relative bg-muted rounded-2xl overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sin foto
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm capitalize tracking-widest uppercase text-xs">
              {product.category}
            </p>
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h1>
            <p className="text-4xl font-extrabold text-primary">{formattedPrice}</p>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <SizeTable
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingBag size={18} className="mr-2" />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-muted rounded-xl"
            onClick={() => router.push("/cart")}
          >
            Ver carrito
          </Button>
        </div>
      </div>
    </main>
  );
}
