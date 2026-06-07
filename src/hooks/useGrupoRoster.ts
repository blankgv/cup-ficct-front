"use client";

import { useCallback, useEffect, useState } from "react";
import { gruposService } from "@/services/academic/grupos.service";
import { grupoMateriasService } from "@/services/academic/grupoMaterias.service";
import { estudiantesPorGrupo, type RosterRow } from "@/services/reports/reports.service";
import { getErrorMessage } from "@/lib/api";
import type { Grupo, GrupoMateria } from "@/lib/academic";

// Estado compartido por las planillas: grupo → materia del grupo → roster de inscritos.
export function useGrupoRoster() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [materias, setMaterias] = useState<GrupoMateria[]>([]);
  const [materia, setMateria] = useState<string>("");
  const [roster, setRoster] = useState<RosterRow[]>([]);

  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gruposService
      .list()
      .then(setGrupos)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoadingGrupos(false));
  }, []);

  const selectGrupo = useCallback(async (g: Grupo | null) => {
    setGrupo(g);
    setMateria("");
    setMaterias([]);
    setRoster([]);
    if (!g) return;
    setLoadingDetail(true);
    setError(null);
    try {
      const [mats, ros] = await Promise.all([
        grupoMateriasService.list(g.id),
        estudiantesPorGrupo(g.gestion, g.id),
      ]);
      setMaterias(mats);
      setRoster(ros);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  return {
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
  };
}
