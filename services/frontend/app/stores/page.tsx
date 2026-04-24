import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

export default async function StoresPage() {
  const stores = await api.stores.list();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Locales en Avellaneda</h1>
      {stores.length === 0 ? (
        <p className="text-zinc-400">No hay locales disponibles todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </main>
  );
}
