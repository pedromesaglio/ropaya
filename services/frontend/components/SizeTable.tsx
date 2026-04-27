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
      <p className="text-muted-foreground text-sm font-medium">Seleccioná tu talle</p>
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
                px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150
                ${outOfStock
                  ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                  : isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,107,53,0.4)]"
                  : "border-border text-foreground hover:border-primary/60 hover:text-primary"
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
