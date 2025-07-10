'use client';

import { useRouter } from "next/navigation";
import { Range } from "react-date-range";
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

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">
          XAF {price.toLocaleString()} 💵
        </div>
        <div className="font-light text-neutral-600">
          {rental_type === "mensuel" ? "/ Mois" : "/ Nuit"}
        </div>
      </div>

      <hr />

      {/* Affiche le calendrier uniquement si ce n'est pas une location mensuelle */}
      {rental_type !== "mensuel" && (
        <>
          <Calendar
            value={dateRange}
            disabledDates={disabledDates}
            onChange={(value) => onChangeDate(value.selection)}
          />
          <hr />
        </>
      )}

     <div className="p-4">
        <Button
          disabled={disabled}
          label="Réserver"
          onClick={() =>
            router.push(
              rental_type === "mensuel"
                ? `/checkout/${listingId}/visite` // Visite
                : `/checkout/${listingId}?startDate=${dateRange.startDate?.toISOString()}&endDate=${dateRange.endDate?.toISOString()}`
            )
          }
        />
      </div>

      {/* Afficher le total seulement pour la courte durée */}
      {rental_type !== "mensuel" && (
        <>
          <hr />
          <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
            <div>Total</div>
            <div>XAF {totalPrice.toLocaleString()} 💵</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListingReservation;