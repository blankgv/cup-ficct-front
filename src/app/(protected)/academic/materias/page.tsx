"use client";

import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { materiasService } from "@/services/academic/materias.service";
import { ACADEMIC_PERMISSION, type Materia } from "@/lib/academic";

interface Form {
  sigla: string;
  nombre: string;
  peso: string;
}

const EMPTY: Form = { sigla: "", nombre: "", peso: "" };

export default function MateriasPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Materia, Form>
        title="Materias"
        description="El peso va de 0 a 1; la suma de todas debería dar 1.00."
        createLabel="Nueva materia"
        rowKey={(m) => m.sigla}
        columns={[
          { header: "Sigla", render: (m) => m.sigla },
          { header: "Nombre", render: (m) => m.nombre },
          { header: "Peso", render: (m) => m.peso.toFixed(2) },
        ]}
        fetchAll={materiasService.list}
        emptyForm={EMPTY}
        toForm={(m) => ({ sigla: m.sigla, nombre: m.nombre, peso: String(m.peso) })}
        create={(f) =>
          materiasService.create({ sigla: f.sigla, nombre: f.nombre, peso: Number(f.peso) })
        }
        update={(row, f) =>
          materiasService.update(row.sigla, { nombre: f.nombre, peso: Number(f.peso) })
        }
        remove={(row) => materiasService.remove(row.sigla)}
        describe={(m) => `${m.sigla} — ${m.nombre}`}
        summary={(rows) => {
          const total = rows.reduce((acc, m) => acc + m.peso, 0);
          const ok = Math.abs(total - 1) < 0.001;
          return (
            <span className={ok ? "text-green-700" : "text-amber-700"}>
              Suma de pesos: <strong>{total.toFixed(2)}</strong>
              {ok ? " ✓" : " (debería ser 1.00)"}
            </span>
          );
        }}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Sigla" error={fieldError("sigla")}>
              <TextInput
                value={values.sigla}
                onChange={(e) => set("sigla", e.target.value)}
                invalid={Boolean(fieldError("sigla"))}
                disabled={editing}
                required
              />
            </Field>
            <Field label="Nombre" error={fieldError("nombre")}>
              <TextInput
                value={values.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                invalid={Boolean(fieldError("nombre"))}
                required
              />
            </Field>
            <Field label="Peso (0 a 1)" error={fieldError("peso")}>
              <TextInput
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={values.peso}
                onChange={(e) => set("peso", e.target.value)}
                invalid={Boolean(fieldError("peso"))}
                required
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
