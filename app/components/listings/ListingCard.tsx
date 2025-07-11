"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useCountries from "@/app/hooks/useCountries";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import HeartButton from "../HeartButton";
import Button from "../Button";

interface ListingCardProps {
  data: SafeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
}

const ListingCard: FC<ListingCardProps> = ({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
}) => {
  const router = useRouter();
  const { getByValue } = useCountries();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const location = getByValue(data.locationValue);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  const price = useMemo(() => {
    if (reservation) {
      return reservation.totalPrice;
    }
    return data.price;
  }, [reservation, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${format(start, "d MMM", { locale: fr })} - ${format(end, "d MMM yyyy", { locale: fr })}`;
  }, [reservation]);

  // Déterminer l'icône selon le type de logement
  const getPropertyIcon = () => {
    const type = data.listing_type?.toLowerCase() ||
      (typeof data.category === "object" && data.category !== null && "label" in data.category && typeof (data.category as any).label === "string"
        ? ((data.category as { label: string }).label)?.toLowerCase()
        : typeof data.category === "string"
        ? data.category.toLowerCase()
        : '');
    
    if (type.includes('appartement') || type.includes('apartment')) return '🏠';
    if (type.includes('villa') || type.includes('house')) return '🏡';
    if (type.includes('studio')) return '🏢';
    if (type.includes('chambre') || type.includes('room')) return '🛏️';
    if (type.includes('loft')) return '🏗️';
    if (type.includes('duplex')) return '🏘️';
    return '🏠'; // Par défaut
  };

  // Déterminer l'icône selon le type de location
  const getRentalIcon = () => {
    return data.rental_type === 'mensuel' ? '📅' : '🌙';
  };

  // Obtenir la note (simulée ici, vous pouvez l'adapter selon vos données)
  const getRating = () => {
    return (4.2 + Math.random() * 0.8).toFixed(1); // Simulation d'une note entre 4.2 et 5.0
  };

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="col-span-1 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col gap-3 w-full h-full transition-all duration-300 hover:scale-[1.02]">
        {/* Container image avec overlay moderne */}
        <div className="aspect-square w-full relative overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-4xl">{getPropertyIcon()}</div>
            </div>
          )}
          
          <Image
            fill
            alt="Listing"
            src={data.images?.[0]?.url || "/placeholder.jpg"}
            className={`object-cover h-full w-full group-hover:scale-110 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />

          {/* Overlay gradient subtil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Heart button avec animation */}
          <div className="absolute top-3 right-3 transform transition-transform duration-200 hover:scale-110">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>

          {/* Badge type de propriété */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
              <span>{getPropertyIcon()}</span>
              <span className="text-gray-800">{data.listing_type || "Logement"}</span>
            </div>
          </div>

          {/* Badge rating */}
          <div className="absolute bottom-3 left-3 transform transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <span className="text-yellow-500">★</span>
              <span className="text-gray-800">{getRating()}</span>
            </div>
          </div>

          {/* Indicateur images multiples */}
          {data.images && data.images.length > 1 && (
            <div className="absolute bottom-3 right-3 transform transition-all duration-300 opacity-0 group-hover:opacity-100">
              <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                <span>📸</span>
                <span>{data.images.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenu avec icônes modernes */}
        <div className="space-y-2 px-1">
          {/* Localisation avec icône */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📍</span>
            <div className="font-semibold text-gray-900 text-base capitalize truncate">
              {data.city || location?.label || "Localisation non spécifiée"}
            </div>
            {data.city && location?.label && data.city !== location.label && (
              <div className="text-sm text-gray-500">• {location.label}</div>
            )}
          </div>

          {/* Détails de la propriété */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👥</span>
            <span>{data.guestCount || 1} voyageur{(data.guestCount || 1) > 1 ? 's' : ''}</span>
            <span className="text-gray-300">•</span>
            <span>🛏️</span>
            <span>{data.roomCount || 1} chambre{(data.roomCount || 1) > 1 ? 's' : ''}</span>
          </div>

          {/* Date de réservation ou description */}
          <div className="flex items-center gap-2 text-sm">
            {reservation ? (
              <>
                <span className="text-blue-500">📅</span>
                <span className="text-gray-600 font-medium">{reservationDate}</span>
              </>
            ) : (
              <>
                <span className="text-green-500">✨</span>
                <span className="text-gray-600">
                  {typeof data.category === "object" && data.category !== null && "label" in data.category
                    ? (data.category as { label: string }).label
                    : typeof data.category === "string"
                    ? data.category
                    : "Catégorie non spécifiée"}
                </span>
              </>
            )}
          </div>

          {/* Prix avec icône et animation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getRentalIcon()}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {reservation
                    ? `${price?.toLocaleString()} FCFA`
                    : `${(data.rental_type === "mensuel" 
                        ? data.price_per_month 
                        : data.price
                      )?.toLocaleString()} FCFA`
                  }
                </span>
                {!reservation && (
                  <span className="text-sm text-gray-500 font-medium">
                    {data.rental_type === "mensuel" ? "/ mois" : "/ nuit"}
                  </span>
                )}
              </div>
            </div>

            {/* Indicateur de disponibilité */}
            {!reservation && (
              <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                isHovered ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>

          {/* Bouton d'action amélioré */}
          {onAction && actionLabel && (
            <div className="pt-3">
              <button
                disabled={disabled}
                onClick={handleCancel}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                <span className="text-lg">🗑️</span>
                <span>{actionLabel}</span>
              </button>
            </div>
          )}
        </div>

        {/* Indicateur de statut pour les réservations */}
        {reservation && (
          <div className="px-1">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              <div className="text-sm">
                <span className="text-blue-900 font-medium">Réservation confirmée</span>
                <div className="text-blue-700">
                  Total payé : {price?.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;