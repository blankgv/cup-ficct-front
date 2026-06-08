"use client";

import { useEffect, useRef, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ReportTable } from "@/components/reports/ReportTable";
import { useCan } from "@/hooks/useAuth";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { getErrorMessage, getValidationErrors, isForbidden } from "@/lib/api";
import { reporteVoz, reporteVozExport } from "@/services/reports/reports.service";
import {
  REPORT_EXPORT,
  REPORT_VIEW,
  type ExportFormat,
  type ReporteVoz,
} from "@/lib/reports";

type Mensaje =
  | { id: number; rol: "user"; texto: string }
  | { id: number; rol: "bot"; texto: string; estado: "cargando" }
  | { id: number; rol: "bot"; texto: string; estado: "ok"; reporte: ReporteVoz }
  | { id: number; rol: "bot"; texto: string; estado: "error"; error: string };

const SUGERENCIAS = [
  "Estudiantes del turno mañana de la gestión 2026",
  "Recaudación de la convocatoria Admisión Prueba QA",
  "Postulantes verificados de la convocatoria Admisión Prueba QA",
];

function Interpretacion({ reporte }: { reporte: ReporteVoz }) {
  const filtros = Object.entries(reporte.interpretacion.filtros);
  return (
    <div className="mb-2 text-xs text-slate-500">
      Reporte: <span className="font-medium text-slate-700">{reporte.interpretacion.reporte}</span>
      {filtros.length > 0 && (
        <span className="ml-1">
          ·{" "}
          {filtros.map(([k, v]) => (
            <span key={k} className="mr-1 rounded bg-slate-100 px-1.5 py-0.5">
              {k}: {String(v)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function DescargarBotones({ texto }: { texto: string }) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(format: ExportFormat) {
    setBusy(format);
    setError(null);
    try {
      await reporteVozExport(texto, format);
    } catch (e) {
      setError(
        isForbidden(e) ? "Sin permiso para exportar." : getErrorMessage(e),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-1">
      <div className="flex gap-2">
        <Button variant="secondary" loading={busy === "excel"} disabled={busy !== null} onClick={() => run("excel")}>
          Descargar Excel
        </Button>
        <Button variant="secondary" loading={busy === "pdf"} disabled={busy !== null} onClick={() => run("pdf")}>
          Descargar PDF
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function ChatContent() {
  const canExport = useCan(REPORT_EXPORT);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const idRef = useRef(0);
  const finRef = useRef<HTMLDivElement>(null);

  const { supported, listening, toggle } = useSpeechToText((t) =>
    setTexto((prev) => (prev ? `${prev} ${t}` : t)),
  );

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviar(prompt: string) {
    const q = prompt.trim();
    if (!q || enviando) return;
    setEnviando(true);
    setTexto("");

    const userId = ++idRef.current;
    const botId = ++idRef.current;
    setMensajes((m) => [
      ...m,
      { id: userId, rol: "user", texto: q },
      { id: botId, rol: "bot", texto: q, estado: "cargando" },
    ]);

    try {
      const reporte = await reporteVoz(q, "json");
      setMensajes((m) =>
        m.map((msg) =>
          msg.id === botId
            ? { id: botId, rol: "bot", texto: q, estado: "ok", reporte }
            : msg,
        ),
      );
    } catch (e) {
      const v = getValidationErrors(e);
      const error = v ? Object.values(v).flat().join(" ") : getErrorMessage(e);
      setMensajes((m) =>
        m.map((msg) =>
          msg.id === botId
            ? { id: botId, rol: "bot", texto: q, estado: "error", error }
            : msg,
        ),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeader
        title="Reportes"
        description="Pedí cualquier reporte en lenguaje natural (escribí o dictá). La IA lo arma y lo dejás listo para descargar."
      />

      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {mensajes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-slate-500">
              Escribí o dictá tu consulta. Por ejemplo:
            </p>
            <div className="flex flex-col gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {mensajes.map((m) =>
              m.rol === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-slate-900 px-4 py-2 text-sm text-white">
                    {m.texto}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="w-full max-w-[95%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-3">
                    {m.estado === "cargando" ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Spinner className="h-4 w-4" /> Generando reporte…
                      </div>
                    ) : m.estado === "error" ? (
                      <p className="text-sm text-red-600">{m.error}</p>
                    ) : (
                      <>
                        <Interpretacion reporte={m.reporte} />
                        <p className="mb-2 text-sm font-semibold text-slate-900">
                          {m.reporte.titulo}
                        </p>
                        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                          <ReportTable reporte={m.reporte} />
                        </div>
                        {canExport && <DescargarBotones texto={m.texto} />}
                      </>
                    )}
                  </div>
                </div>
              ),
            )}
            <div ref={finRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(texto);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <Button
          type="button"
          variant={listening ? "danger" : "secondary"}
          onClick={toggle}
          disabled={!supported}
          title={supported ? "Dictar" : "Tu navegador no soporta dictado"}
        >
          {listening ? "■" : "🎤"}
        </Button>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          rows={1}
          placeholder="Pedí un reporte… (ej. recaudación de la convocatoria X)"
          className="min-h-[42px] flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        <Button type="submit" loading={enviando} disabled={!texto.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}

export default function ReportsChatPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <ChatContent />
    </RequirePermission>
  );
}
