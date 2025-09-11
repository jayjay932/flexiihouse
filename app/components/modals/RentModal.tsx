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

// Define the location type based on what useCountries returns
type CountrySelectValue = {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
} | null | undefined;

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
          // Si c'est un tableau d'objets avec url, extraire les URLs
          imagesArray = rentModal.initialData.images.map((img: any) => 
            typeof img === 'string' ? img : img.url || img
          ).filter((url: string) => url && url.trim().length > 0);
        } else if (typeof rentModal.initialData.images === 'string') {
          try {
            // Essayer de parser si c'est un JSON string
            const parsed = JSON.parse(rentModal.initialData.images);
            if (Array.isArray(parsed)) {
              imagesArray = parsed.filter((url: string) => url && url.trim().length > 0);
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
      let locationObject: CountrySelectValue = null;
      if (rentModal.initialData.locationValue) {
        locationObject = getByValue(rentModal.initialData.locationValue) || null;
      }

      console.log("Images originales:", rentModal.initialData.images);
      console.log("Type des images:", typeof rentModal.initialData.images);
      console.log("Images converties:", imagesArray);
      console.log("Location object:", locationObject);

      // Enlever les frais de 1000 des prix pour afficher le prix original
      const originalPrice = rentModal.initialData.price && rentModal.initialData.price > 1000 
        ? rentModal.initialData.price - 1000 
        : rentModal.initialData.price || 1;

      const originalMonthlyPrice = rentModal.initialData.price_per_month && rentModal.initialData.price_per_month > 1000 
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
    // Vérifications de base avant de passer à l'étape suivante
    if (step === STEPS.CATEGORY && !category) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    
    if (step === STEPS.LOCATION && !location) {
      toast.error("Veuillez sélectionner un pays");
      return;
    }
    
    if (step === STEPS.IMAGES && (!images || images.length === 0)) {
      toast.error("Veuillez ajouter au moins une image");
      return;
    }
    
    if (step === STEPS.DESCRIPTION) {
      if (!watch("title") || watch("title").trim().length < 3) {
        toast.error("Titre requis (minimum 3 caractères)");
        return;
      }
      if (!watch("description") || watch("description").trim().length < 10) {
        toast.error("Description requise (minimum 10 caractères)");
        return;
      }
    }
    
    if (step === STEPS.CITY) {
      if (!watch("city")) {
        toast.error("Veuillez sélectionner une ville");
        return;
      }
      if (!watch("quater")) {
        toast.error("Veuillez indiquer le quartier");
        return;
      }
    }
    
    if (step === STEPS.LISTING_TYPE && !listing_type) {
      toast.error("Veuillez sélectionner un type de logement");
      return;
    }

    // Logique de navigation
    if (step === STEPS.RENTAL_TYPE) {
      if (watch("rental_type") === "mensuel") return setStep(STEPS.PRICE_MENSUEL);
      return setStep(STEPS.PRICE);
    }
    if (step === STEPS.PRICE || step === STEPS.PRICE_MENSUEL) return setStep(STEPS.CITY);
    if (step === STEPS.CITY) return setStep(STEPS.LISTING_TYPE);
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.LISTING_TYPE) return onNext();
    setIsLoading(true);

    console.log("🔍 Données avant soumission:", data);

    try {
      const isEditMode = !!rentModal.initialData?.id;

      // Validation finale des données critiques
      if (!data.title || data.title.trim().length < 3) {
        toast.error("Titre invalide");
        setIsLoading(false);
        return;
      }

      if (!data.description || data.description.trim().length < 10) {
        toast.error("Description invalide");
        setIsLoading(false);
        return;
      }

      if (!data.category) {
        toast.error("Catégorie requise");
        setIsLoading(false);
        return;
      }

      if (!data.location || !data.location.value) {
        toast.error("Localisation requise");
        setIsLoading(false);
        return;
      }

      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        toast.error("Au moins une image requise");
        setIsLoading(false);
        return;
      }

      if (!data.city || data.city.trim().length === 0) {
        toast.error("Ville requise");
        setIsLoading(false);
        return;
      }

      if (!data.quater || data.quater.trim().length === 0) {
        toast.error("Quartier requis");
        setIsLoading(false);
        return;
      }

      if (!data.listing_type || data.listing_type.trim().length === 0) {
        toast.error("Type de logement requis");
        setIsLoading(false);
        return;
      }

      // Validation des prix selon le type
      if (data.rental_type === 'courte') {
        const price = Number(data.price);
        if (isNaN(price) || price <= 0) {
          toast.error("Prix par nuit invalide");
          setIsLoading(false);
          return;
        }
        data.price = price + 1000; // Ajouter les frais
      }

      if (data.rental_type === 'mensuel') {
        const monthlyPrice = Number(data.price_per_month);
        if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
          toast.error("Prix mensuel invalide");
          setIsLoading(false);
          return;
        }
        data.price_per_month = monthlyPrice + 1000; // Ajouter les frais
      }

      // S'assurer que tous les équipements sont des booléens
      const equipmentFields = [
        'has_wifi', 'has_kitchen', 'has_parking', 'has_pool', 'has_balcony', 'has_garden',
        'has_terrace', 'has_living_room', 'is_furnished', 'has_tv', 'has_air_conditioning',
        'has_washing_machin', 'has_dryer', 'has_iron', 'has_hair_dryer', 'has_fridge',
        'has_dishwasher', 'has_oven', 'has_fan', 'has_elevator', 'has_camera_surveillance',
        'has_security', 'has_gym'
      ];

      equipmentFields.forEach(field => {
        data[field] = Boolean(data[field]);
      });

      // S'assurer que les nombres sont valides
      data.guestCount = Math.max(1, Number(data.guestCount) || 1);
      data.roomCount = Math.max(1, Number(data.roomCount) || 1);
      data.bathroomCount = Math.max(0, Number(data.bathroomCount) || 0);
      data.toilets = Math.max(0, Number(data.toilets) || 0);

      console.log("✅ Données finales:", data);

      const url = isEditMode
        ? `/api/listings/${rentModal.initialData.id}`
        : "/api/listings";

      const request = isEditMode
        ? axios.put(url, data)
        : axios.post(url, data);

      await request;
      
      toast.success(isEditMode ? "Annonce mise à jour !" : "Annonce créée !");
      router.refresh();
      reset();
      setStep(STEPS.CATEGORY);
      rentModal.onClose();
      
    } catch (error: any) {
      console.error("❌ Erreur complète:", error);
      
      // Gestion détaillée des erreurs
      if (error.response) {
        console.error("📡 Status:", error.response.status);
        console.error("📡 Data:", error.response.data);
        
        if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.details && Array.isArray(errorData.details)) {
            errorData.details.forEach((detail: string, index: number) => {
              setTimeout(() => toast.error(detail), index * 1000);
            });
          } else if (errorData.error) {
            toast.error(errorData.error);
          } else {
            toast.error("Données invalides - vérifiez tous les champs");
          }
        } else if (error.response.status === 401) {
          toast.error("Vous devez être connecté");
        } else if (error.response.status === 500) {
          toast.error("Erreur serveur - veuillez réessayer");
        } else {
          toast.error(`Erreur ${error.response.status}: ${error.response.data?.error || 'Erreur inconnue'}`);
        }
      } else if (error.request) {
        console.error("📡 Pas de réponse du serveur");
        toast.error("Impossible de contacter le serveur");
      } else {
        console.error("📡 Erreur de configuration:", error.message);
        toast.error("Erreur de configuration");
      }
    } finally {
      setIsLoading(false);
    }
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
    { id: "has_iron", label: "Fer à repasser", icon: MdOutlineIron }, // ✅ AJOUTÉ
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
        title={rentModal.initialData?.id ? "Modifier la catégorie" : "Laquelle de ces options décrit le mieux votre logement ?"}
        subtitle={rentModal.initialData?.id ? "Choisissez une nouvelle catégorie" : "Sélectionnez une catégorie"}
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
      <Heading
        title="Choisissez un pays"
        subtitle="Aidez les voyageurs à vous trouver !"
      />
      <CountrySelect
        value={location}
        onChange={(value) => setCustomValue("location", value)}
      />
      <Map center={location?.latlng} />
    </div>
  );
}


 // Version alternative avec plus d'espace si nécessaire
