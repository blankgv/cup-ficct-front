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

interface NavSection {
  // Título de sección (null = sin encabezado).
  title: string | null;
  items: NavItem[];
}

const ACADEMIC_PERMISSION = "academic.manage";
const APPLICANT_PERMISSION = "applicant.manage";

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "Inicio", permission: null },
      { href: "/perfil", label: "Mi perfil", permission: null },
      { href: "/usuarios", label: "Usuarios", permission: "user.manage" },
      { href: "/roles", label: "Roles", permission: "role.manage" },
    ],
  },
  {
    title: "Gestión académica",
    items: [
      { href: "/academic/facultades", label: "Facultades", permission: ACADEMIC_PERMISSION },
      { href: "/academic/carreras", label: "Carreras", permission: ACADEMIC_PERMISSION },
      { href: "/academic/materias", label: "Materias", permission: ACADEMIC_PERMISSION },
      { href: "/academic/modulos", label: "Módulos y aulas", permission: ACADEMIC_PERMISSION },
      { href: "/academic/periodos", label: "Periodos", permission: ACADEMIC_PERMISSION },
      { href: "/academic/docentes", label: "Docentes", permission: ACADEMIC_PERMISSION },
      { href: "/academic/grupos", label: "Grupos", permission: ACADEMIC_PERMISSION },
    ],
  },
  {
    title: "Admisión",
    items: [
      { href: "/applicant/postulantes", label: "Postulantes", permission: APPLICANT_PERMISSION },
      { href: "/applicant/convocatorias", label: "Convocatorias", permission: APPLICANT_PERMISSION },
    ],
  },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, can, logout } = useAuth();

  // Menú filtrado según permisos (RBAC); secciones sin ítems visibles se ocultan.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => item.permission === null || can(item.permission),
    ),
  })).filter((section) => section.items.length > 0);

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

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {sections.map((section, i) => (
          <div key={section.title ?? `section-${i}`} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
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
          </div>
        ))}
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
