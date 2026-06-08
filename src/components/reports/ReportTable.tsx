import type { Reporte } from "@/lib/reports";

// Tabla genérica: pinta headers + rows de cualquier reporte.
export function ReportTable({ reporte }: { reporte: Reporte }) {
  if (reporte.rows.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500">
        El reporte no devolvió filas.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            {reporte.headers.map((h, i) => (
              <th key={i} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reporte.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100">
              {reporte.headers.map((_, ci) => (
                <td key={ci} className="px-4 py-3 align-top">
                  {row[ci] === null || row[ci] === undefined ? "—" : row[ci]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
