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
        <div className="h-8 bg-zinc-800 rounded w-1/2" />
        <div className="aspect-[4/5] bg-zinc-800 rounded max-w-sm" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] relative bg-zinc-800 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              Sin foto
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-400 text-sm capitalize">{product.category}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-emerald-400">{formattedPrice}</p>
          </div>

          {product.description && (
            <p className="text-zinc-400">{product.description}</p>
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
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold disabled:opacity-40"
          >
            <ShoppingBag size={18} className="mr-2" />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => router.push("/cart")}
          >
            Ver carrito
          </Button>
        </div>
      </div>
    </main>
  );
}
