'use client';

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";
import { FC, useState } from "react";
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
 
  quater: string; // 👈 ajout
   city?: string; // 👈 ajout
   price: number;
price_per_month: number;
rental_type: string;

  toilets: number; // Ajout de la propriété "toilets"
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


  function setShowFullReview(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="col-span-4 flex flex-col gap-8">
      {category && (
        <>
          <ListingCategory
            icon={category.icon}
            label={category.label}
            description={category.description}
          />
          <hr />
        </>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-xl font-semibold flex items-center gap-2">
          <div>Hébergé par {user?.name}</div>
          <Avatar src={user?.image} />
        </div>
        <div className="flex items-center gap-4 font-light text-neutral-500">
          <div>{guestCount} voyageurs</div>
          <div>{roomCount} chambres</div>
          <div>{bathroomCount}douches</div>
          <div>{toilets} toilets </div>
        </div>
        
      </div>

      <div className="text-neutral-600 text-sm">
 <h1 className="text-2xl font-bold text-black">  Quartier :  {quater}</h1>

</div>


      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-black">Description</h2>
       <p className="text-neutral-500 text-base leading-relaxed">
  {shortDescription}
</p>

        {isLongDescription && (
          <button
            onClick={() => setShowFullDescription(true)}
            className="text-rose-500 underline text-sm mt-1 self-start hover:text-rose-600 transition"
          >
            Voir plus
          </button>
        )}
      </div>

      {showFullDescription && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[90%] md:w-[600px] max-h-[80vh] rounded-xl shadow-lg p-6 relative overflow-y-auto">
            <button
              onClick={() => setShowFullDescription(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black transition"
            >
              <CloseIcon size={20} />
            </button>
            <h2 className="text-lg font-semibold text-black mb-4">
              Description complète
            </h2>
            <p className="text-neutral-700 text-sm whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}

      <hr />

      {/* Équipements */}
      {amenities.filter((item) => equipment[item.id]).length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-black">Équipements disponibles</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenities
              .filter((item) => equipment[item.id])
              .map(({ id, label, icon }) => {
                const IconComponent = icon as React.FC<{ size?: number; className?: string }>;
                return (
                  <div key={id} className="flex items-center gap-3 text-neutral-700">
                    <IconComponent size={20} className="text-rose-500" />
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}


    <hr />

    {/* Carte */}
    <Map center={coordinate} />

    {/* ✅ Coup de cœur voyageurs — après la carte */}
    <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-md border border-neutral-200">
      <h2 className="text-xl font-semibold text-black">Coup de cœur voyageurs</h2>
      <p className="text-sm text-neutral-700">
        Ce logement fait partie des <span className="text-rose-500 font-semibold">Coups de cœur voyageurs</span>,
        à partir des évaluations, commentaires et de la fiabilité des annonces selon les voyageurs.
      </p>

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <span className="text-rose-500">★★★★★</span>
          <span>mai 2025</span>
        </div>
        <p className="text-sm text-neutral-600">
          Très bon séjour réalisé dans ce logement, hôte fort sympathique, logement très bien équipé.
          Le logement était très propre et bien rangé. Un seul point...
          <span
            onClick={() => setShowFullReview(true)}
            className="text-rose-500 underline ml-1 cursor-pointer hover:text-rose-600 transition"
          >
            Lire la suite
          </span>
        </p>
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center text-white font-semibold">
            G
          </div>
          <div className="text-sm text-neutral-700">
            <p className="font-semibold">Gregory</p>
            <p className="text-xs text-neutral-500">6 mois sur Airbnb</p>
          </div>
        </div>
      </div>

      <button className="mt-4 w-full border rounded-lg py-3 text-sm font-semibold text-black hover:bg-neutral-100 transition">
        Afficher les 84 commentaires
      </button>
      <button className="text-xs text-neutral-500 underline text-center mt-2 hover:text-rose-500">
        Fonctionnement des commentaires
      </button>
    </div>

    <hr />

    {/* Infos hôte */}


     {/* Infos hôte - style Airbnb */}
      <div className="flex flex-col gap-6 bg-white rounded-xl p-6 shadow-md border">
        <h2 className="text-xl font-semibold text-black">Faites connaissance avec votre hôte</h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={user?.image} />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-300">
              <span className="text-rose-500 text-lg">✔</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{user?.name}</span>
            <span className="text-sm text-neutral-500">Superhôte</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
          <div>
            <strong className="block text-black text-base">1622</strong>
            évaluations
          </div>
          <div>
            <strong className="block text-black text-base">4,94 ★</strong>
            en note globale
          </div>
          <div>
            <strong className="block text-black text-base">8</strong>
            ans en tant qu’hôte
          </div>
        </div>

        <div className="text-sm text-neutral-700">
          <p><strong>Langues parlées :</strong> Anglais, Espagnol, Français et Portugais</p>
          <p><strong>Je vis à :</strong> Lisbonne, Portugal</p>
        </div>

        <div className="text-sm text-neutral-700 border-t pt-4">
          <p className="font-semibold text-black mb-1">{user?.name} est Superhôte</p>
          <p>
            Les Superhôtes sont des hôtes expérimentés qui bénéficient de très bonnes évaluations et
            qui s'engagent à offrir d'excellents séjours aux voyageurs.
          </p>
        </div>
      </div>





   
  </div>
);

};

export default ListingInfo;