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
        toast.success("Réservation annulée avec succès");
        router.refresh();
      })
      .catch(() => {
        toast.error("Erreur lors de l'annulation");
      })
      .finally(() => setDeletingId(''));
  }, [router]);

  const onArchive = useCallback((id: string) => {
    if (!confirm("Voulez-vous vraiment archiver cette réservation ?")) return;

    setArchivingId(id);

    axios.patch(`/api/reservations/${id}/archive`)
      .then(() => {
        toast.success("Réservation archivée avec succès");
        router.refresh();
      })
      .catch(() => {
        toast.error("Erreur lors de l'archivage");
      })
      .finally(() => setArchivingId(''));
  }, [router]);

  const activeReservations = reservations.filter(r => r.status !== 'cancelled');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Header style iPhone */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="p-1">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-black">Mes voyages</h1>
            <p className="text-sm text-gray-500 font-medium">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button className="p-1">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        {reservations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg border border-white/20">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Aucune réservation</h2>
            <p className="text-gray-600 text-sm font-medium">
              Vous n'avez pas encore réservé de logement.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Voyages actifs */}
            {activeReservations.length > 0 && (
              <div className="space-y-4">
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
            )}

            {/* Voyages annulés */}
            {cancelledReservations.length > 0 && (
              <div className="border-t border-white/30 pt-6">
                <h3 className="text-base font-bold text-gray-800 mb-4 px-2">
                  Voyages annulés ({cancelledReservations.length})
                </h3>
                <div className="space-y-4">
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

      {/* Bottom navigation style iPhone */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/30 px-4 py-2">
        <div className="flex justify-around items-center">
          <button className="p-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <button className="p-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="p-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button className="p-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripsClient;