"use client";

import React from "react";
import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";

type RegisterFn = UseFormRegister<FieldValues>;
type RegisterRet = UseFormRegisterReturn;

export interface InputProps {
  id: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;

  /** Active l’icône monnaie et le padding gauche */
  formatPrice?: boolean;

  /**
   * Accepte soit la **fonction** register (UseFormRegister),
   * soit le **résultat** de register("id") (UseFormRegisterReturn).
   */
  register: RegisterFn | RegisterRet;

  /** Règles RHF si vous passez la **fonction** register */
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
  formatPrice = false,
  register,
  rules,
  errors,
  placeholder,
  className = "",
}) => {
  const hasError = !!errors?.[id];

  // Si on a reçu la fonction register -> on l'appelle avec (id, rules)
  // Sinon, on a déjà un UseFormRegisterReturn prêt à être spread.
  const registration =
    typeof register === "function"
      ? (register as RegisterFn)(id, rules)
      : (register as RegisterRet);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 ${
            hasError ? "text-rose-600" : "text-zinc-700"
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {formatPrice && (
          <BiDollar
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
        )}

        <input
          id={id}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-md border-2 bg-white px-4 py-3 font-light outline-none transition
            ${formatPrice ? "pl-9" : "pl-4"}
            ${
              hasError
                ? "border-rose-500 focus:border-rose-500"
                : "border-neutral-300 focus:border-neutral-700"
            }
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
          `}
          {...registration}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      </div>

      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">
          {String((errors as any)[id]?.message ?? "Champ invalide")}
        </p>
      )}
    </div>
  );
};

export default Input;
