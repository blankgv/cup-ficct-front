import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type { Postulante } from "@/lib/applicant";
import type { Pago } from "@/lib/payments";
import type { Boletin, ReporteAsistencia } from "@/lib/evaluation";
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
  // Pagos del propio postulante (cobros de inscripción y otros).
  async pagos(): Promise<Pago[]> {
    const { data } = await api.get<DataResponse<Pago[]>>(`${base}/pagos`);
    return data.data;
  },
  // Mi boletín (notas + promedio + estado) de mi inscripción.
  async boletin(): Promise<Boletin> {
    const { data } = await api.get<Boletin>(`${base}/boletin`);
    return data;
  },
  // Mi reporte de asistencia (% por materia, global y habilitación).
  async asistencia(): Promise<ReporteAsistencia> {
    const { data } = await api.get<ReporteAsistencia>(`${base}/asistencia`);
    return data;
  },
};
