import { api } from "@/lib/api";
import type { Boletin, CargaResumen, Nota } from "@/lib/evaluation";

const BASE = "/evaluation";

export interface NotaPayload {
  postulante_documento: string;
  convocatoria_id: number;
  materia_sigla: string;
  numero: number;
  valor: number;
}

export interface BulkNotasPayload {
  numero: number;
  notas: { postulante_documento: string; valor: number }[];
}

export const notasService = {
  // Carga individual (upsert idempotente) → recurso directo.
  async create(payload: NotaPayload): Promise<Nota> {
    const { data } = await api.post<Nota>(`${BASE}/notas`, payload);
    return data;
  },
  // Carga masiva por grupo-materia → resumen plano.
  async bulk(
    grupoId: number,
    materiaSigla: string,
    payload: BulkNotasPayload,
  ): Promise<CargaResumen> {
    const { data } = await api.post<CargaResumen>(
      `${BASE}/grupos/${grupoId}/materias/${materiaSigla}/notas`,
      payload,
    );
    return data;
  },
  // Boletín del postulante en una convocatoria → objeto plano.
  async boletin(documento: string, convocatoriaId: number): Promise<Boletin> {
    const { data } = await api.get<Boletin>(
      `${BASE}/postulantes/${documento}/convocatorias/${convocatoriaId}/boletin`,
    );
    return data;
  },
};
