import type { ReactNode } from "react";

// Tarjeta centrada para las pantallas de autenticación públicas.
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
