import { api } from "@/lib/api";
import type { EstadoPostulacion, TurnoPreferencia } from "@/lib/applicant";

// Reporte genérico del backend: { titulo, headers, rows: string[][] }.
interface ReportResponse {
  titulo: string;
  headers: string[];
  rows: string[][];
}

function colIndex(headers: string[], re: RegExp): number {
  return headers.findIndex((h) => re.test(h));
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

export interface PostulacionFila {
  documento: string;
  postulante: string;
  primera: string;
  segunda: string;
  estado: EstadoPostulacion;
  turno: TurnoPreferencia | null;
}

// Mapea el reporte (headers + rows) a filas tipadas, por nombre de columna.
export function parsePostulacionesReport(
  headers: string[],
  rows: string[][],
): PostulacionFila[] {
  const iDoc = colIndex(headers, /documento/i);
  const iNom = colIndex(headers, /postulante|estudiante|nombre/i);
  const i1 = colIndex(headers, /1ra|primera/i);
  const i2 = colIndex(headers, /2da|segunda/i);
  const iEst = colIndex(headers, /estado/i);
  const iTur = colIndex(headers, /turno/i);
  return rows.map((r) => {
    const turno = iTur >= 0 ? r[iTur] : "";
    return {
      documento: iDoc >= 0 ? r[iDoc] : r[0],
      postulante: iNom >= 0 ? r[iNom] : "",
      primera: i1 >= 0 ? r[i1] : "",
      segunda: i2 >= 0 ? r[i2] : "",
      estado: (iEst >= 0 ? r[iEst] : "PENDIENTE") as EstadoPostulacion,
      turno: turno === "MANANA" || turno === "TARDE" ? turno : null,
    };
  });
}

// Postulaciones de una convocatoria (todas), para la bandeja de verificación.
export async function postulantesPorConvocatoria(
  convocatoriaId: number,
): Promise<PostulacionFila[]> {
  const { data } = await api.get<ReportResponse>(
    `/reports/convocatorias/${convocatoriaId}/postulantes`,
    { params: { format: "json" } },
  );
  return parsePostulacionesReport(data.headers, data.rows);
}
