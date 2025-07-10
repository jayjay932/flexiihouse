'use client';

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";
import { FC, useState, useEffect } from "react";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import dynamic from "next/dynamic";
import { IoMdClose } from "react-icons/io";

import {
  FaWifi, FaCar, FaCouch, FaBed, FaTv, FaFan, FaCamera,
  FaSwimmingPool, FaRegBuilding
} from "react-icons/fa";
import { MdOutlineKitchen } from "react-icons/md";
import {
  GiGardeningShears, GiBacon, GiTreehouse, GiOden,
  GiWashingMachine, GiWeightLiftingUp,
} from "react-icons/gi";
import {
  MdOutlineSecurity, MdOutlineIron, MdOutlineDryCleaning, MdOutlineHardware,
} from "react-icons/md";
import { RiFridgeLine } from "react-icons/ri";

const Map = dynamic(() => import("../Map"), { ssr: false });
const CloseIcon = IoMdClose as React.FC<{ size?: number; className?: string }>;

type EquipmentProps = {
  has_wifi?: boolean;
  has_kitchen?: boolean;
  has_parking?: boolean;
  has_pool?: boolean;
  has_balcony?: boolean;
  has_garden?: boolean;
  has_terrace?: boolean;
  has_living_room?: boolean;
  is_furnished?: boolean;
  has_tv?: boolean;
  has_air_conditioning?: boolean;
  has_washing_machin?: boolean;
  has_dryer?: boolean;
  has_iron?: boolean;
  has_hair_dryer?: boolean;
  has_fridge?: boolean;
  has_dishwasher?: boolean;
  has_oven?: boolean;
  has_fan?: boolean;
  has_elevator?: boolean;
  has_camera_surveillance?: boolean;
  has_security?: boolean;
  has_gym?: boolean;
};

interface ListingInfoProps extends EquipmentProps {
  user: SafeUser;
  description: string;
  guestCount: number;
  roomCount: number;
  bathroomCount: number;
  quater: string;
  city?: string;
  price: number;
  price_per_month: number;
  rental_type: string;
  toilets: number;
  category: {
    icon: IconType;
    label: string;
    description: string;
  } | undefined;
  locationValue: string;
}

