"use client";

import type { PaginationMeta } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

// Pie de tabla: rango mostrado + navegación anterior/siguiente.
export function Pagination({ meta, onPageChange, disabled }: PaginationProps) {
  if (meta.last_page <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={disabled || meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-slate-600">
          Página {meta.current_page} de {meta.last_page}
        </span>
        <Button
          variant="secondary"
          disabled={disabled || meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
