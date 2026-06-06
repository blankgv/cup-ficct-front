"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  // Permiso requerido para ver el item (null = visible siempre).
  permission: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", permission: null },
  { href: "/perfil", label: "Mi perfil", permission: null },
  { href: "/usuarios", label: "Usuarios", permission: "user.manage" },
  { href: "/roles", label: "Roles", permission: "role.manage" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, can, logout } = useAuth();

  // Menú filtrado según permisos (RBAC).
  const items = NAV_ITEMS.filter(
    (item) => item.permission === null || can(item.permission),
  );

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-base font-semibold text-slate-900">CUP-FICCT</p>
        {user?.role && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">
            {user.role}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-sm text-slate-600" title={user?.email}>
          {user?.username ?? user?.email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
