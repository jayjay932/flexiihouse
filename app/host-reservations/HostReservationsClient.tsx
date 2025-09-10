"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import HostReservationCard from "@/app/components/host/HostReservationCard";
import { SafeReservation, SafeUser, SafeTransaction } from "@/app/types";

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
  const [archivingId, setArchivingId] = useState("");

  const onConfirm = useCallback(
    (id: string) => {
      setUpdatingId(id);
      axios
        .patch(`/api/reservations/${id}`, { status: "confirmed" })
        .then(() => {
          toast.success("Réservation confirmée", {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#10B981',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
          router.refresh();
        })
        .catch((error) => {
          console.error("Erreur confirmation:", error);
          toast.error("Erreur lors de la confirmation", {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#EF4444',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
        })
        .then(() => setUpdatingId(""));
    },
    [router]
  );

  // Utiliser PATCH au lieu de DELETE pour l'annulation
  const onCancel = useCallback(
    (id: string) => {
      setUpdatingId(id);
      axios
        .patch(`/api/reservations/${id}/cancel`) // ✅ PATCH au lieu de DELETE
        .then(() => {
          toast.success("Réservation annulée avec succès", {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#F59E0B',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
          router.refresh();
        })
        .catch((error) => {
          console.error("Erreur annulation:", error);
          toast.error("Erreur lors de l'annulation", {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#EF4444',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
        })
        .then(() => setUpdatingId(""), () => setUpdatingId(""));
    },
    [router]
  );

  // Nouvelle fonction d'archivage
  const onArchive = useCallback(
    (id: string) => {
      // Confirmation avant archivage
      if (!confirm("Êtes-vous sûr de vouloir archiver cette réservation ? Elle ne sera plus visible dans cette liste.")) {
        return;
      }

      setArchivingId(id);
      axios
        .patch(`/api/reservations/${id}/archive`)
        .then(() => {
          toast.success("Réservation archivée avec succès", {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#6B7280',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
          router.refresh();
        })
        .catch((error) => {
          console.error("Erreur archivage:", error);
          const errorMessage = error?.response?.data?.error || "Erreur lors de l'archivage";
          toast.error(errorMessage, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#EF4444',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: '500',
            },
          });
        })
        .then(() => setArchivingId(""), () => setArchivingId(""));
    },
    [router]
  );

  // Fonction placeholder pour l'édition des transactions
  const onEditTransaction = useCallback((transaction: SafeTransaction) => {
    // Cette fonction peut être implémentée plus tard si nécessaire
    console.log("Édition de transaction:", transaction);
    toast("Fonctionnalité d'édition des transactions à venir", {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: 'white',
        borderRadius: '12px',
        padding: '16px',
        fontWeight: '500',
      },
    });
  }, []);

  // Statistiques rapides
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  // Séparer les réservations par statut
  const activeReservations = reservations.filter(r => r.status !== "cancelled");
  const cancelledReservations = reservations.filter(r => r.status === "cancelled");

  return (
    <Container>
      <div className="space-y-6">
        {/* Header avec statistiques */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Heading
            title="Réservations reçues"
            subtitle="Voici les réservations effectuées sur vos logements"
          />
          
          {/* Statistiques rapides */}
          {reservations.length > 0 && (
            <div className="flex gap-3">
              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <div className="text-blue-600 font-semibold text-sm">{stats.total}</div>
                <div className="text-blue-600 text-xs">Total</div>
              </div>
              <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 font-semibold text-sm">{stats.pending}</div>
                <div className="text-yellow-600 text-xs">En attente</div>
              </div>
              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="text-green-600 font-semibold text-sm">{stats.confirmed}</div>
                <div className="text-green-600 text-xs">Confirmées</div>
              </div>
              {stats.cancelled > 0 && (
                <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <div className="text-red-600 font-semibold text-sm">{stats.cancelled}</div>
                  <div className="text-red-600 text-xs">Annulées</div>
                </div>
              )}
            </div>
          )}
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center mt-10">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune réservation reçue</h3>
            <p className="text-gray-600">
              Vous n'avez pas encore reçu de réservation pour vos logements.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Réservations actives */}
            {activeReservations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🏠</span>
                  Réservations actives ({activeReservations.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {activeReservations.map((reservation) => (
                    <HostReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      currentUser={currentUser}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                      onArchive={onArchive}
                      updatingId={updatingId}
                      archivingId={archivingId}
                      onEditTransaction={onEditTransaction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Réservations annulées */}
            {cancelledReservations.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <span>❌</span>
                  Réservations annulées ({cancelledReservations.length})
                  <span className="text-sm font-normal text-red-600">- Cliquez sur "Archiver" pour les masquer</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {cancelledReservations.map((reservation) => (
                    <HostReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      currentUser={currentUser}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                      onArchive={onArchive}
                      updatingId={updatingId}
                      archivingId={archivingId}
                      onEditTransaction={onEditTransaction}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default HostReservationsClient;