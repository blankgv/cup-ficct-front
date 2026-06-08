"use client";

import { useEffect, useRef, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { ReportTable } from "@/components/reports/ReportTable";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { useCan } from "@/hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { reporteVoz, reporteVozExport } from "@/services/reports/reports.service";
import { REPORT_EXPORT, REPORT_VIEW, type ReporteVoz } from "@/lib/reports";

// Tipado mínimo de la Web Speech API (no está en lib.dom por defecto).
interface SRAlternative {
  transcript: string;
}
interface SREvent {
  results: ArrayLike<ArrayLike<SRAlternative>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function Content() {
  const canExport = useCan(REPORT_EXPORT);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [texto, setTexto] = useState("");
  const [result, setResult] = useState<ReporteVoz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setTexto((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  async function generar() {
    if (!texto.trim()) {
      setError("Dictá o escribí una consulta.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await reporteVoz(texto, "json"));
    } catch (e) {
      const v = getValidationErrors(e);
      setError(v ? Object.values(v).flat().join(" ") : getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reporte por voz"
        description='Dictá tu consulta (ej. "estudiantes del turno mañana de la gestión 2026"). La IA elige el reporte y los filtros.'
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="flex items-center gap-2">
            <Button
              variant={listening ? "danger" : "secondary"}
              onClick={toggleMic}
              disabled={!supported}
            >
              {listening ? "■ Detener" : "🎤 Dictar"}
            </Button>
            {!supported && (
              <span className="text-xs text-slate-500">
                Tu navegador no soporta dictado por voz; escribí la consulta abajo.
              </span>
            )}
          </div>

          <Field label="Consulta (podés editarla antes de enviar)">
            <TextArea
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="estudiantes del turno mañana de la gestión 2026"
            />
          </Field>

          <div>
            <Button onClick={generar} loading={loading}>
              Generar reporte
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <>
          <Card className="mb-4">
            <p className="text-sm font-semibold text-slate-700">Interpretación de la IA</p>
            <p className="mt-1 text-sm text-slate-600">
              Reporte:{" "}
              <span className="font-medium text-slate-900">
                {result.interpretacion.reporte}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(result.interpretacion.filtros).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                >
                  {k}: {String(v)}
                </span>
              ))}
              {Object.keys(result.interpretacion.filtros).length === 0 && (
                <span className="text-xs text-slate-500">sin filtros</span>
              )}
            </div>
          </Card>

          <div className="mb-3 flex justify-end">
            {canExport && (
              <ExportButtons onExport={(format) => reporteVozExport(texto, format)} />
            )}
          </div>

          <Card className="p-0">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{result.titulo}</p>
            </div>
            <ReportTable reporte={result} />
          </Card>
        </>
      )}
    </div>
  );
}

export default function ReporteVozPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
