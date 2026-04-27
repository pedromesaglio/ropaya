const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  description: string | null;
  phone: string | null;
  accepts_returns: boolean;
  return_contact: string | null;
  is_verified: boolean;
  is_featured: boolean;
}

export interface SizeStock {
  id: number;
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  color: string | null;
  image_url: string | null;
  is_active: boolean;
  sizes: SizeStock[];
}

export interface OrderItem {
  product_id: number;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  items: OrderItem[];
}

export interface TrackingStep {
  status: string;
  label: string;
  completed: boolean;
}

export interface TrackingResponse {
  order_id: number;
  status: string;
  message: string;
  steps: TrackingStep[];
}

export const api = {
  stores: {
    list: () => apiFetch<Store[]>("/stores"),
    get: (id: number) => apiFetch<Store>(`/stores/${id}`),
    products: (id: number) => apiFetch<Product[]>(`/stores/${id}/products`),
  },
  products: {
    list: (params?: { category?: string; max_price?: number; size?: string; color?: string }) => {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params ?? {})
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString();
      return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
    },
    get: (id: number) => apiFetch<Product>(`/products/${id}`),
  },
  orders: {
    create: (payload: { user_id: number; delivery_address: string; items: OrderItem[] }) =>
      apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(payload) }),
    get: (id: number) => apiFetch<Order>(`/orders/${id}`),
  },
  payments: {
    createIntent: (orderId: number) =>
      apiFetch<{ client_secret: string; payment_intent_id: string }>(
        `/payments/create-intent/${orderId}`,
        { method: "POST" }
      ),
  },
  delivery: {
    track: (orderId: number) => apiFetch<TrackingResponse>(`/delivery/${orderId}/track`),
  },
};
