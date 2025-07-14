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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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

  // Obtenir la note (simulée ici, vous pouvez l'adapter selon vos données)
  const getRating = () => {
    return (4.2 + Math.random() * 0.8).toFixed(1);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? (data.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === (data.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        {/* Container image style Airbnb */}
        <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-gray-100">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          <Image
            fill
            alt="Listing"
            src={data.images?.[currentImageIndex]?.url || data.images?.[0]?.url || "/placeholder.jpg"}
            className={`object-cover h-full w-full transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />

          {/* Heart button style Airbnb */}
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>

          {/* Navigation des images */}
          {data.images && data.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-gray-700 hover:scale-105"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" className="fill-current">
                  <path d="M8 10L4 6l4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-gray-700 hover:scale-105"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" className="fill-current">
                  <path d="M4 10l4-4-4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {data.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge "Nouveau" */}
          <div className="absolute top-3 left-3">
            <div className="bg-white px-2 py-1 rounded-md text-xs font-semibold text-gray-900 shadow-sm">
              Nouveau
            </div>
          </div>
        </div>

        {/* Contenu style Airbnb */}
        <div className="flex flex-col pt-2 px-1 space-y-1">
          {/* Ligne 1: Localisation et rating */}
          <div className="flex items-center justify-between">
            <div className="text-gray-900 font-medium text-[15px] leading-[20px] truncate pr-2">
              {data.listing_type || "Appartement"} · {data.city || location?.label || "Pointe-Noire"}
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" className="fill-current text-gray-900">
                <path d="M6 0L7.854 3.708L12 4.292L9 7.416L9.708 12L6 9.708L2.292 12L3 7.416L0 4.292L4.146 3.708L6 0Z"/>
              </svg>
              <span className="text-gray-900 text-[14px] leading-[18px] font-medium">
                {getRating()}
              </span>
            </div>
          </div>

          {/* Ligne 2: Description courte */}
          <div className="text-gray-600 text-[14px] leading-[18px] truncate">
            {typeof data.category === "object" && data.category !== null && "label" in data.category
              ? `${(data.category as { label: string }).label}: Bel appart neuf et...`
              : typeof data.category === "string"
              ? `${data.category}: Bel appart neuf et...`
              : "Résidence NOYA: Bel appart neuf et..."}
          </div>

          {/* Ligne 3: Détails */}
          <div className="text-gray-600 text-[14px] leading-[18px]">
            {data.guestCount || 3} lits
          </div>

          {/* Ligne 4: Type d'hôte */}
          <div className="text-gray-600 text-[14px] leading-[18px]">
            Hôte particulier
          </div>

          {/* Ligne 5: Prix */}
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-gray-900 text-[15px] leading-[20px] font-semibold">
              {(data.rental_type === "mensuel" 
                ? data.price_per_month 
                : data.price
              )?.toLocaleString()} FCFA
            </span>
            <span className="text-gray-600 text-[14px] leading-[18px]">
              pour {data.rental_type === "mensuel" ? "1 mois" : "1 nuit"}
            </span>
          </div>

          {/* Date de réservation si applicable */}
          {reservation && (
            <div className="text-gray-600 text-[14px] leading-[18px] pt-1">
              {reservationDate}
            </div>
          )}

          {/* Bouton d'action si applicable */}
          {onAction && actionLabel && (
            <div className="pt-3">
              <button
                disabled={disabled}
                onClick={handleCancel}
                className={`w-full py-2 px-4 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;