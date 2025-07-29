'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Home, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Waves, 
  TreePine, 
  Wind, 
  Tv, 
  ChefHat, 
  Shield, 
  Camera,
  Dumbbell,
  Zap,
  Coffee,
  Sparkles,
  Edit3,
  Image as ImageIcon,
  DollarSign,
  Star,
  Check
} from "lucide-react";

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
  const loadedListingId = useRef<string | null>(null);

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
      rental_type: 'mensuel',
      // Équipements par défaut
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
    },
  });

  // Charger les données du listing
  useEffect(() => {
    if (isOpen && listingId && loadedListingId.current !== listingId) {
      setIsLoadingData(true);
      loadedListingId.current = listingId;
      
      axios.get(`/api/listings/${listingId}`)
        .then((response) => {
          const data = response.data;
          
          let imagesArray: string[] = [];
          if (data.images && Array.isArray(data.images)) {
            imagesArray = data.images.map((img: any) => img.url).filter(Boolean);
          } else if (typeof data.images === 'string') {
            try {
              const parsed = JSON.parse(data.images);
              imagesArray = Array.isArray(parsed) ? parsed : [data.images];
            } catch {
              imagesArray = [data.images];
            }
          }

          const locationObject = data.locationValue ? getByValue(data.locationValue) : null;
          const originalPrice = data.price > 1000 ? data.price - 1000 : data.price || 1;
          const originalMonthlyPrice = data.price_per_month > 1000 ? data.price_per_month - 1000 : data.price_per_month || 0;

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
            rental_type: data.rental_type || 'mensuel',
            // Équipements
            has_wifi: data.has_wifi || false,
            has_kitchen: data.has_kitchen || false,
            has_parking: data.has_parking || false,
            has_pool: data.has_pool || false,
            has_balcony: data.has_balcony || false,
            has_garden: data.has_garden || false,
            has_terrace: data.has_terrace || false,
            has_living_room: data.has_living_room || false,
            is_furnished: data.is_furnished || false,
            has_tv: data.has_tv || false,
            has_air_conditioning: data.has_air_conditioning || false,
            has_washing_machin: data.has_washing_machin || false,
            has_dryer: data.has_dryer || false,
            has_iron: data.has_iron || false,
            has_hair_dryer: data.has_hair_dryer || false,
            has_fridge: data.has_fridge || false,
            has_dishwasher: data.has_dishwasher || false,
            has_oven: data.has_oven || false,
            has_fan: data.has_fan || false,
            has_elevator: data.has_elevator || false,
            has_camera_surveillance: data.has_camera_surveillance || false,
            has_security: data.has_security || false,
            has_gym: data.has_gym || false,
          });

          setTimeout(() => {
            if (imagesArray.length > 0) {
              setValue("images", imagesArray, { shouldValidate: false, shouldDirty: false });
            }
            if (locationObject) {
              setValue("location", locationObject, { shouldValidate: false, shouldDirty: false });
            }
            if (data.description) {
              setValue("description", data.description, { shouldValidate: false, shouldDirty: false });
            }
            if (data.title) {
              setValue("title", data.title, { shouldValidate: false, shouldDirty: false });
            }
          }, 500);
        })
        .catch((error) => {
          console.error('Erreur:', error);
          toast.error("Impossible de charger les données");
          loadedListingId.current = null;
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }

    if (!isOpen) {
      loadedListingId.current = null;
    }
  }, [isOpen, listingId, getByValue, reset, setValue]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    const finalData: any = {};

    if (data.title !== undefined && data.title !== '') finalData.title = data.title;
    if (data.description !== undefined && data.description !== '') finalData.description = data.description;
    
    if (data.images !== undefined && Array.isArray(data.images) && data.images.length > 0) {
      finalData.images = data.images;
    }
    
    if (data.location !== undefined) finalData.location = data.location;
    if (data.guestCount !== undefined) finalData.guestCount = parseInt(data.guestCount) || 1;
    if (data.roomCount !== undefined) finalData.roomCount = parseInt(data.roomCount) || 1;
    if (data.bathroomCount !== undefined) finalData.bathroomCount = parseInt(data.bathroomCount) || 0;
    if (data.toilets !== undefined) finalData.toilets = parseInt(data.toilets) || 0;
    if (data.rental_type !== undefined && data.rental_type !== '') finalData.rental_type = data.rental_type;
    if (data.city !== undefined && data.city !== '') finalData.city = data.city;
    if (data.quater !== undefined && data.quater !== '') finalData.quater = data.quater;

    if (data.rental_type === 'courte') {
      if (data.price !== undefined) {
        finalData.price = (parseInt(data.price) || 0) + 1000;
      }
      finalData.price_per_month = 0;
    } else {
      if (data.price_per_month !== undefined) {
        finalData.price_per_month = (parseInt(data.price_per_month) || 0) + 1000;
      }
      finalData.price = 1;
    }

    const amenities = [
      'has_wifi', 'has_kitchen', 'has_parking', 'has_pool', 'has_balcony', 
      'has_garden', 'has_terrace', 'has_living_room', 'is_furnished', 'has_tv', 
      'has_air_conditioning', 'has_washing_machin', 'has_dryer', 'has_iron', 
      'has_hair_dryer', 'has_fridge', 'has_dishwasher', 'has_oven', 'has_fan', 
      'has_elevator', 'has_camera_surveillance', 'has_security', 'has_gym'
    ];

    amenities.forEach(amenity => {
      if (data[amenity] !== undefined) {
        finalData[amenity] = Boolean(data[amenity]);
      }
    });

    axios.put(`/api/listings/${listingId}`, finalData)
      .then((response) => {
        toast.success("Logement mis à jour avec succès !");
        router.refresh();
        onClose();
        loadedListingId.current = null;
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.details || 
                           error.response?.data?.error || 
                           error.message || 
                           'Erreur inconnue';
        toast.error(`Erreur: ${errorMessage}`);
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

  // Équipements avec icônes et catégories
  const amenitiesConfig = [
    { key: 'has_wifi', label: 'Wi-Fi', icon: Wifi, category: 'essential' },
    { key: 'has_kitchen', label: 'Cuisine', icon: ChefHat, category: 'essential' },
    { key: 'has_parking', label: 'Parking', icon: Car, category: 'essential' },
    { key: 'has_air_conditioning', label: 'Climatisation', icon: Wind, category: 'comfort' },
    { key: 'has_tv', label: 'Télévision', icon: Tv, category: 'comfort' },
    { key: 'has_pool', label: 'Piscine', icon: Waves, category: 'luxury' },
    { key: 'has_garden', label: 'Jardin', icon: TreePine, category: 'outdoor' },
    { key: 'has_balcony', label: 'Balcon', icon: Home, category: 'outdoor' },
    { key: 'has_terrace', label: 'Terrasse', icon: Home, category: 'outdoor' },
    { key: 'has_living_room', label: 'Salon', icon: Home, category: 'rooms' },
    { key: 'is_furnished', label: 'Meublé', icon: Sparkles, category: 'comfort' },
    { key: 'has_washing_machin', label: 'Lave-linge', icon: Sparkles, category: 'appliances' },
    { key: 'has_dryer', label: 'Sèche-linge', icon: Wind, category: 'appliances' },
    { key: 'has_fridge', label: 'Réfrigérateur', icon: Coffee, category: 'appliances' },
    { key: 'has_dishwasher', label: 'Lave-vaisselle', icon: Sparkles, category: 'appliances' },
    { key: 'has_oven', label: 'Four', icon: ChefHat, category: 'appliances' },
    { key: 'has_iron', label: 'Fer à repasser', icon: Zap, category: 'convenience' },
    { key: 'has_hair_dryer', label: 'Sèche-cheveux', icon: Wind, category: 'convenience' },
    { key: 'has_fan', label: 'Ventilateur', icon: Wind, category: 'comfort' },
    { key: 'has_elevator', label: 'Ascenseur', icon: Home, category: 'building' },
    { key: 'has_camera_surveillance', label: 'Vidéosurveillance', icon: Camera, category: 'security' },
    { key: 'has_security', label: 'Sécurité', icon: Shield, category: 'security' },
    { key: 'has_gym', label: 'Salle de sport', icon: Dumbbell, category: 'luxury' }
  ];

  const categorizedAmenities = amenitiesConfig.reduce((acc, amenity) => {
    if (!acc[amenity.category]) acc[amenity.category] = [];
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, typeof amenitiesConfig>);

  const categoryLabels = {
    essential: 'Essentiels',
    comfort: 'Confort',
    luxury: 'Luxe',
    outdoor: 'Extérieur',
    rooms: 'Espaces',
    appliances: 'Électroménager',
    convenience: 'Commodités',
    building: 'Immeuble',
    security: 'Sécurité'
  };

  const bodyContent = isLoadingData ? (
    <div className="flex justify-center items-center py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement des données...</p>
      </div>
    </div>
  ) : (
    <div className="space-y-8 max-h-[80vh] overflow-y-auto px-1">
      {/* En-tête */}
      <div className="text-center pb-6 border-b border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Modifier votre logement</h2>
        <p className="text-gray-600">Tous les champs sont optionnels</p>
      </div>

      {/* Section 1: Informations de base */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <Edit3 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Informations de base</h3>
        </div>
        
        <div className="space-y-5">
          <div>
            <Input
              id="title"
              label="Titre de votre annonce"
              disabled={isLoading}
              register={register}
              errors={errors}
              required={false}
            />
          </div>
          
          <div>
            <FilteredTextarea
              id="description"
              label="Description détaillée"
              disabled={isLoading}
              register={register}
              errors={errors}
              placeholder="Partagez ce qui rend votre logement unique et accueillant..."
              required={false}
              value={watch("description") || ''}
              onChange={(value) => setValue("description", value, { shouldValidate: true })}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Photos */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Photos de votre logement</h3>
        </div>
        
        <div className="space-y-4">
          <ImageUpload
            value={watch("images") || []}
            onChange={(urls) => setValue("images", urls, { shouldValidate: false })}
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
            <Check className="h-4 w-4 text-blue-600" />
            <span>{(watch("images") || []).length} photo(s) ajoutée(s)</span>
          </div>
        </div>
      </div>

      {/* Section 3: Emplacement */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Emplacement</h3>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
            <CountrySelect 
              value={location} 
              onChange={(value) => setValue("location", value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <select
                {...register("city", { required: false })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:ring-black transition-all duration-200"
              >
                <option value="">Sélectionner une ville</option>
                <option value="Pointe-Noire">Pointe-Noire</option>
                <option value="Brazzaville">Brazzaville</option>
                <option value="Dolisie">Dolisie</option>
              </select>
            </div>
            
            <div>
              <Input
                id="quater"
                label="Quartier"
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Capacité d'accueil */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Capacité d'accueil</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Invités</span>
            </div>
            <Counter 
              title="" 
              subtitle="" 
              value={guestCount} 
              onChange={(value) => setValue("guestCount", value)}
            />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Bed className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Chambres</span>
            </div>
            <Counter 
              title="" 
              subtitle="" 
              value={roomCount} 
              onChange={(value) => setValue("roomCount", value)}
            />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Bath className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Salles de bain</span>
            </div>
            <Counter 
              title="" 
              subtitle="" 
              value={bathroomCount} 
              onChange={(value) => setValue("bathroomCount", value)}
            />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Home className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Toilettes</span>
            </div>
            <Counter 
              title="" 
              subtitle="" 
              value={toilets} 
              onChange={(value) => setValue("toilets", value)}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Tarification */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tarification</h3>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de location</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                rentalType === 'mensuel' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="mensuel"
                  {...register("rental_type")}
                  className="sr-only"
                />
                <span className="font-medium">Mensuel</span>
              </label>
              
              <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                rentalType === 'courte' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="courte"
                  {...register("rental_type")}
                  className="sr-only"
                />
                <span className="font-medium">Courte durée</span>
              </label>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            {rentalType === 'courte' ? (
              <Input
                id="price"
                label="Prix par nuit (FCFA)"
                type="number"
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
              />
            ) : (
              <Input
                id="price_per_month"
                label="Prix mensuel (FCFA)"
                type="number"
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Équipements */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-xl">
            <Star className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Équipements disponibles</h3>
        </div>
        
        <div className="space-y-6">
          {Object.entries(categorizedAmenities).map(([category, amenities]) => (
            <div key={category} className="bg-white p-4 rounded-xl border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenities.map((amenity) => {
                  const IconComponent = amenity.icon;
                  const isSelected = watch(amenity.key);
                  
                  return (
                    <label
                      key={amenity.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        {...register(amenity.key)}
                        className="sr-only"
                      />
                      <IconComponent className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      <span className="text-sm font-medium">{amenity.label}</span>
                      {isSelected && <Check className="h-4 w-4 ml-auto flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
      secondaryActionLabel="Annuler"
      secondaryAction={onClose}
      title=""
      body={bodyContent}
      disabled={isLoading || isLoadingData}
    />
  );
};

export default SimpleEditModal;