if (step === STEPS.INFO) {
  bodyContent = (
    <div className="flex flex-col gap-8 pb-40 sm:pb-32 lg:pb-6">
      <Heading
        title="Partagez quelques informations de base sur votre logement"
        subtitle="Quels équipements avez-vous ?"
      />
      <Counter
        title="Personnes"
        subtitle="Combien de personnes au maximum autorisez-vous ?"
        value={guestCount}
        onChange={(value) => setCustomValue("guestCount", value)}
      />
      <hr />
      <Counter
        title="Chambres"
        subtitle="Combien de chambres avez-vous ?"
        value={roomCount}
        onChange={(value) => setCustomValue("roomCount", value)}
      />
      <hr />
      <Counter
        title="Salles de bain"
        subtitle="Combien de salles de bain avez-vous ?"
        value={bathroomCount}
        onChange={(value) => setCustomValue("bathroomCount", value)}
      />
      <hr />
      <Counter
        title="Toilettes"
        subtitle="Combien de toilettes avez-vous ?"
        value={toilets}
        onChange={(value) => setCustomValue("toilets", value)}
      />
      {/* Espace supplémentaire pour s'assurer que les boutons sont visibles */}
      <div className="h-4"></div>
    </div>
  );
}

 if (step === STEPS.IMAGES) {
  bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Ajoutez une photo de votre logement"
        subtitle="Montrez aux voyageurs à quoi ressemble votre logement !"
      />
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
      <Heading
        title="Comment décririez-vous votre logement ?"
        subtitle="Court et clair, c'est ce qui fonctionne le mieux !"
      />
      <Input
        id="title"
        label="Titre"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
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
     <div className="flex flex-col gap-6 bg-white min-h-screen px-4 pt-6 pb-32 sm:pb-36 lg:pb-6">
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
          (Votre tarif + <strong>1 000 FCFA</strong> de frais Flexii)
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