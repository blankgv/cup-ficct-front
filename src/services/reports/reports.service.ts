import { api } from "@/lib/api";

// Reporte genérico del backend: { titulo, headers, rows: string[][] }.
interface ReportResponse {
  titulo: string;
  headers: string[];
  rows: string[][];
}

export interface RosterRow {
  documento: string;
  nombre: string;
}

// Lista de estudiantes (inscritos asignados) de un grupo, vía el módulo de reportes.
// El reporte devuelve filas alineadas a headers; se mapea por nombre de columna.
export async function estudiantesPorGrupo(
  gestion: string,
  grupoId: number,
): Promise<RosterRow[]> {
  const { data } = await api.get<ReportResponse>("/reports/estudiantes-por-grupo", {
    params: { gestion, grupo_id: grupoId, format: "json" },
  });
  const docIdx = data.headers.findIndex((h) => /documento/i.test(h));
  const nameIdx = data.headers.findIndex((h) => /estudiante|postulante|nombre/i.test(h));
  return data.rows.map((row) => ({
    documento: docIdx >= 0 ? row[docIdx] : row[0],
    nombre: nameIdx >= 0 ? row[nameIdx] : "",
  }));
}
