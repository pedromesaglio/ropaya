"use client";
import type { SizeStock } from "@/lib/api";

interface SizeTableProps {
  sizes: SizeStock[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export function SizeTable({ sizes, selected, onSelect }: SizeTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-zinc-400 text-sm font-medium">Seleccioná tu talle</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const outOfStock = s.stock === 0;
          const isSelected = selected === s.size;
          return (
            <button
              key={s.size}
              onClick={() => !outOfStock && onSelect(s.size)}
              disabled={outOfStock}
              className={`
                px-4 py-2 rounded border text-sm font-medium transition-colors
                ${outOfStock
                  ? "border-zinc-800 text-zinc-700 cursor-not-allowed line-through"
                  : isSelected
                  ? "border-zinc-50 bg-zinc-50 text-zinc-900"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-400"
                }
              `}
            >
              {s.size}
              {!outOfStock && (
                <span className="text-xs ml-1 opacity-50">({s.stock})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
