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
  const [archivingId, setArchivingId] = useState("");

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);
     
      // Utiliser PATCH au lieu de DELETE pour changer le statut
      axios
        .patch(`/api/reservations/${id}/cancel`)
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
          toast.error("Une erreur est survenue lors de l'annulation.", {
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
        .then(() => {
          setDeletingId("");
        })
        .catch(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  // Nouvelle fonction d'archivage
  const onArchive = useCallback(
    (id: string) => {
      // Confirmation avant archivage
      if (!confirm("Êtes-vous sûr de vouloir archiver cette réservation ? Elle ne sera plus visible dans votre liste.")) {
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
          const errorMessage = error?.response?.data?.error || "Une erreur est survenue lors de l'archivage.";
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
        .then(() => {
          setArchivingId("");
        });
    },
    [router]
  );

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
    <div className="min-h-screen bg-gray-50 py-10">
      <Container>
        <div className="space-y-8">
          {/* Header avec statistiques */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Réservations de mes séjours</h1>
              <p className="text-gray-600 text-sm">
                Voici les logements que vous avez réservés. Vous pouvez consulter, annuler ou voir les détails de chaque séjour.
              </p>
            </div>

            {/* Statistiques rapides */}
            {reservations.length > 0 && (
              <div className="flex justify-center gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-semibold text-lg">{stats.total}</div>
                  <div className="text-blue-600 text-xs">Total</div>
                </div>
                <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 font-semibold text-lg">{stats.pending}</div>
                  <div className="text-yellow-600 text-xs">En attente</div>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <div className="text-green-600 font-semibold text-lg">{stats.confirmed}</div>
                  <div className="text-green-600 text-xs">Confirmées</div>
                </div>
                {stats.cancelled > 0 && (
                  <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    <div className="text-red-600 font-semibold text-lg">{stats.cancelled}</div>
                    <div className="text-red-600 text-xs">Annulées</div>
                  </div>
                )}
              </div>
            )}
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
            <div className="space-y-8">
              {/* Réservations actives */}
              {activeReservations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🏠</span>
                    Mes réservations actives ({activeReservations.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeReservations.map((reservation) => (
                      <ClientReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        currentUser={currentUser}
                        onCancel={onCancel}
                        onArchive={onArchive}
                        deletingId={deletingId}
                        archivingId={archivingId}
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
                    Mes réservations annulées ({cancelledReservations.length})
                    <span className="text-sm font-normal text-red-600">- Cliquez sur "Archiver" pour les masquer</span>
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 text-xl">ℹ️</div>
                      <div>
                        <p className="text-red-800 font-medium text-sm">Réservations annulées</p>
                        <p className="text-red-600 text-xs mt-1">
                          Ces réservations ont été annulées. Vous pouvez consulter leurs détails ou les archiver pour les masquer de cette liste.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cancelledReservations.map((reservation) => (
                      <ClientReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        currentUser={currentUser}
                        onCancel={onCancel}
                        onArchive={onArchive}
                        deletingId={deletingId}
                        archivingId={archivingId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ReservationsClient;