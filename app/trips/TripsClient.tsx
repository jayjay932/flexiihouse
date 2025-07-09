'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeReservation, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import ClientReservationCard from "@/app/components/client/ClientReservationCard";

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    axios.delete(`/api/reservations/${id}`)
      .then(() => {
        toast.success('Réservation annulée');
        router.refresh();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Erreur");
      })
      .finally(() => {
        setDeletingId('');
      });
  }, [router]);

  return (
    <Container>
      <Heading
        title="Mes voyages"
        subtitle="Retrouvez ici vos réservations passées et à venir"
      />
      {reservations.length === 0 ? (
        <div className="text-neutral-500 text-center mt-10">
          Vous n'avez encore aucune réservation.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <ClientReservationCard
              key={reservation.id}
              reservation={reservation}
              currentUser={currentUser}
              onCancel={onCancel}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default TripsClient;
