"use client";

import { FC, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useCountries from "@/app/hooks/useCountries";

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { format } from "date-fns";
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

    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <Image
            fill
            alt="Listing"
            src={data.images?.[0]?.url || "/placeholder.jpg"}
            className="object-cover h-full w-full group-hover:scale-110 transition"
            priority
          />
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
        </div>

        <div className="font-semibold text-lg capitalize">
          {data.listing_type || "Type inconnu"}
          {data.city ? `, ${data.city}` : ""}
        </div>

        <div className="font-light text-neutral-500">
          {reservationDate || data.category}
        </div>

        <div className="flex items-center gap-1">
          <div className="font-semibold">
            XAF{" "}
            {reservation
              ? price
              : data.rental_type === "mensuel"
              ? data.price_per_month
              : data.price}
          </div>
          {!reservation && (
            <div className="font-light">
              {data.rental_type === "mensuel" ? "/ mois" : "/ nuit"}
            </div>
          )}
        </div>

        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
            mtAuto
          />
        )}
      </div>
    </div>
  );
};

export default ListingCard;
