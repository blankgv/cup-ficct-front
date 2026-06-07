import { ESTADO_PAGO_STYLE, type EstadoPago } from "@/lib/payments";

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_PAGO_STYLE[estado]}`}
    >
      {estado}
    </span>
  );
}
