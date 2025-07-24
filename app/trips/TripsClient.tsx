'use client';

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SafeReservation, SafeUser } from "@/app/types";
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
  const [archivingId, setArchivingId] = useState('');

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    axios.patch(`/api/reservations/${id}/cancel`)
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
      .catch(() => {
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
      .finally(() => setDeletingId(''));
  }, [router]);

  const onArchive = useCallback((id: string) => {
    if (!confirm("Voulez-vous vraiment archiver cette réservation ?")) return;

    setArchivingId(id);

    axios.patch(`/api/reservations/${id}/archive`)
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
      .catch(() => {
        toast.error("Erreur lors de l'archivage", {
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
      .finally(() => setArchivingId(''));
  }, [router]);

  const activeReservations = reservations.filter(r => r.status !== 'cancelled');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Container>
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Mes voyages</h1>
            <p className="text-gray-600 text-sm">
              Voici les logements que vous avez réservés. Vous pouvez consulter, annuler ou archiver chaque séjour.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl shadow-sm border">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune réservation</h2>
              <p className="text-gray-600">
                Vous n'avez pas encore réservé de logement. Explorez nos offres pour planifier votre prochain voyage.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeReservations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🧳 Voyages à venir ({activeReservations.length})
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

              {cancelledReservations.length > 0 && (
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    ❌ Voyages annulés ({cancelledReservations.length})
                    <span className="text-sm font-normal text-red-600"> - Cliquez sur "Archiver" pour les masquer</span>
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 text-xl">ℹ️</div>
                      <div>
                        <p className="text-red-800 font-medium text-sm">Réservations annulées</p>
                        <p className="text-red-600 text-xs mt-1">
                          Ces voyages ont été annulés. Vous pouvez archiver ceux que vous ne souhaitez plus voir.
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

export default TripsClient;