const ListingInfo: FC<ListingInfoProps> = ({
  user,
  description,
  guestCount,
  roomCount,
  bathroomCount,
  toilets,
  category,
  city,
  price,
  price_per_month,
  rental_type,
  locationValue,
  quater,
  ...equipment
}) => {
  const { getByValue } = useCountries();
  const coordinate = getByValue(locationValue)?.latlng;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const DESCRIPTION_LIMIT = 200;
  const isLongDescription = description.length > DESCRIPTION_LIMIT;
  const shortDescription = isLongDescription
    ? description.slice(0, DESCRIPTION_LIMIT) + "..."
    : description;

  const amenities: { id: keyof EquipmentProps; label: string; icon: IconType }[] = [
    { id: "has_wifi", label: "Wifi", icon: FaWifi },
    { id: "has_kitchen", label: "Cuisine", icon: MdOutlineKitchen },
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
    { id: "has_iron", label: "Fer à repasser", icon: MdOutlineIron },
    { id: "has_hair_dryer", label: "Sèche-cheveux", icon: MdOutlineHardware },
    { id: "has_fridge", label: "Réfrigérateur", icon: RiFridgeLine },
    { id: "has_dishwasher", label: "Lave-vaisselle", icon: MdOutlineKitchen },
    { id: "has_oven", label: "Four", icon: GiOden },
    { id: "has_fan", label: "Ventilateur", icon: FaFan },
    { id: "has_elevator", label: "Ascenseur", icon: FaRegBuilding },
    { id: "has_camera_surveillance", label: "Caméra", icon: FaCamera },
    { id: "has_security", label: "Sécurité 24h/24", icon: MdOutlineSecurity },
    { id: "has_gym", label: "Salle de sport", icon: GiWeightLiftingUp },
  ];
const [showAllEquipments, setShowAllEquipments] = useState(false);

const filteredAmenities = amenities.filter((item) => equipment[item.id]);
const displayedAmenities = showAllEquipments
  ? filteredAmenities
  : filteredAmenities.slice(0, 10);

  return (
    <div className={`col-span-4 flex flex-col gap-6 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`}>
      {/* Catégorie avec animation */}
    




   {/* Section évaluations et badges - Style Airbnb exact */}
      <div className="animate-fade-in-up delay-350">
        <div className="flex flex-col gap-8">
          {/* Header avec note et badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">4,96</span>
              <div className="flex text-black">
                {'★'.repeat(5)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-center">
              <span className="text-2xl">🏆</span>
              <span className="font-semibold">Coup de cœur voyageurs</span>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">53</div>
              <div className="text-gray-600 text-sm">Commentaires</div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Hôte info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Avatar src={user?.image} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-300">
                <svg width="12" height="12" viewBox="0 0 16 16" className="text-red-500">
                  <path d="M10.5 5.5L6.5 9.5l-2-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Séjournez chez {user?.name}</div>
              <div className="text-gray-600 text-sm">Superhôte • Hôte depuis 2 ans</div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Badges de qualité */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  Ce logement fait partie des 10 % de logements préférés sur Airbnb
                </div>
                <div className="text-gray-600 text-sm">
                  Ce logement est très bien classé, d'après ses évaluations, ses commentaires et la 
                  fiabilité de l'annonce selon les voyageurs.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">🔍</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Procédure d'arrivée irréprochable</div>
                <div className="text-gray-600 text-sm">
                  Les voyageurs récents ont apprécié que leur séjour débute sans accroc.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl">🏠</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Chambre dans appartement</div>
                <div className="text-gray-600 text-sm">
                  Votre chambre privée dans un logement, avec accès à des espaces partagés.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>













  <div className="animate-fade-in-up delay-200 w-full">
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-full">
    <div className="flex flex-col gap-3">
      <div className="text-xl font-semibold flex items-center gap-3">
        <div>Hébergé par {user?.name}</div>
        <Avatar src={user?.image} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-gray-600">
        <div>{guestCount} voyageurs</div>
        <div>·</div>
        <div>{roomCount} chambres</div>
        <div>·</div>
        <div>{bathroomCount} douches</div>
        <div>·</div>
        <div>{toilets} toilettes</div>
      </div>
    </div>
  </div>
</div>


      <hr className="border-gray-200" />

     






<div className="animate-fade-in-up delay-350">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-black">À propos de ce logement</h2>
          
          <div>
            <p className="text-gray-900 leading-relaxed">
              {shortDescription}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="text-gray-900 underline font-medium mt-4 hover:no-underline transition-all"
              >
                Lire la suite
              </button>
            )}
          </div>
        </div>
      </div>

     {showFullDescription && (
  <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center px-4 pt-10 pb-10 animate-fade-in">
      <div className="bg-white w-full max-w-md md:max-w-2xl rounded-xl shadow-xl p-6 relative animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowFullDescription(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-black mb-6">
          À propos de ce logement
        </h2>
        <p className="text-gray-900 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  </div>
)}









     

     {/* Quartier avec animation */}
      <div className="animate-fade-in-up delay-300">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-grey-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            Quartier : {quater}
          </h1>
        </div>
      </div>


      <hr className="border-gray-200" />

      {/* Ce que propose ce logement - Style Airbnb exact */}
   <div className="animate-fade-in-up delay-400">
  <div className="flex flex-col gap-6">
    <h2 className="text-2xl font-semibold">Ce que propose ce logement</h2>

    <div className="grid grid-cols-1 gap-4">
      {displayedAmenities.map(({ id, label, icon }) => {
        const IconComponent = icon as React.FC<{ size?: number; className?: string }>;
        return (
          <div key={id} className="flex items-center gap-4 py-2">
            <IconComponent size={24} className="text-gray-700" />
            <span className="text-gray-900">{label}</span>
          </div>
        );
      })}
    </div>

    {filteredAmenities.length > 10 && (
      <button
        onClick={() => setShowAllEquipments((prev) => !prev)}
        className="mt-4 border border-gray-900 rounded-lg py-3 px-6 text-gray-900 font-medium hover:bg-gray-50 transition-colors w-fit"
      >
        {showAllEquipments
          ? "Réduire la liste"
          : `Afficher les ${filteredAmenities.length} équipements`}
      </button>
    )}
  </div>
</div>


      <hr className="border-gray-200" />

      {/* Où se situe le logement */}
      <div className="animate-fade-in-up delay-500">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">Où se situe le logement</h2>
          <p className="text-gray-600">{quater}, {city}</p>
          <div className="rounded-lg overflow-hidden">
            <Map center={coordinate} />
          </div>
        </div>
      </div>



      {/* Section Commentaires - Style Airbnb exact */}
      <div className="animate-fade-in-up delay-650">
        <div className="flex flex-col gap-8">
          {/* Header avec note et lauriers */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-4xl">🏆</span>
              <div className="text-6xl font-bold text-black">4,96</div>
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-semibold text-black mb-4">Coup de cœur voyageurs</h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              Ce logement fait partie des <strong>10 % de logements préférés</strong> sur Airbnb parmi les 
              logements éligibles, à partir des évaluations, des commentaires et de la fiabilité des 
              annonces selon les voyageurs.
            </p>
          </div>

          {/* Commentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commentaire 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  <span className="text-white font-semibold">ML</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marie-Lou</div>
                  <div className="text-gray-600 text-sm">3 ans sur Airbnb</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex text-black">
                  {'★'.repeat(5)}
                </div>
                <span className="text-gray-600 text-sm">Aujourd'hui</span>
              </div>
              
              <p className="text-gray-900">
                Je ne suis restée qu'une nuit mais elle a été très accueillante, très gentille et s'est 
                assurée que j'avais tout ce dont j'avais besoin.
              </p>
            </div>

            {/* Commentaire 2 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  <span className="text-white font-semibold">TH</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Thomas</div>
                  <div className="text-gray-600 text-sm">2 ans sur Airbnb</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex text-black">
                  {'★'.repeat(5)}
                </div>
                <span className="text-gray-600 text-sm">Il y a 1 semaine</span>
              </div>
              
              <p className="text-gray-900">
                Accueil chaleureux, logement conforme à la description. Je recommande vivement ce 
                logement pour un séjour à Paris.
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col gap-4 items-center">
            <button className="bg-white border border-gray-900 rounded-lg py-3 px-8 text-gray-900 font-semibold hover:bg-gray-50 transition-colors">
              Afficher les 53 commentaires
            </button>
            <button className="text-gray-600 underline text-sm hover:text-gray-900 transition-colors">
              Fonctionnement des commentaires
            </button>
          </div>
        </div>
      </div>







      <hr className="border-gray-200" />

      {/* Faites connaissance avec votre hôte - Style Airbnb exact */}
      <div className="animate-fade-in-up delay-600">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">Faites connaissance avec votre hôte</h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Avatar src={user?.image} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-300">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-red-500">
                    <path d="M10.5 5.5L6.5 9.5l-2-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-semibold">{user?.name}</span>
                <span className="text-gray-600">Superhôte</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div>
                <div className="font-semibold text-lg">318</div>
                <div className="text-gray-600">évaluations</div>
              </div>
              <div>
                <div className="font-semibold text-lg flex items-center">
                  4,79 
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="text-gray-600">en note globale</div>
              </div>
              <div>
                <div className="font-semibold text-lg">2</div>
                <div className="text-gray-600">ans en tant qu'hôte</div>
              </div>
            </div>

            <div className="space-y-3 text-gray-700 mb-6">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Langues parlées : Anglais, Français et Khmer</span>
              </div>
              <div className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Je passe du temps avec mes voyageurs ou je les laisse tranquilles, selon ce qu'ils préfèrent</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="font-semibold text-gray-900 mb-2">{user?.name} est Superhôte</div>
              <p className="text-gray-600 text-sm">
                Les Superhôtes sont des hôtes expérimentés qui bénéficient de très bonnes évaluations et 
                qui s'engagent à offrir d'excellents séjours aux voyageurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
      `}</style>
    </div>
  );
};

export default ListingInfo;