'use client';

import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FieldValues,
  SubmitHandler,
  useForm
} from "react-hook-form";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import Modal from "./";
import Input from "../inputs";
import Heading from "../Heading";
import Button from "../Button";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      numberPhone: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios.post('/api/register', data)
      .then(() => {
        toast.success('Registered!');
        registerModal.onClose();
        loginModal.onOpen();
      })
      .catch((error) => {
        toast.error("Une erreur est survenue");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  const GoogleIcon = FcGoogle as unknown as React.FC;
  const GithubIcon = AiFillGithub as unknown as React.FC;

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Bienvenue sur Flexy"
        subtitle="Créez votre compte"
      />
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
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button
        outline
        label="Continuer avec Google"
        icon={GoogleIcon}
        onClick={() => signIn('google')}
      />
      <Button
        outline
        label="Continuer avec Github"
        icon={GithubIcon}
        onClick={() => signIn('github')}
      />
      <div className="text-neutral-500 text-center mt-4 font-light">
        <p>
          Vous avez déjà un compte ?
          <span
            onClick={onToggle}
            className="text-neutral-800 cursor-pointer hover:underline ml-1"
          >
            Connectez-vous
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Inscription"
      actionLabel="Continuer"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
