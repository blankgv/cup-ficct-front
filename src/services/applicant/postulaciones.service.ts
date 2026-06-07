import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { Postulacion } from "@/lib/applicant";
import { APPLICANT_BASE } from "./postulantes.service";

function base(documento: string): string {
  return `${APPLICANT_BASE}/postulantes/${documento}/postulaciones`;
}

export interface PostulacionPayload {
  convocatoria_id: number;
  carrera_primera_codigo: string;
  carrera_segunda_codigo: string;
}

export const postulacionesService = {
  async list(documento: string): Promise<Postulacion[]> {
    const { data } = await api.get<Paginated<Postulacion>>(base(documento));
    return data.data;
  },
  async get(documento: string, convocatoriaId: number): Promise<Postulacion> {
    const { data } = await api.get<DataResponse<Postulacion>>(
      `${base(documento)}/${convocatoriaId}`,
    );
    return data.data;
  },
  async create(documento: string, payload: PostulacionPayload): Promise<Postulacion> {
    const { data } = await api.post<DataResponse<Postulacion>>(base(documento), payload);
    return data.data;
  },
  async cancel(documento: string, convocatoriaId: number): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(
      `${base(documento)}/${convocatoriaId}`,
    );
    return data;
  },
};
