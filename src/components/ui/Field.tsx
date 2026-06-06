import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}

// Etiqueta + control + error de validación (pintado bajo el input).
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextInput({ invalid = false, className = "", ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 ${
        invalid ? "border-red-400" : "border-slate-300"
      } ${className}`}
    />
  );
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function SelectInput({
  invalid = false,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 ${
        invalid ? "border-red-400" : "border-slate-300"
      } ${className}`}
    >
      {children}
    </select>
  );
}
