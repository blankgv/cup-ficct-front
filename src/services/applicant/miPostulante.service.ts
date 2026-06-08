import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type { Postulante } from "@/lib/applicant";
import { APPLICANT_BASE } from "./postulantes.service";

const base = `${APPLICANT_BASE}/mi-postulante`;

export interface CompletarPerfilPayload {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  fecha_nacimiento?: string;
  colegio?: string;
  ciudad?: string;
}

export const miPostulanteService = {
  // Datos del propio postulante (404 si el usuario no es postulante).
  async get(): Promise<Postulante> {
    const { data } = await api.get<DataResponse<Postulante>>(base);
    return data.data;
  },
  async update(payload: CompletarPerfilPayload): Promise<Postulante> {
    const { data } = await api.put<DataResponse<Postulante>>(base, payload);
    return data.data;
  },
  async uploadTitulo(file: File): Promise<Postulante> {
    const form = new FormData();
    form.append("titulo", file);
    const { data } = await api.post<DataResponse<Postulante>>(`${base}/titulo`, form);
    return data.data;
  },
};
