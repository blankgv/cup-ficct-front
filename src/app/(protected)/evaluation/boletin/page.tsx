"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/api";
import { notasService } from "@/services/evaluation/notas.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { postulantesService } from "@/services/applicant/postulantes.service";
import { GRADE_MANAGE, type Boletin } from "@/lib/evaluation";
import type { Convocatoria, Postulante } from "@/lib/applicant";

function BoletinContent() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [convId, setConvId] = useState("");
  const [documento, setDocumento] = useState("");

  const [boletin, setBoletin] = useState<Boletin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
    postulantesService.list().then(setPostulantes).catch(() => setPostulantes([]));
  }, []);

  async function consultar() {
    if (!convId || !documento) return;
    setLoading(true);
    setError(null);
    setBoletin(null);
    try {
      setBoletin(await notasService.boletin(documento, Number(convId)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Boletín de notas"
        description="Promedio por materia, promedio final ponderado por peso y estado (APROBADO si el final ≥ 60)."
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Convocatoria">
            <SelectInput value={convId} onChange={(e) => setConvId(e.target.value)}>
              <option value="">Seleccioná…</option>
              {convocatorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.gestion})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Postulante">
            <SelectInput value={documento} onChange={(e) => setDocumento(e.target.value)}>
              <option value="">Seleccioná…</option>
              {postulantes.map((p) => (
                <option key={p.documento} value={p.documento}>
                  {p.documento} — {p.nombres} {p.apellidos}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex items-end">
            <Button onClick={consultar} loading={loading} disabled={!convId || !documento}>
              Consultar boletín
            </Button>
          </div>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="flex justify-center p-10">
          <Spinner className="h-7 w-7" />
        </Card>
      ) : boletin ? (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <p className="text-sm text-slate-500">
                Postulante {boletin.postulante_documento} · Grupo #{boletin.grupo_id}
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Promedio final: {boletin.promedio_final}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                boletin.estado === "APROBADO"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {boletin.estado}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Materia</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Exámenes</th>
                  <th className="px-4 py-3">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {boletin.materias.map((m) => (
                  <tr key={m.sigla} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{m.sigla}</span>
                      <span className="text-slate-500"> — {m.nombre}</span>
                    </td>
                    <td className="px-4 py-3">{m.peso}</td>
                    <td className="px-4 py-3">
                      {m.examenes.length === 0
                        ? "—"
                        : m.examenes
                            .map((e) => `#${e.numero}: ${e.valor}`)
                            .join("  ·  ")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {m.promedio === null ? "—" : m.promedio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-sm text-slate-500">
            Elegí convocatoria y postulante para ver el boletín.
          </p>
        </Card>
      )}
    </div>
  );
}

export default function BoletinPage() {
  return (
    <RequirePermission permission={GRADE_MANAGE}>
      <BoletinContent />
    </RequirePermission>
  );
}
