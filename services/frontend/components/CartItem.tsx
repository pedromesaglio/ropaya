"use client";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/lib/cart-store";

export function CartItem({ item }: { item: CartItemType }) {
  const removeItem = useCart((s) => s.removeItem);

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(item.product.price * item.quantity);

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="w-20 h-24 relative bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {item.product.image_url ? (
          <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-foreground">{item.product.name}</p>
        <p className="text-muted-foreground text-sm">Talle: {item.size}</p>
        <p className="text-muted-foreground text-sm">Cantidad: {item.quantity}</p>
        <p className="text-primary font-bold">{formattedPrice}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.product.id, item.size)}
        className="text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
