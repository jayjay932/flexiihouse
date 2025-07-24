'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";

import Modal from ".";
import Heading from "../Heading";
import Input from "../inputs";
import FilteredTextarea from "../inputs/FilteredTextarea";
import ImageUpload from "../inputs/ImageUpload";
import CountrySelect from "../inputs/CountrySelect";
import Counter from "../inputs/Counter";
import useCountries from "@/app/hooks/useCountries";

interface SimpleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

const SimpleEditModal: React.FC<SimpleEditModalProps> = ({
  isOpen,
  onClose,
  listingId
}) => {
  const router = useRouter();
  const { getByValue } = useCountries();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const loadedListingId = useRef<string | null>(null); // Pour éviter les rechargements

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
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 0,
      toilets: 0,
      price: 1,
      price_per_month: 0,
      city: '',
      quater: '',
      rental_type: 'mensuel'
    },
  });

  // Charger les données du listing - AVEC PROTECTION CONTRE LA BOUCLE
  useEffect(() => {
    // Ne charger que si le modal est ouvert ET si ce n'est pas déjà chargé
    if (isOpen && listingId && loadedListingId.current !== listingId) {
      setIsLoadingData(true);
      loadedListingId.current = listingId; // Marquer comme chargé
      
      console.log("Chargement des données pour:", listingId);
      
      axios.get(`/api/listings/${listingId}`)
        .then((response) => {
          const data = response.data;
          console.log("Données reçues:", data);

          // Traiter les images
          let imagesArray: string[] = [];
          if (data.images) {
            if (Array.isArray(data.images)) {
              imagesArray = data.images;
            } else if (typeof data.images === 'string') {
              try {
                const parsed = JSON.parse(data.images);
                imagesArray = Array.isArray(parsed) ? parsed : [data.images];
              } catch {
                imagesArray = [data.images];
              }
            }
          }

          // Traiter la location
          const locationObject = data.locationValue ? getByValue(data.locationValue) : null;

          // Enlever les frais de 1000
          const originalPrice = data.price > 1000 ? data.price - 1000 : data.price || 1;
          const originalMonthlyPrice = data.price_per_month > 1000 ? data.price_per_month - 1000 : data.price_per_month || 0;

          // Pré-remplir le formulaire
          reset({
            title: data.title || '',
            description: data.description || '',
            images: imagesArray,
            location: locationObject,
            guestCount: data.guestCount || 1,
            roomCount: data.roomCount || 1,
            bathroomCount: data.bathroomCount || 0,
            toilets: data.toilets || 0,
            price: originalPrice,
            price_per_month: originalMonthlyPrice,
            city: data.city || '',
            quater: data.quater || '',
            rental_type: data.rental_type || 'mensuel'
          });

          // Debug des données affichées
          console.log("Images traitées:", imagesArray);
          console.log("Location traitée:", locationObject);
          console.log("Prix original:", originalPrice);
          console.log("Prix mensuel original:", originalMonthlyPrice);

          // Forcer l'affichage des données complexes avec un délai
          setTimeout(() => {
            if (imagesArray.length > 0) {
              setValue("images", imagesArray, { shouldValidate: false, shouldDirty: false });
            }
            if (locationObject) {
              setValue("location", locationObject, { shouldValidate: false, shouldDirty: false });
            }
            console.log("Valeurs forcées appliquées");
          }, 500); // Délai plus long
        })
        .catch((error) => {
          console.error('Erreur:', error);
          toast.error("Impossible de charger les données");
          loadedListingId.current = null; // Reset en cas d'erreur
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }

    // Reset quand le modal se ferme
    if (!isOpen) {
      loadedListingId.current = null;
    }
  }, [isOpen, listingId]); // SEULEMENT ces deux dépendances !

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    console.log("Données du formulaire avant traitement:", data);

    // Préparer les données pour l'envoi
    const finalData = {
      title: data.title || '',
      description: data.description || '',
      images: data.images || [],
      location: data.location || null,
      guestCount: parseInt(data.guestCount) || 1,
      roomCount: parseInt(data.roomCount) || 1,
      bathroomCount: parseInt(data.bathroomCount) || 0,
      toilets: parseInt(data.toilets) || 0,
      rental_type: data.rental_type || 'mensuel',
      city: data.city || '',
      quater: data.quater || '',
      price: data.rental_type === 'courte' ? (parseInt(data.price) || 0) + 1000 : parseInt(data.price) || 1,
      price_per_month: data.rental_type === 'mensuel' ? (parseInt(data.price_per_month) || 0) + 1000 : parseInt(data.price_per_month) || 0
    };

    console.log("Données finales à envoyer:", finalData);

    axios.put(`/api/listings/${listingId}`, finalData)
      .then((response) => {
        console.log("Réponse de l'API:", response.data);
        toast.success("Logement mis à jour avec succès !");
        router.refresh();
        onClose();
        loadedListingId.current = null; // Reset après sauvegarde
      })
      .catch((error) => {
        console.error('Erreur complète:', error);
        console.error('Réponse de l\'erreur:', error.response?.data);
        toast.error(`Erreur: ${error.response?.data?.error || error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const images = watch("images");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const toilets = watch("toilets");
  const rentalType = watch("rental_type");

  const bodyContent = isLoadingData ? (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      <span className="ml-3">Chargement des données...</span>
    </div>
  ) : (
    <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
      <Heading title="Modifier votre logement" subtitle="Modifiez les informations de base" />
      
      {/* Titre et Description */}
      <div className="grid grid-cols-1 gap-4">
        <Input
          id="title"
          label="Titre"
          disabled={isLoading}
          register={register}
          errors={errors}
          // required retiré
        />
        <FilteredTextarea
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          placeholder="Décrivez votre logement de manière accueillante et professionnelle..."
          // required retiré
        />
      </div>

      {/* Images */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Photos</label>
        <ImageUpload
          value={images || []}
          onChange={(urls) => setValue("images", urls)}
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Pays</label>
        <CountrySelect 
          value={location} 
          onChange={(value) => setValue("location", value)} 
        />
      </div>

      {/* Capacité */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Invités</label>
          <Counter 
            title="" 
            subtitle="" 
            value={guestCount} 
            onChange={(value) => setValue("guestCount", value)} 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Chambres</label>
          <Counter 
            title="" 
            subtitle="" 
            value={roomCount} 
            onChange={(value) => setValue("roomCount", value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Salles de bain</label>
          <Counter 
            title="" 
            subtitle="" 
            value={bathroomCount} 
            onChange={(value) => setValue("bathroomCount", value)} 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Toilettes</label>
          <Counter 
            title="" 
            subtitle="" 
            value={toilets} 
            onChange={(value) => setValue("toilets", value)} 
          />
        </div>
      </div>

      {/* Type de location */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Type de location</label>
        <select
          {...register("rental_type")} // required retiré
          className="w-full p-3 border border-neutral-300 rounded-md"
        >
          <option value="mensuel">Location mensuelle</option>
          <option value="courte">Location courte durée</option>
        </select>
      </div>

      {/* Prix */}
      <div className="grid grid-cols-1 gap-4">
        {rentalType === 'courte' ? (
          <Input
            id="price"
            label="Prix par nuit (FCFA)"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
            // required retiré
          />
        ) : (
          <Input
            id="price_per_month"
            label="Prix mensuel (FCFA)"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
            // required retiré
          />
        )}
      </div>

      {/* Ville et Quartier */}
      <div className="grid grid-cols-2 gap-4">
        <select
          {...register("city")} // required retiré
          className="p-3 border border-neutral-300 rounded-md"
        >
          <option value="">Sélectionner une ville</option>
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
          // required retiré
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={isLoading ? "Sauvegarde..." : "Sauvegarder"}
      secondaryActionLabel="Annuler"
      secondaryAction={onClose}
      title="Modifier le logement"
      body={bodyContent}
      disabled={isLoading || isLoadingData}
    />
  );
};

export default SimpleEditModal;