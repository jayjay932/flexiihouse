"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import ListingCard from "@/app/components/listings/ListingCard";
import { SafeReservation, SafeUser } from "@/app/types";

interface HostReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const HostReservationsClient: React.FC<HostReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState("");

  const onConfirm = useCallback((id: string) => {
    setUpdatingId(id);
    axios
      .patch(`/api/reservations/${id}`, { status: "confirmed" })
      .then(() => {
        toast.success("Réservation confirmée");
        router.refresh();
      })
      .catch(() => toast.error("Erreur lors de la confirmation"))
      .finally(() => setUpdatingId(""));
  }, [router]);

  const onCancel = useCallback((id: string) => {
    setUpdatingId(id);
    axios
      .delete(`/api/reservations/${id}`)
      .then(() => {
        toast.success("Réservation annulée");
        router.refresh();
      })
      .catch(() => toast.error("Erreur lors de l'annulation"))
      .finally(() => setUpdatingId(""));
  }, [router]);

  return (
    <Container>
      <Heading
        title="Réservations reçues"
        subtitle="Voici les réservations effectuées sur vos logements"
      />
      {reservations.length === 0 ? (
        <div className="text-neutral-500 text-center mt-10">Aucune réservation reçue pour l’instant.</div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {reservations.map((reservation) => (
            <ListingCard
              key={reservation.id}
              data={reservation.listing}
              reservation={reservation}
              actionId={reservation.id}
              onAction={
                reservation.status === "pending" ? onConfirm : onCancel
              }
              disabled={updatingId === reservation.id}
              actionLabel={
                reservation.status === "pending"
                  ? "Confirmer la réservation"
                  : "Annuler la réservation"
              }
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default HostReservationsClient;
