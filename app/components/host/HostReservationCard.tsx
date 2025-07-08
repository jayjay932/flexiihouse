// components/host/HostReservationCard.tsx
"use client";

import { SafeReservation, SafeUser } from "@/app/types";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import Button from "../Button";
import ReservationDetailsModal from "./ReservationDetailsModal";

interface HostReservationCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  updatingId: string;
}

const HostReservationCard: React.FC<HostReservationCardProps> = ({
  reservation,
  currentUser,
  onConfirm,
  onCancel,
  updatingId,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { listing, user, startDate, endDate, totalPrice, status } = reservation;

  const formattedStart = startDate ? format(new Date(startDate), "dd MMM yyyy", { locale: fr }) : "";
  const formattedEnd = endDate ? format(new Date(endDate), "dd MMM yyyy", { locale: fr }) : "";

  return (
    <div className="border rounded-xl overflow-hidden shadow hover:shadow-md transition relative">
      <div className="flex flex-col">
        <Image
          src={listing?.images?.[0]?.url || "/placeholder.jpg"}
          alt={listing?.title}
          height={200}
          width={400}
          className="object-cover w-full h-48"
        />
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">{listing.title}</h2>
          <p className="text-sm text-neutral-600">{formattedStart} → {formattedEnd}</p>
          <div className="flex items-center gap-2 mt-2">
            {user?.image && (
              <Image src={user.image} alt="Voyageur" width={32} height={32} className="rounded-full" />
            )}
            <span className="text-sm">{user?.name || "Client anonyme"}</span>
          </div>
          <div className="text-sm text-neutral-700">Montant payé : <strong>{totalPrice} FCFA</strong></div>
          <div className="text-sm text-neutral-700">Statut : <strong>{status}</strong></div>
          <div className="text-xs text-neutral-500">
  Code réservation : {reservation.code_reservation}
</div>


          <div className="flex gap-2 mt-4">
            {status === "pending" ? (
              <Button
                small
                label="Confirmer"
                onClick={() => onConfirm(reservation.id)}
                disabled={updatingId === reservation.id}
              />
            ) : (
              <Button
                small
                label="Annuler"
                onClick={() => onCancel(reservation.id)}
                disabled={updatingId === reservation.id}
              />
            )}
            <Button small outline label="Voir détails" onClick={() => setShowDetails(true)} />
          </div>
        </div>
      </div>

      {showDetails && (
        <ReservationDetailsModal
          reservation={reservation}
          currentUser={currentUser}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default HostReservationCard;
