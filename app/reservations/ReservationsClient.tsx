"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { SafeReservation, SafeUser } from "../types";
import Container from "../components/Container";
import ClientReservationCard from "../components/client/ClientReservationCard";

interface ReservationClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const ReservationsClient: React.FC<ReservationClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);
      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
          toast.success("Réservation annulée avec succès");
          router.refresh();
        })
        .catch(() => {
          toast.error("Une erreur est survenue.");
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Container>
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Réservations de mes séjours</h1>
          <p className="text-gray-600 text-sm">
            Voici les logements que vous avez réservés. Vous pouvez consulter, annuler ou voir les détails de chaque séjour.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune réservation trouvée</h2>
            <p className="text-gray-600">
              Vous n'avez pas encore réservé de logement. Explorez nos offres et réservez votre prochain séjour.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default ReservationsClient;
