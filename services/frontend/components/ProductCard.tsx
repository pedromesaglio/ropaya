import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer overflow-hidden">
        <div className="aspect-[4/5] relative bg-zinc-800">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              Sin foto
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-zinc-50 font-medium text-sm line-clamp-1">{product.name}</p>
          <p className="text-emerald-400 font-bold">{formattedPrice}</p>
          <div className="flex gap-1 flex-wrap">
            {product.sizes.filter((s) => s.stock > 0).map((s) => (
              <span
                key={s.size}
                className="text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded"
              >
                {s.size}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
