"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { postulantesService } from "@/services/applicant/postulantes.service";
import type { CargaMasivaResult } from "@/lib/applicant";

export function CargaMasivaModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CargaMasivaResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Seleccioná un archivo CSV o Excel.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setResult(await postulantesService.lote(file));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const errores = result?.errores ?? [];

  return (
    <Modal open onClose={onClose} title="Carga masiva de postulantes">
      {result ? (
        <div className="flex flex-col gap-4">
          <Alert variant="success">Carga procesada.</Alert>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-2xl font-semibold text-green-700">{result.creados}</p>
              <p className="text-slate-500">Creados</p>
            </div>
            <div className="rounded-md bg-amber-50 p-3">
              <p className="text-2xl font-semibold text-amber-700">{result.omitidos}</p>
              <p className="text-slate-500">Omitidos</p>
            </div>
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-2xl font-semibold text-red-700">{errores.length}</p>
              <p className="text-slate-500">Errores</p>
            </div>
          </div>
          {errores.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-3 text-sm">
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                {errores.map((err, i) => (
                  <li key={i}>
                    {typeof err === "string" ? err : JSON.stringify(err)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={onDone}>Listo</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}
          <p className="text-sm text-slate-600">
            Archivo CSV o Excel (máx. 5 MB). Se crea una cuenta de usuario (rol POSTULANTE)
            por cada postulante cargado.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={busy} disabled={!file}>
              Subir
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
