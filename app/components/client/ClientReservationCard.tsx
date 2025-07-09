// components/client/ClientReservationCard.tsx
"use client";

import { SafeReservation, SafeUser } from "@/app/types";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Button from "@/app/components/Button";
import { useState } from "react";
import Modal from "../modals/Modal";

interface Props {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onCancel: (id: string) => void;
  deletingId: string;
}

const ClientReservationCard: React.FC<Props> = ({
  reservation,
  currentUser,
  onCancel,
  deletingId,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const { listing, startDate, endDate, code_reservation, totalPrice, status } = reservation;

  return (
    <div className="border rounded-xl overflow-hidden shadow hover:shadow-md transition">
      <Image
        src={listing.images?.[0]?.url || "/placeholder.jpg"}
        alt={listing.title}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold">{listing.title}</h2>
        <p className="text-sm text-neutral-600">
          {format(new Date(startDate), "dd MMM yyyy", { locale: fr })} →{" "}
          {format(new Date(endDate), "dd MMM yyyy", { locale: fr })}
        </p>
        <p className="text-sm text-neutral-700">Total : <strong>{totalPrice} FCFA</strong></p>
        <p className="text-xs text-neutral-500">Code réservation : {code_reservation}</p>
        <p className="text-xs text-neutral-500">Statut : {status}</p>

        <div className="flex gap-2 mt-3">
          <Button
            small
            label="Voir détails"
            outline
            onClick={() => setShowDetails(true)}
          />
          <Button
            small
            label="Annuler"
            onClick={() => onCancel(reservation.id)}
            disabled={deletingId === reservation.id}
          />
        </div>
      </div>

      {/* Modale de détails (facultatif) */}
      {showDetails && (
        <Modal title="Détails de la réservation" isOpen onClose={() => setShowDetails(false)}>
          <div className="text-sm space-y-1 text-neutral-700">
            <p><strong>Logement :</strong> {listing.title}</p>
            <p><strong>Ville :</strong> {listing.city}</p>
            <p><strong>Adresse :</strong> {listing.locationValue}</p>
            <p><strong>Code réservation :</strong> {code_reservation}</p>
            <p><strong>Dates :</strong> {format(new Date(startDate), "dd MMM yyyy")} → {format(new Date(endDate), "dd MMM yyyy")}</p>
            <p><strong>Montant :</strong> {totalPrice} FCFA</p>
            <p><strong>Statut :</strong> {status}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientReservationCard;
