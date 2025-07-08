"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import HostReservationCard from "@/app/components/host/HostReservationCard";
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

  const onConfirm = useCallback(
    (id: string) => {
      setUpdatingId(id);
      axios
        .patch(`/api/reservations/${id}`, { status: "confirmed" })
        .then(() => {
          toast.success("Réservation confirmée");
          router.refresh();
        })
        .catch(() => toast.error("Erreur lors de la confirmation"))
        .finally(() => setUpdatingId(""));
    },
    [router]
  );

  const onCancel = useCallback(
    (id: string) => {
      setUpdatingId(id);
      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
          toast.success("Réservation annulée");
          router.refresh();
        })
        .catch(() => toast.error("Erreur lors de l'annulation"))
        .finally(() => setUpdatingId(""));
    },
    [router]
  );

  return (
    <Container>
      <Heading
        title="Réservations reçues"
        subtitle="Voici les réservations effectuées sur vos logements"
      />
      {reservations.length === 0 ? (
        <div className="text-neutral-500 text-center mt-10">
          Aucune réservation reçue pour l’instant.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <HostReservationCard
              key={reservation.id}
              reservation={reservation}
              currentUser={currentUser}
              onConfirm={onConfirm}
              onCancel={onCancel}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default HostReservationsClient;
