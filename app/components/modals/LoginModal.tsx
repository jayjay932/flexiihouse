// ✅ LoginModal.tsx complet avec email OU téléphone

"use client";

import { signIn } from "next-auth/react";
import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";
import {
  FieldValues,
  SubmitHandler,
  useForm
} from "react-hook-form";
import { IoMdClose } from "react-icons/io";

import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from ".";
import Heading from "../Heading";
import Input from "../inputs";
import { toast } from "react-hot-toast";
import Button from "../Button";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";

const LoginModal = () => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      login: "",
      password: ""
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    signIn("credentials", {
      login: data.login, // ✅ peut être email ou téléphone
      password: data.password,
      redirect: false
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("connecté avec succès");
        router.refresh();
        loginModal.onClose();
      }

      if (callback?.error) {
        toast.error(callback.error);
      }
    });
  };

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const GoogleIcon = FcGoogle as unknown as React.FC;
  const GithubIcon = AiFillGithub as unknown as React.FC;

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Bienvenue" subtitle="connexion a votre compte" />
      

      
      <Input
        id="login"
        label="Email ou numéro de téléphone"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        type="password"
        label="Mot de passe"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
       <div className="text-neutral-500 text-center mt-4 font-light">
        <div className="flex flex-row items-center justify-center gap-2">
          <div>Premiere fois sur  Flexii?</div>
          <div
            onClick={onToggle}
            className="text-neutral-800 cursor-pointer hover:underline"
          >
            Creer un compte
          </div>
        </div>
      </div>
      <hr />
    
     
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel="Continue"
      onClose={loginModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;