'use client';

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useRentModal from "@/app/hooks/useRentModal";
import useCountries from "@/app/hooks/useCountries";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from ".";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import CountrySelect from "../inputs/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs";
import FilteredTextarea from "../inputs/FilteredTextarea";
import axios from "axios";
import { toast } from "react-hot-toast";

import { 
  FaWifi, FaKitchenSet, FaCar, FaCouch, FaBed, FaTv, FaFan, FaCamera, FaCalendar, FaMoneyBillWave, FaRegBuilding, FaWarehouse, FaShip, FaTree, FaCampground, FaLandmark, FaCubes
} from "react-icons/fa6";
import { FaSwimmingPool, FaHome } from "react-icons/fa";
import { 
  GiGardeningShears, GiBacon, GiTreehouse, GiOden, GiWashingMachine, GiLockedChest, GiWeightLiftingUp 
} from "react-icons/gi";
import { MdOutlineSecurity, MdOutlineIron, MdOutlineChair, MdOutlineDryCleaning } from "react-icons/md";
import { RiFridgeLine } from "react-icons/ri";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  EQUIPEMENTS = 5,
  RENTAL_TYPE = 6,
  PRICE = 7,
  PRICE_MENSUEL = 8,
  CITY = 9,
  LISTING_TYPE = 10,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const { getByValue } = useCountries();
  const [step, setStep] = useState(STEPS.CATEGORY);
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
      category: "",
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 0,
      toilets: 0,
      images: [],
      price: 1,
      title: '',
      description: "",
      has_wifi: false,
      has_kitchen: false,
      has_parking: false,
      has_pool: false,
      has_balcony: false,
      has_garden: false,
      has_terrace: false,
      has_living_room: false,
      is_furnished: false,
      has_tv: false,
      has_air_conditioning: false,
      has_washing_machin: false,
      has_dryer: false,
      has_iron: false,
      has_hair_dryer: false,
      has_fridge: false,
      has_dishwasher: false,
      has_oven: false,
      has_fan: false,
      has_elevator: false,
      has_camera_surveillance: false,
      has_security: false,
      has_gym: false,
      rental_type: "mensuel",
      price_per_month: 0,
      city: '',
      quater: '',
      listing_type: '',
    },
  });

  // Effect pour pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (rentModal.initialData) {
      console.log("Données reçues:", rentModal.initialData); // Pour débugger
      
      // S'assurer que les images sont un tableau de strings
      let imagesArray: string[] = [];
      if (rentModal.initialData.images) {
        if (Array.isArray(rentModal.initialData.images)) {
          imagesArray = rentModal.initialData.images;
        } else if (typeof rentModal.initialData.images === 'string') {
          try {
            // Essayer de parser si c'est un JSON string
            const parsed = JSON.parse(rentModal.initialData.images);
            if (Array.isArray(parsed)) {
              imagesArray = parsed;
            } else {
              imagesArray = [rentModal.initialData.images];
            }
          } catch {
            // Si ce n'est pas du JSON, c'est probablement une URL simple
            imagesArray = [rentModal.initialData.images];
          }
        }
      }

      // Pour la location, utiliser le hook useCountries pour récupérer l'objet complet
      let locationObject = null;
      if (rentModal.initialData.locationValue) {
        locationObject = getByValue(rentModal.initialData.locationValue);
      }

      console.log("Images originales:", rentModal.initialData.images);
      console.log("Type des images:", typeof rentModal.initialData.images);
      console.log("Images converties:", imagesArray);
      console.log("Location object:", locationObject);

      // Enlever les frais de 1000 des prix pour afficher le prix original
      const originalPrice = rentModal.initialData.price > 1000 
        ? rentModal.initialData.price - 1000 
        : rentModal.initialData.price || 1;

      const originalMonthlyPrice = rentModal.initialData.price_per_month > 1000 
        ? rentModal.initialData.price_per_month - 1000 
        : rentModal.initialData.price_per_month || 0;

      // Reset le formulaire d'abord
      reset({
        category: rentModal.initialData.category || "",
        location: locationObject,
        guestCount: rentModal.initialData.guestCount || 1,
        roomCount: rentModal.initialData.roomCount || 1,
        bathroomCount: rentModal.initialData.bathroomCount || 0,
        toilets: rentModal.initialData.toilets || 0,
        images: imagesArray,
        price: originalPrice,
        title: rentModal.initialData.title || "",
        description: rentModal.initialData.description || "",
        has_wifi: rentModal.initialData.has_wifi || false,
        has_kitchen: rentModal.initialData.has_kitchen || false,
        has_parking: rentModal.initialData.has_parking || false,
        has_pool: rentModal.initialData.has_pool || false,
        has_balcony: rentModal.initialData.has_balcony || false,
        has_garden: rentModal.initialData.has_garden || false,
        has_terrace: rentModal.initialData.has_terrace || false,
        has_living_room: rentModal.initialData.has_living_room || false,
        is_furnished: rentModal.initialData.is_furnished || false,
        has_tv: rentModal.initialData.has_tv || false,
        has_air_conditioning: rentModal.initialData.has_air_conditioning || false,
        has_washing_machin: rentModal.initialData.has_washing_machin || false,
        has_dryer: rentModal.initialData.has_dryer || false,
        has_iron: rentModal.initialData.has_iron || false,
        has_hair_dryer: rentModal.initialData.has_hair_dryer || false,
        has_fridge: rentModal.initialData.has_fridge || false,
        has_dishwasher: rentModal.initialData.has_dishwasher || false,
        has_oven: rentModal.initialData.has_oven || false,
        has_fan: rentModal.initialData.has_fan || false,
        has_elevator: rentModal.initialData.has_elevator || false,
        has_camera_surveillance: rentModal.initialData.has_camera_surveillance || false,
        has_security: rentModal.initialData.has_security || false,
        has_gym: rentModal.initialData.has_gym || false,
        rental_type: rentModal.initialData.rental_type || "mensuel",
        price_per_month: originalMonthlyPrice,
        city: rentModal.initialData.city || "",
        quater: rentModal.initialData.quater || "",
        listing_type: rentModal.initialData.listing_type || "",
      });

      // Forcer la mise à jour des images avec setValue
      if (imagesArray.length > 0) {
        setTimeout(() => {
          setValue("images", imagesArray, { shouldValidate: true });
          console.log("Images forcées avec setValue:", imagesArray);
        }, 200);
      }

      // Forcer la mise à jour de la location avec setValue
      if (locationObject) {
        setTimeout(() => {
          setValue("location", locationObject, { shouldValidate: true });
          console.log("Location forcée avec setValue:", locationObject);
        }, 200);
      }
    }
  }, [rentModal.initialData, reset, getByValue, setValue]);

  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const toilets = watch("toilets");
  const images = watch("images");
  const rentalType = watch("rental_type");

  const Map = useMemo(() => dynamic(() => import("../Map"), { ssr: false }), [location]);

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onBack = () => setStep((value) => value - 1);

  const listingTypeOptions = [
    { id: "Maison", label: "Maison", icon: FaHome },
    { id: "Appartement", label: "Appartement", icon: FaRegBuilding },
    { id: "Grange", label: "Grange", icon: FaWarehouse },
    { id: "Chambre_d_hotes", label: "Chambre d'hôtes", icon: FaBed },
    { id: "Bateau", label: "Bateau", icon: FaShip },
    { id: "Cabane", label: "Cabane", icon: GiTreehouse },
    { id: "Caravane_ou_camping_car", label: "Camping-car", icon: FaCampground },
    { id: "Casa_particular", label: "Casa Particular", icon: FaCouch },
    { id: "Chateau", label: "Château", icon: FaLandmark },
    { id: "Maison_troglodyte", label: "Troglodyte", icon: GiLockedChest },
    { id: "Conteneur_maritime", label: "Conteneur", icon: FaCubes },
    { id: "Maison_cycladique", label: "Cycladique", icon: FaTree },
  ];

  const listing_type = watch("listing_type");

  const onNext = () => {
    // Vérifier la validation avant de passer à l'étape suivante
    handleSubmit((data) => {
      // Si on arrive ici, la validation est OK, on peut passer à l'étape suivante
      if (step === STEPS.RENTAL_TYPE) {
        if (watch("rental_type") === "mensuel") return setStep(STEPS.PRICE_MENSUEL);
        return setStep(STEPS.PRICE);
      }
      if (step === STEPS.PRICE || step === STEPS.PRICE_MENSUEL) return setStep(STEPS.CITY);
      if (step === STEPS.CITY) return setStep(STEPS.LISTING_TYPE);
      setStep((value) => value + 1);
    }, (errors) => {
      // Si on arrive ici, il y a des erreurs de validation
      console.log("Erreurs de validation:", errors);
      if (errors.description) {
        toast.error("Description non conforme. Veuillez corriger les erreurs.");
      }
      if (errors.title) {
        toast.error("Titre requis.");
      }
      // Ne pas passer à l'étape suivante
    })();
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.LISTING_TYPE) return onNext();
    setIsLoading(true);

    const isEditMode = !!rentModal.initialData?.id;

    // Ajouter les frais selon le type de location
    if (data.rental_type === 'courte') {
      data.price = Number(data.price) + 1000;
    }

    if (data.rental_type === 'mensuel') {
      data.price_per_month = Number(data.price_per_month) + 1000;
    }

    const url = isEditMode
      ? `/api/listings/${rentModal.initialData.id}`
      : "/api/listings";

    const request = isEditMode
      ? axios.put(url, data)
      : axios.post(url, data);

    request
      .then(() => {
        toast.success(isEditMode ? "Annonce mise à jour !" : "Annonce créée !");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModal.onClose();
      })
      .catch((error) => {
        console.error("Erreur lors de la soumission:", error);
        toast.error("Une erreur est survenue");
      })
      .finally(() => setIsLoading(false));
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.LISTING_TYPE) {
      return rentModal.initialData?.id ? "Mettre à jour" : "Créer";
    }
    return "Suivant";
  }, [step, rentModal.initialData]);

  const secondaryActionLabel = useMemo(() => step === STEPS.CATEGORY ? undefined : "Retour", [step]);

  const amenities = [
    { id: "has_wifi", label: "Wifi", icon: FaWifi },
    { id: "has_kitchen", label: "Cuisine", icon: FaKitchenSet },
    { id: "has_parking", label: "Parking", icon: FaCar },
    { id: "has_pool", label: "Piscine", icon: FaSwimmingPool },
    { id: "has_balcony", label: "Balcon", icon: GiBacon },
    { id: "has_garden", label: "Jardin", icon: GiGardeningShears },
    { id: "has_terrace", label: "Terrasse", icon: GiTreehouse },
    { id: "has_living_room", label: "Salon", icon: FaCouch },
    { id: "is_furnished", label: "Meublé", icon: FaBed },
    { id: "has_tv", label: "TV", icon: FaTv },
    { id: "has_air_conditioning", label: "Climatisation", icon: FaFan },
    { id: "has_washing_machin", label: "Machine à laver", icon: GiWashingMachine },
    { id: "has_dryer", label: "Sèche-linge", icon: MdOutlineDryCleaning },
    { id: "has_hair_dryer", label: "Sèche-cheveux", icon: MdOutlineChair },
    { id: "has_fridge", label: "Réfrigérateur", icon: RiFridgeLine },
    { id: "has_dishwasher", label: "Lave-vaisselle", icon: FaKitchenSet },
    { id: "has_oven", label: "Four", icon: GiOden },
    { id: "has_fan", label: "Ventilateur", icon: FaFan },
    { id: "has_elevator", label: "Ascenseur", icon: FaRegBuilding },
    { id: "has_camera_surveillance", label: "Caméras de sécurité", icon: FaCamera },
    { id: "has_security", label: "Sécurité 24h/24", icon: MdOutlineSecurity },
    { id: "has_gym", label: "Salle de sport", icon: GiWeightLiftingUp },
  ];

  const rentalTypes = [
    { id: "mensuel", label: "Location mensuelle", icon: FaCalendar },
    { id: "courte", label: "Location courte durée", icon: FaMoneyBillWave },
  ];

  let bodyContent = null;

  if (step === STEPS.CATEGORY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading 
          title={rentModal.initialData?.id ? "Modifier la catégorie" : "Which of these best describes your place?"} 
          subtitle={rentModal.initialData?.id ? "Choisissez une nouvelle catégorie" : "Pick a category"} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {categories.map((item) => (
            <div key={item.label} className="col-span-1">
              <CategoryInput
                onClick={(category) => setCustomValue("category", category)}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Where is your place located?" subtitle="Help guests find you!" />
        <CountrySelect value={location} onChange={(value) => setCustomValue("location", value)} />
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Share some basics about your place" subtitle="What amenities do you have?" />
        <Counter title="Guests" subtitle="How many guests do you allow?" value={guestCount} onChange={(value) => setCustomValue("guestCount", value)} />
        <hr />
        <Counter title="Rooms" subtitle="How many rooms do you have?" value={roomCount} onChange={(value) => setCustomValue("roomCount", value)} />
        <hr />
        <Counter title="Bathrooms" subtitle="How many bathrooms do you have?" value={bathroomCount} onChange={(value) => setCustomValue("bathroomCount", value)} />
        <hr />
        <Counter
          title="Toilets"
          subtitle="How many toilets do you have?"
          value={toilets}
          onChange={(value) => setCustomValue("toilets", value)}
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Add a photo of your place" subtitle="Show guests what your place looks like!" />
        <ImageUpload
          value={images}
          onChange={(urls) => setCustomValue("images", urls)}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="How would you describe your place?" subtitle="Short and sweet works best!" />
        <Input id="title" label="Title" disabled={isLoading} register={register} errors={errors} required />
        <hr />
        <FilteredTextarea 
          id="description" 
          label="Description" 
          disabled={isLoading} 
          register={register} 
          errors={errors} 
          required 
          placeholder="Décrivez votre logement de manière accueillante et professionnelle..."
        />
      </div>
    );
  }

  if (step === STEPS.EQUIPEMENTS) {
    bodyContent = (
      <div className="flex flex-col gap-6 bg-white min-h-screen px-4 pt-6 pb-24">
        <Heading
          title="Indiquez les équipements disponibles"
          subtitle="Choisissez ce que vous offrez aux voyageurs"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {amenities.map((item) => {
            const Icon = item.icon as React.ComponentType<{ size?: number }>;
            return (
              <div
                key={item.id}
                onClick={() => setCustomValue(item.id, !watch(item.id))}
                className={`
                  border p-4 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition
                  ${watch(item.id) ? "border-rose-500 bg-rose-50" : "border-neutral-200"}
                `}
              >
                <Icon size={24} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === STEPS.RENTAL_TYPE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Quel type de location proposez-vous ?" subtitle="Choisissez une option" />
        <div className="grid grid-cols-2 gap-3">
          {rentalTypes.map((item) => {
            const Icon = item.icon as React.ComponentType<{ size?: number }>;
            return (
              <div
                key={item.id}
                onClick={() => setCustomValue("rental_type", item.id)}
                className={`
                  border p-4 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer
                  ${watch("rental_type") === item.id ? "border-rose-500 bg-rose-50" : "border-neutral-200"}
                `}
              >
                <Icon size={24} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    const userPrice = watch("price") || 0;
    const finalPrice = Number(userPrice) + 1000;

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Fixez votre prix par nuit" subtitle="Indiquez votre tarif de base" />
        <Input
          id="price"
          label="Prix par nuit (votre tarif)"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <div className="text-sm text-gray-700 bg-rose-50 border border-rose-200 rounded-md p-3 mt-2">
          Prix payé par le client : <strong>XAF {finalPrice.toLocaleString()}</strong><br />
          (Votre tarif + <strong>1 000 FCFA</strong> de frais Flexy)
        </div>
      </div>
    );
  }

  if (step === STEPS.PRICE_MENSUEL) {
    const userMonthlyPrice = watch("price_per_month") || 0;
    const finalMonthlyPrice = Number(userMonthlyPrice) + 1000;

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Définissez le loyer mensuel" subtitle="Indiquez votre tarif mensuel" />
        <Input
          id="price_per_month"
          label="Prix mensuel (votre tarif)"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <div className="text-sm text-gray-700 bg-rose-50 border border-rose-200 rounded-md p-3 mt-2">
          Prix payé par le client : <strong>XAF {finalMonthlyPrice.toLocaleString()}</strong><br />
          (Votre tarif + <strong>1 000 FCFA</strong> de frais Flexy)
        </div>
      </div>
    );
  }

  if (step === STEPS.CITY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Complétez votre localisation" subtitle="Ville et quartier" />
        <div className="flex flex-col gap-4">
          <label htmlFor="city" className="font-medium">Choisissez votre ville</label>
          <select
            id="city"
            {...register("city", { required: true })}
            className="p-3 border border-neutral-300 rounded-md"
          >
            <option value="">-- Sélectionner --</option>
            <option value="Pointe-Noire">Pointe-Noire</option>
            <option value="Brazzaville">Brazzaville</option>
            <option value="Dolisie">Dolisie</option>
          </select>

          <Input
            id="quater"
            label="Quartier"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.LISTING_TYPE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Quel type de logement ?" subtitle="Choisissez le style de votre hébergement" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listingTypeOptions.map((item) => {
            const Icon = item.icon as React.ComponentType<{ size?: number }>;
            return (
              <div
                key={item.id}
                onClick={() => setCustomValue("listing_type", item.id)}
                className={`border p-4 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition ${listing_type === item.id ? "border-rose-500 bg-rose-50" : "border-neutral-200"}`}
              >
                <Icon size={24} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={rentModal.isOpen}
      onClose={rentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title={rentModal.initialData?.id ? "Modifier votre logement" : "Flexii your home!"}
      body={bodyContent ?? <></>}
    />
  );
};

export default RentModal;