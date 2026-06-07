"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { useGrupoRoster } from "@/hooks/useGrupoRoster";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { notasService } from "@/services/evaluation/notas.service";
import {
  NotaIndividualModal,
  type NotaPrefill,
} from "@/components/evaluation/NotaIndividualModal";
import { GRADE_MANAGE, type CargaResumen } from "@/lib/evaluation";

function PlanillaNotasContent() {
  const {
    grupos,
    grupo,
    selectGrupo,
    materias,
    materia,
    setMateria,
    roster,
    loadingGrupos,
    loadingDetail,
    error,
  } = useGrupoRoster();

  const [numero, setNumero] = useState("1");
  // valores por documento.
  const [valores, setValores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resumen, setResumen] = useState<CargaResumen | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});
  const [individual, setIndividual] = useState<NotaPrefill | null>(null);

  const canSubmit = useMemo(
    () => Boolean(grupo && materia && numero && roster.length > 0),
    [grupo, materia, numero, roster.length],
  );

  function setValor(doc: string, v: string) {
    setValores((prev) => ({ ...prev, [doc]: v }));
  }

  async function submit() {
    if (!grupo || !materia) return;
    const notas = roster
      .filter((r) => valores[r.documento] !== undefined && valores[r.documento] !== "")
      .map((r) => ({
        postulante_documento: r.documento,
        valor: Number(valores[r.documento]),
      }));
    if (notas.length === 0) {
      setSubmitError("Cargá al menos una nota.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setFieldErr({});
    setResumen(null);
    try {
      const res = await notasService.bulk(grupo.id, materia, {
        numero: Number(numero),
        notas,
      });
      setResumen(res);
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setSubmitError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Planilla de notas"
        description="Cargá notas (0–100) por grupo, materia y nº de examen. La carga es upsert: vuelve a cargar pisa el valor anterior."
        actions={
          <Button variant="secondary" onClick={() => setIndividual({})}>
            Nota individual
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Grupo">
            <SelectInput
              value={grupo?.id ?? ""}
              onChange={(e) =>
                selectGrupo(grupos.find((g) => g.id === Number(e.target.value)) ?? null)
              }
              disabled={loadingGrupos}
            >
              <option value="">{loadingGrupos ? "Cargando…" : "Seleccioná un grupo…"}</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.codigo} · {g.turno} · {g.gestion}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Materia">
            <SelectInput
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              disabled={!grupo || loadingDetail}
            >
              <option value="">Seleccioná una materia…</option>
              {materias.map((m) => (
                <option key={m.materia_sigla} value={m.materia_sigla}>
                  {m.materia_sigla}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Nº de examen" error={fieldErr.numero?.[0]}>
            <TextInput
              type="number"
              min="1"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              invalid={Boolean(fieldErr.numero)}
            />
          </Field>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {submitError && <Alert variant="error">{submitError}</Alert>}
      {fieldErr.notas && <Alert variant="error">{fieldErr.notas[0]}</Alert>}
      {resumen && (
        <Alert variant="success">
          Guardadas: {resumen.guardadas} · Omitidas: {resumen.omitidas} · No inscritos:{" "}
          {resumen.no_inscritos}
        </Alert>
      )}

      <Card className="mt-4 p-0">
        {loadingDetail ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : !grupo ? (
          <p className="p-6 text-center text-sm text-slate-500">Elegí un grupo para empezar.</p>
        ) : roster.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            El grupo no tiene estudiantes inscritos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Nota (0–100)</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.documento} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.documento}</td>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">
                      <TextInput
                        type="number"
                        min="0"
                        max="100"
                        className="max-w-28"
                        value={valores[r.documento] ?? ""}
                        onChange={(e) => setValor(r.documento, e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setIndividual({
                            documento: r.documento,
                            materia,
                            numero,
                            valor: valores[r.documento] ?? "",
                          })
                        }
                      >
                        Editar puntual
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-end">
        <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
          Guardar notas
        </Button>
      </div>

      {individual && (
        <NotaIndividualModal
          prefill={individual}
          onClose={() => setIndividual(null)}
          onSaved={() => undefined}
        />
      )}
    </div>
  );
}

export default function PlanillaNotasPage() {
  return (
    <RequirePermission permission={GRADE_MANAGE}>
      <PlanillaNotasContent />
    </RequirePermission>
  );
}
