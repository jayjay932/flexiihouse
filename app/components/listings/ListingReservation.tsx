'use client';

import { useRouter } from "next/navigation";
import { Range } from "react-date-range";
import { Calendar as CalendarIcon, CreditCard, MapPin, Clock } from 'lucide-react';
import Button from "../Button";
import Calendar from "../inputs/Calendar";

interface ListingReservationProps {
  price: number;
  rental_type: string;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  listingId: string;
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  rental_type,
  listingId,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates
}) => {
  const router = useRouter();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleReservation = () => {
    if (rental_type === "mensuel") {
      router.push(`/checkout/${listingId}/visite`);
    } else {
      router.push(
        `/checkout/${listingId}?startDate=${dateRange.startDate?.toISOString()}&endDate=${dateRange.endDate?.toISOString()}`
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header avec prix */}
      <div className="p-6 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-900">
            {formatPrice(price)} FCFA
          </span>
          <span className="text-gray-600 font-medium">
            {rental_type === "mensuel" ? "/ mois" : "/ nuit"}
          </span>
        </div>
        
        {/* Indicateur de type de location */}
        <div className="flex items-center gap-2 mt-2">
          {rental_type === "mensuel" ? (
            <>
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 font-medium">Location mensuelle</span>
            </>
          ) : (
            <>
              <CalendarIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 font-medium">Location courte durée</span>
            </>
          )}
        </div>
      </div>

      {/* Séparateur */}
      <div className="h-px bg-gray-200 mx-6"></div>

      {/* Calendrier pour locations courte durée */}
      {rental_type !== "mensuel" && (
        <div className="p-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-gray-700" />
            <span className="text-lg font-medium text-gray-900">Sélectionnez vos dates</span>
          </div>
          <Calendar
            value={dateRange}
            disabledDates={disabledDates}
            onChange={(value) => onChangeDate(value.selection)}
          />
        </div>
      )}

      {/* Séparateur avant bouton */}
      <div className="h-px bg-gray-200 mx-6"></div>

      {/* Bouton de réservation */}
      <div className="p-6 pt-4">
        <button
          disabled={disabled}
          onClick={handleReservation}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white text-lg
            transition-all duration-200 transform
            ${disabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : `bg-gradient-to-r from-rose-500 to-pink-600 
                 hover:from-rose-600 hover:to-pink-700
                 shadow-md hover:shadow-lg
                 hover:scale-[1.02] active:scale-[0.98]`
            }
            flex items-center justify-center gap-2
          `}
        >
          <CreditCard className="w-5 h-5" />
          {rental_type === "mensuel" ? "Programmer une visite" : "Réserver maintenant"}
        </button>
        
        {/* Message d'information */}
        <p className="text-center text-sm text-gray-500 mt-3">
          {rental_type === "mensuel" 
            ? "Aucun frais jusqu'à la confirmation" 
            : "Vous ne serez pas débité pour le moment"
          }
        </p>
      </div>

      {/* Total pour locations courte durée */}
      {rental_type !== "mensuel" && (
        <>
          <div className="h-px bg-gray-200 mx-6"></div>
          <div className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-900">Total</span>
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(totalPrice)} FCFA
              </div>
            </div>
            
            {/* Détails du calcul */}
            {dateRange.startDate && dateRange.endDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {formatPrice(price)} FCFA × {Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} nuits
                  </span>
                  <span>{formatPrice(totalPrice)} FCFA</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListingReservation;