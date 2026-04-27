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
      <Card className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,107,53,0.15)]">
        <div className="aspect-[4/5] relative bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sin foto
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1.5">
          <p className="text-foreground font-medium text-sm line-clamp-1">{product.name}</p>
          <p className="text-primary font-bold">{formattedPrice}</p>
          <div className="flex gap-1 flex-wrap">
            {product.sizes.filter((s) => s.stock > 0).map((s) => (
              <span
                key={s.size}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
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
