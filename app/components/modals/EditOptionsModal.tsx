'use client';

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import Modal from ".";
import Heading from "../Heading";
import Input from "../inputs";
import ImageUpload from "../inputs/ImageUpload";

import { FaCalendarAlt, FaEdit, FaRegBuilding, FaHome } from "react-icons/fa";
import { GiTreehouse } from "react-icons/gi";

enum STEPS {
  CHOICE = 0,
  INFO = 1,
  IMAGES = 2,
  TYPE = 3,
}

interface EditOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

const EditOptionsModal: React.FC<EditOptionsModalProps> = ({
  isOpen,
  onClose,
  listingId
}) => {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.CHOICE);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      images: [],
      listing_type: '',
    },
  });

  const title = watch('title');
  const description = watch('description');
  const images = watch('images');
  const listing_type = watch('listing_type');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onNext = () => setStep((value) => value + 1);
  const onBack = () => setStep((value) => value - 1);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.TYPE) return onNext();

    setIsLoading(true);

    axios.put(`/api/listings/${listingId}`, data)
      .then(() => {
        toast.success("Annonce mise à jour !");
        router.refresh();
        onClose();
        reset();
        setStep(STEPS.CHOICE);
      })
      .catch(() => toast.error("Erreur lors de la modification"))
      .finally(() => setIsLoading(false));
  };

  const listingTypeOptions = [
    { id: "Maison", label: "Maison", icon: FaHome },
    { id: "Appartement", label: "Appartement", icon: FaRegBuilding },
    { id: "Cabane", label: "Cabane", icon: GiTreehouse },
  ];

  let bodyContent: React.ReactElement = <></>;

  if (step === STEPS.CHOICE) {
    const EditIcon = FaEdit as React.FC<{ size?: number; className?: string }>;
    const CalendarIcon = FaCalendarAlt as React.FC<{ size?: number; className?: string }>;

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Que souhaitez-vous modifier ?" subtitle="Choisissez une option" />
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setStep(STEPS.INFO)}
            className="border p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
          >
            <EditIcon size={24} className="text-rose-500" />
            <span className="mt-2 text-sm font-medium">Le logement</span>
          </div>

          <div
            onClick={() => {
              router.push(`/disponibilite/${listingId}`);
              onClose();
            }}
            className="border p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
          >
            <CalendarIcon size={24} className="text-rose-500" />
            <span className="mt-2 text-sm font-medium">La disponibilité</span>
          </div>
        </div>
      </div>
    );
  } else if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Modifier votre annonce" subtitle="Titre et description" />
        <Input
          id="title"
          label="Titre"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  } else if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Photos" subtitle="Ajoutez ou modifiez vos images" />
        <ImageUpload
          value={images}
          onChange={(urls) => setCustomValue("images", urls)}
        />
      </div>
    );
  } else if (step === STEPS.TYPE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Type de logement" subtitle="Choisissez un style" />
        <div className="grid grid-cols-2 gap-3">
          {listingTypeOptions.map(({ id, label, icon }) => {
            const IconComponent = icon as React.FC<{ size?: number; className?: string }>;
            return (
              <div
                key={id}
                onClick={() => setCustomValue("listing_type", id)}
                className={`border p-4 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition 
                  ${listing_type === id ? "border-rose-500 bg-rose-50" : "border-neutral-200"}`}
              >
                <IconComponent size={24} className="text-rose-500" />
                <span className="text-sm">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={
        step === STEPS.CHOICE
          ? ""
          : step === STEPS.TYPE
            ? "Enregistrer"
            : "Suivant"
      }
      secondaryActionLabel={step > STEPS.CHOICE ? "Retour" : undefined}
      secondaryAction={step > STEPS.CHOICE ? onBack : undefined}
      title="Modifier"
      body={bodyContent}
    />
  );
};

export default EditOptionsModal;
