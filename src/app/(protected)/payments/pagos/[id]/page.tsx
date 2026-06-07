"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { EstadoPagoBadge } from "@/components/payments/EstadoPagoBadge";
import { useCan } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/api";
import { pagosService } from "@/services/payments/pagos.service";
import { PAYMENT_MANAGE, type Pago } from "@/lib/payments";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

function PagoDetalleContent({ id }: { id: number }) {
  const isStaff = useCan(PAYMENT_MANAGE);
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPago(await pagosService.get(id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      {isStaff && (
        <Link
          href="/payments/pagos"
          className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver a pagos
        </Link>
      )}

      <PageHeader title={`Pago #${id}`} description="Detalle del pago." />

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="flex justify-center p-10">
          <Spinner className="h-7 w-7" />
        </Card>
      ) : pago ? (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <EstadoPagoBadge estado={pago.estado} />
            <span className="text-2xl font-semibold text-slate-900">{pago.monto}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Postulante" value={pago.postulante_documento} />
            <Row label="Convocatoria" value={`#${pago.convocatoria_id}`} />
            <Row label="Concepto" value={pago.concepto} />
            <Row label="Método" value={pago.metodo} />
            <Row label="Fecha de pago" value={pago.fecha_pago} />
            <Row label="Creado" value={pago.created_at} />
            {pago.estado === "PAGADO" && (
              <>
                <Row
                  label="Confirmado por"
                  value={pago.confirmado_por ? `Usuario #${pago.confirmado_por}` : "—"}
                />
                <Row label="Confirmado el" value={pago.confirmado_at ?? "—"} />
              </>
            )}
            {pago.estado === "RECHAZADO" && (
              <Row
                label="Motivo de rechazo"
                value={
                  <span className="text-red-600">{pago.motivo_rechazo ?? "—"}</span>
                }
              />
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default function PagoDetallePage() {
  const params = useParams<{ id: string }>();
  return <PagoDetalleContent id={Number(params.id)} />;
}
