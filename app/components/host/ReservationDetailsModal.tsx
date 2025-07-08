"use client";

import Modal from "../modals/Modal";
import { SafeReservation, SafeUser } from "@/app/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onClose: () => void;
}

const ReservationDetailsModal: React.FC<Props> = ({
  reservation,
  currentUser,
  onClose,
}) => {
  const { listing, startDate, endDate, message, check_in_hours, date_visite, heure_visite } = reservation;

  return (
    <Modal isOpen onClose={onClose} title="Détails de la réservation">
      <div className="space-y-2 text-sm text-neutral-800">
        <p><strong>Logement :</strong> {listing?.title}</p>
        <p><strong>Adresse :</strong> {listing?.locationValue}</p>
        {reservation.code_reservation && (
  <p>
    <strong>Code réservation :</strong> {reservation.code_reservation}
  </p>
)}

        <p><strong>Dates :</strong> {format(new Date(startDate!), "dd MMM yyyy", { locale: fr })} → {format(new Date(endDate!), "dd MMM yyyy", { locale: fr })}</p>
        {message && <p><strong>Message du client :</strong> {message}</p>}
        {check_in_hours && <p><strong>Heure d’entrée :</strong> {format(new Date(check_in_hours), "HH:mm")}</p>}
        {date_visite && <p><strong>Date de visite :</strong> {format(new Date(date_visite), "dd MMM yyyy", { locale: fr })}</p>}
        {heure_visite && <p><strong>Heure de visite :</strong> {format(new Date(heure_visite), "HH:mm")}</p>}
      </div>
    </Modal>
  );
};

export default ReservationDetailsModal;
