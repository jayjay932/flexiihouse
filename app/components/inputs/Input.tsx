"use client";

import React from "react";
import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

export interface InputProps {
  id: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;

  // ⬇️ la fonction register (pas le return)
  register: UseFormRegister<FieldValues>;

  // règles RHF optionnelles (on les passera depuis les écrans)
  rules?: RegisterOptions<FieldValues, string>;

  errors: FieldErrors<FieldValues>;
  placeholder?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  required,
  register,
  rules,
  errors,
  placeholder,
  className = "",
}) => {
  const hasError = !!errors?.[id];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2 outline-none transition
          ${hasError ? "border-rose-500" : "border-neutral-300 focus:border-neutral-500"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        // ⬇️ c’est ici qu’on appelle register(id, rules)
        {...register(id, rules)}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />

      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">
          {String((errors as any)[id]?.message ?? "Champ invalide")}
        </p>
      )}
    </div>
  );
};

export default Input;
