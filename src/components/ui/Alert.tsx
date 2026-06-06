import type { ReactNode } from "react";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "bg-red-50 text-red-700 ring-red-200",
  success: "bg-green-50 text-green-700 ring-green-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-md px-3 py-2 text-sm ring-1 ring-inset ${styles[variant]}`}>
      {children}
    </div>
  );
}
