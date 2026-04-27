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
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold tracking-tight">
          Ropa de{" "}
          <span className="text-emerald-400">Avellaneda</span>
          <br />a tu puerta
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Los mejores locales de Avellaneda, sin filas, sin colectivo, sin perder el día.
          Elegí, pagá y recibilo hoy.
        </p>
        <Link href="/stores">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
            Ver locales
          </Button>
        </Link>
      </section>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Locales destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      {latestProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Últimas novedades</h2>
            <Link href="/stores" className="text-emerald-400 text-sm hover:underline">
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
