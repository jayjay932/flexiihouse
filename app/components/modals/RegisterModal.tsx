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

// Icône correctement typée
const CloseIcon: IconType = IoMdClose;

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(registerModal.isOpen);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // sync open state
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
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      numberPhone: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      await axios.post("/api/register", data);
      toast.success("Compte créé !");
      registerModal.onClose();
      loginModal.onOpen();
    } catch {
      toast.error("Une erreur est survenue");
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
        // fermer en cliquant hors panneau
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      {/* Panel (mobile: carte pleine largeur, sans scroll interne) */}
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
        {/* Header fixe */}
        <div
          className="
            sticky top-0 z-10
            flex items-center justify-between gap-3
            px-5 py-3 sm:px-6 sm:py-4
            border-b border-neutral-200/70 bg-white/95 backdrop-blur
            rounded-t-2xl
          "
        >
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

        {/* Contenu (compact, SANS scroll sur mobile) */}
        <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6">
          <Heading
            title="Bienvenue sur Flexii"
            subtitle="Créez votre compte"
          />

          {/* Inputs compacts */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4">
            <Input
              id="email"
              label="Email"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="numberPhone"
              label="Numéro de téléphone"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="name"
              label="Nom complet"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>

          {/* CTA INLINE sur mobile (aucun footer fixe) */}
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

        {/* Footer desktop uniquement (sticky interne) */}
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
