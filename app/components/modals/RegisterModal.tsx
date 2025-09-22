// app/components/modals/RegisterModal.tsx
"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import type { IconType } from "react-icons";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import Input from "../inputs";
import Heading from "../Heading";
import Button from "../Button";

const CloseIcon: IconType = IoMdClose;

// utils front pour normaliser comme le backend
const normalizeEmail = (email?: string) =>
  email ? email.trim().toLowerCase() : "";
const normalizePhone = (num?: string) =>
  num ? num.trim().replace(/[^\d+]/g, "") : "";
const isValidEmail = (email: string) =>
  !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // autorise vide (car phone possible)
const isValidPhone = (phone: string) => !phone || /^\+?\d{7,15}$/.test(phone);

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(registerModal.isOpen);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setOpen(registerModal.isOpen), [registerModal.isOpen]);

  // ESC pour fermer
  useEffect(() => {
    if (!registerModal.isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [registerModal.isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      numberPhone: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<FieldValues> = async (raw) => {
    const email = normalizeEmail(raw.email as string);
    const numberPhone = normalizePhone(raw.numberPhone as string);
    const name = (raw.name as string)?.trim();
    const password = (raw.password as string) ?? "";

    // validations côté client alignées avec l'API
    if (!name) {
      setError("name", { message: "Nom requis" });
      toast.error("Nom requis");
      return;
    }
    if (password.length < 8) {
      setError("password", { message: "8 caractères minimum" });
      toast.error("Mot de passe trop court (8 caractères min.)");
      return;
    }
    if (!email && !numberPhone) {
      toast.error("Saisis un email ou un numéro de téléphone");
      return;
    }
    if (!isValidEmail(email)) {
      setError("email", { message: "Email invalide" });
      toast.error("Email invalide");
      return;
    }
    if (!isValidPhone(numberPhone)) {
      setError("numberPhone", { message: "Numéro invalide (7–15 chiffres)" });
      toast.error("Numéro invalide (7–15 chiffres)");
      return;
    }

    const payload = { name, password, email, numberPhone };
    console.log("[register] submitting payload:", payload);

    try {
      setIsLoading(true);
      const res = await axios.post("/api/register", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("[register] success:", res.data);
      toast.success("Compte créé !");
      registerModal.onClose();
      loginModal.onOpen();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Une erreur est survenue";
      console.error("[register] error response:", err?.response?.data || err);
      toast.error(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  const onClose = useCallback(() => {
    if (isLoading) return;
    setOpen(false);
    setTimeout(() => registerModal.onClose(), 200);
  }, [isLoading, registerModal]);

  if (!registerModal.isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-end sm:items-center justify-center
        bg-neutral-900/40 backdrop-blur-[2px]
      "
      aria-modal="true"
      role="dialog"
      aria-labelledby="register-title"
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        id="register-panel"
        className={`
          relative w-full sm:w-5/6 md:w-4/6 lg:w-3/6 xl:w-[42%] 2xl:w-[38%]
          bg-white rounded-t-2xl sm:rounded-2xl shadow-xl
          transition-all duration-200
          ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 sm:px-6 sm:py-4 border-b border-neutral-200/70 bg-white/95 backdrop-blur rounded-t-2xl">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
          >
            <CloseIcon size={18} />
          </button>
          <h2 id="register-title" className="flex-1 text-center text-base sm:text-xl font-semibold">
            Inscription
          </h2>
          <span className="inline-block h-9 w-9" />
        </div>

        {/* Contenu — compact, sans scroll en mobile */}
        <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6">
          <Heading title="Bienvenue sur Flexii" subtitle="Créez votre compte" />

          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4">
            <Input
              id="email"
              label="Email"
              disabled={isLoading}
              register={register("email", {
                setValueAs: (v) => normalizeEmail(v),
                validate: (v) =>
                  isValidEmail(v) || "Email invalide",
              })}
              errors={errors}
            />
            <Input
              id="numberPhone"
              label="Numéro de téléphone"
              disabled={isLoading}
              register={register("numberPhone", {
                setValueAs: (v) => normalizePhone(v),
                validate: (v) =>
                  isValidPhone(v) || "Numéro invalide (7–15 chiffres)",
              })}
              errors={errors}
            />
            <Input
              id="name"
              label="Nom complet"
              disabled={isLoading}
              register={register("name", {
                required: "Nom requis",
                setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
              })}
              errors={errors}
              required
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              disabled={isLoading}
              register={register("password", {
                required: "Mot de passe requis",
                minLength: { value: 8, message: "8 caractères minimum" },
              })}
              errors={errors}
              required
            />
          </div>

          {/* CTA inline mobile */}
          <div className="mt-4 sm:hidden">
            <Button
              label={isLoading ? "..." : "Continuer"}
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
            <div className="text-neutral-500 text-center mt-2 text-sm">
              <p>
                Vous avez déjà un compte ?
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-neutral-900 font-medium hover:underline ml-1"
                >
                  Connectez-vous
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer desktop */}
        <div className="hidden sm:block sticky bottom-0 border-t border-neutral-200/70 bg-white/90 backdrop-blur px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-end">
            <Button
              label={isLoading ? "..." : "Continuer"}
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
          <div className="text-neutral-500 text-center mt-3 text-sm">
            <p>
              Vous avez déjà un compte ?
              <button
                type="button"
                onClick={onToggle}
                className="text-neutral-900 font-medium hover:underline ml-1"
              >
                Connectez-vous
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
