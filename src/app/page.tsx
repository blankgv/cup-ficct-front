import Link from "next/link";

// Landing mínima. La redirección por sesión se agrega al cablear el store de auth.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">CUP-FICCT</h1>
      <p className="text-slate-600">Sistema de autenticación.</p>
      <Link
        href="/login"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Ingresar
      </Link>
    </main>
  );
}
