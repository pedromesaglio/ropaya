"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type TrackingResponse } from "@/lib/api";
import { TrackingStatus } from "@/components/TrackingStatus";
import { CheckCircle } from "lucide-react";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);

  useEffect(() => {
    const load = () => api.delivery.track(Number(id)).then(setTracking);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!tracking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle size={52} className="text-primary mx-auto" />
        <h1
          className="text-3xl font-bold"
        >
          ¡Pedido confirmado!
        </h1>
        <p className="text-muted-foreground">Orden #{tracking.order_id}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <TrackingStatus steps={tracking.steps} message={tracking.message} />
      </div>

      <p className="text-muted-foreground text-xs text-center">
        El estado se actualiza automáticamente cada 5 segundos.
      </p>
    </main>
  );
}
