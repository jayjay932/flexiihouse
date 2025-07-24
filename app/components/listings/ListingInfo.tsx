'use client';

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";
import { FC, useState, useEffect } from "react";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import dynamic from "next/dynamic";
import { IoMdClose } from "react-icons/io";
import { Badge, GraduationCap, Briefcase } from 'lucide-react';
import MessageButton from "@/app/components/messaging/MessageButton"; // 🆕 Import du composant
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
  listingId: string; // 🆕 Ajout de l'ID du listing
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
  listingId, // 🆕 Récupération de l'ID
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
      {/* ... Tout votre code existant jusqu'à la section "Faites connaissance avec votre hôte" ... */}

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
               🏆
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

      <div className="w-full max-w-2xl mx-auto">
        {/* Faites connaissance avec votre hôte - Style Airbnb exact */}
        <div className="animate-fade-in-up delay-600">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-900">Faites connaissance avec votre hôte</h2>
           
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              {/* Section principale avec photo et infos */}
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                {/* Photo et nom */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={user?.image || "/api/placeholder/64/64"} 
                        alt={user?.name || "Hôte"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-300">
                      <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current text-rose-500">
                        <path d="M8 0L10.472 5.528L16 8l-5.528 2.472L8 16l-2.472-5.528L0 8l5.528-2.472L8 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-semibold text-gray-900">{user?.name || "Eulalie"}</span>
                    <span className="text-gray-600 text-base">Hôte</span>
                  </div>
                </div>

                {/* Stats - Cachées sur mobile, visibles sur desktop */}
                <div className="hidden md:flex md:flex-row gap-8 md:ml-auto">
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-semibold text-gray-900">1</div>
                    <div className="text-gray-600 text-sm">évaluations</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-semibold text-gray-900 flex items-center justify-center md:justify-start gap-1">
                      5,0
                      <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current text-gray-900">
                        <path d="M8 0L10.472 5.528L16 8l-5.528 2.472L8 16l-2.472-5.528L0 8l5.528-2.472L8 0z"/>
                      </svg>
                    </div>
                    <div className="text-gray-600 text-sm">en note globale</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-semibold text-gray-900">1</div>
                    <div className="text-gray-600 text-sm">mois d'expérience<br/>en tant qu'hôte</div>
                  </div>
                </div>
              </div>

              {/* Stats version mobile - Grid responsive */}
              <div className="grid grid-cols-3 gap-4 mb-6 md:hidden">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">1</div>
                  <div className="text-gray-600 text-xs">évaluations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-1">
                    5,0
                    <svg width="14" height="14" viewBox="0 0 16 16" className="fill-current text-gray-900">
                      <path d="M8 0L10.472 5.528L16 8l-5.528 2.472L8 16l-2.472-5.528L0 8l5.528-2.472L8 0z"/>
                    </svg>
                  </div>
                  <div className="text-gray-600 text-xs">note globale</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">1</div>
                  <div className="text-gray-600 text-xs">mois d'expérience</div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 text-sm md:text-base">L'endroit où j'ai étudié : Lycée technique 1er Mai</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 text-sm md:text-base">Ma profession : Santé</span>
                </div>
              </div>

              {/* Citation */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Le bonheur est comme un parfum on le porte sur soi pour le faire respirer aux autres, bienvenu chez nous.
                </p>
              </div>

              {/* 🆕 BOUTON MESSAGE DYNAMIQUE */}
              <div className="mb-6">
                <MessageButton 
                  otherUserId={user.id}
                  otherUserName={user.name || "Hôte"}
                  listingId={listingId}
                />
              </div>

              {/* Informations sur l'hôte */}
              <div className="border-t border-gray-200 pt-6">
                <div className="font-semibold text-gray-900 mb-4">Informations sur l'hôte</div>
                <div className="space-y-2">
                  <div className="text-gray-700 text-sm md:text-base">
                    <span className="font-medium">Taux de réponse : </span>
                    <span>100 %</span>
                  </div>
                  <div className="text-gray-700 text-sm md:text-base">
                    <span className="font-medium">Répond sous </span>
                    <span>quelques heures</span>
                  </div>
                </div>
              </div>

              {/* Protection Flexii (comme Airbnb) */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-rose-50 p-2 rounded-full flex-shrink-0">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-rose-600"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                      Pour protéger vos paiements, ne transférez jamais d'argent et ne communiquez jamais en dehors du site web ou de l'application Flexii.
                    </div>
                    <button className="text-gray-900 font-medium underline hover:no-underline text-sm">
                      En savoir plus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

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