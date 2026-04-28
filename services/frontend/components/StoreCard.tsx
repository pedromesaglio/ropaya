import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/lib/api";
import { MapPin } from "lucide-react";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer h-full hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,107,53,0.12)]">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-foreground text-lg">
              {store.name}
            </CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {store.is_verified && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Verificado
                </Badge>
              )}
              {store.is_featured && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs">Destacado</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin size={14} />
            <span>{store.address}</span>
          </div>
          {store.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{store.description}</p>
          )}
          <p className="text-muted-foreground text-xs">
            {store.accepts_returns ? "✓ Acepta devoluciones" : "✗ No acepta devoluciones"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
