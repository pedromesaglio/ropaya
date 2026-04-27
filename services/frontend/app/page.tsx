export const dynamic = "force-dynamic";

import Link from "next/link";
import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [stores, products] = await Promise.all([
    api.stores.list(),
    api.products.list(),
  ]);

  const featuredStores = stores.filter((s) => s.is_featured);
  const latestProducts = products.slice(0, 8);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      {/* Hero */}
      <section className="relative text-center space-y-6 py-20 overflow-hidden">
        {/* Radial glow behind text */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,53,0.12) 0%, transparent 70%)",
          }}
        />
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ropa de{" "}
          <span
            className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          >
            Avellaneda
          </span>
          <br />
          a tu puerta
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Los mejores locales de Avellaneda, sin filas, sin colectivo, sin perder el día.
          Elegí, pagá y recibilo hoy.
        </p>
        <Link href="/stores">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-[0_0_24px_rgba(255,107,53,0.35)] transition-all hover:shadow-[0_0_32px_rgba(255,107,53,0.5)]"
          >
            Ver locales
          </Button>
        </Link>
      </section>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <section className="space-y-5">
          <h2
            className="text-2xl font-bold border-l-4 border-primary pl-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Locales destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      {latestProducts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold border-l-4 border-primary pl-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Últimas novedades
            </h2>
            <Link href="/stores" className="text-primary text-sm hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
