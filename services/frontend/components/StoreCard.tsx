import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/lib/api";
import { MapPin } from "lucide-react";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-zinc-50 text-lg">{store.name}</CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {store.is_verified && (
                <Badge variant="secondary" className="bg-emerald-900 text-emerald-300 text-xs">
                  Verificado
                </Badge>
              )}
              {store.is_featured && (
                <Badge className="bg-amber-500 text-zinc-900 text-xs">Destacado</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1 text-zinc-400 text-sm">
            <MapPin size={14} />
            <span>{store.address}</span>
          </div>
          {store.description && (
            <p className="text-zinc-400 text-sm line-clamp-2">{store.description}</p>
          )}
          <p className="text-zinc-500 text-xs">
            {store.accepts_returns ? "✓ Acepta devoluciones" : "✗ No acepta devoluciones"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
