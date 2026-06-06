"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, PageHeader } from "@/components/ui/Card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.username ?? user?.email ?? ""}`}
        description="Panel del sistema CUP-FICCT."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Rol</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {user?.role ?? "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Correo</p>
          <p className="mt-1 truncate text-lg font-semibold text-slate-900">
            {user?.email}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Permisos</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {user?.permissions.length ?? 0}
          </p>
        </Card>
      </div>
    </div>
  );
}
