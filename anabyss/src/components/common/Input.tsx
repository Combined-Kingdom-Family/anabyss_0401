import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className={`rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}