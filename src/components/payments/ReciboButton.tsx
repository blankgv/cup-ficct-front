"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/api";
import { pagosService } from "@/services/payments/pagos.service";

// Descarga el recibo (solo si el pago está PAGADO; 302 → URL firmada del PDF).
export function ReciboButton({ pagoId }: { pagoId: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function descargar() {
    setBusy(true);
    setError(null);
    try {
      const url = await pagosService.reciboUrl(pagoId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo descargar el recibo (¿el pago está PAGADO?)."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert variant="error">{error}</Alert>}
      <div>
        <Button onClick={descargar} loading={busy}>
          Descargar recibo
        </Button>
      </div>
    </div>
  );
}
