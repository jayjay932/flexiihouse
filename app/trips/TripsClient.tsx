'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'pending'>('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);
    
    axios.delete(`/api/reservations/${id}`)
      .then(() => {
        toast.success('Réservation annulée avec succès', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
          },
        });
        router.refresh();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Une erreur est survenue", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
          },
        });
      })
      .finally(() => {
        setDeletingId('');
      });
  }, [router]);

  // Filtrer les réservations
  const filteredReservations = reservations.filter(reservation => {
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    
    switch (filter) {
      case 'upcoming':
        return startDate > now;
      case 'past':
        return endDate < now;
      case 'pending':
        return reservation.status === 'pending';
      default:
        return true;
    }
  });

  const getFilterCount = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'upcoming':
        return reservations.filter(r => new Date(r.startDate) > now).length;
      case 'past':
        return reservations.filter(r => new Date(r.endDate) < now).length;
      case 'pending':
        return reservations.filter(r => r.status === 'pending').length;
      default:
        return reservations.length;
    }
  };

  const filterOptions = [
    { key: 'all', label: 'Tous', icon: '📋', count: getFilterCount('all') },
    { key: 'upcoming', label: 'À venir', icon: '🎯', count: getFilterCount('upcoming') },
    { key: 'past', label: 'Passés', icon: '📚', count: getFilterCount('past') },
    { key: 'pending', label: 'En attente', icon: '⏳', count: getFilterCount('pending') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <Container>
          <div className={`py-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-5xl">✈️</span>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Mes voyages
                </h1>
                <span className="text-5xl">🏖️</span>
              </div>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Découvrez et gérez toutes vos aventures en un seul endroit
              </p>
              
              {/* Stats rapides */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{reservations.length}</div>
                  <div className="text-sm text-blue-200">Réservations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{getFilterCount('upcoming')}</div>
                  <div className="text-sm text-blue-200">À venir</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{getFilterCount('past')}</div>
                  <div className="text-sm text-blue-200">Complétés</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Filtres */}
          <div className={`mb-8 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setFilter(option.key as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      filter === option.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                    {option.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filter === option.key
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          {filteredReservations.length === 0 ? (
            <div className={`transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="space-y-6">
                  {filter === 'all' ? (
                    <>
                      <div className="text-8xl mb-4">🧳</div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Votre aventure commence ici !
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Vous n'avez encore aucune réservation. Explorez nos destinations 
                        incroyables et réservez votre prochain voyage dès maintenant.
                      </p>
                      <button 
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <span>🔍</span>
                        <span>Découvrir nos logements</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Aucun voyage {filter === 'upcoming' ? 'à venir' : filter === 'past' ? 'passé' : 'en attente'}
                      </h3>
                      <p className="text-gray-600">
                        {filter === 'upcoming' && "Planifiez votre prochaine aventure !"}
                        {filter === 'past' && "Vos futurs souvenirs vous attendent."}
                        {filter === 'pending' && "Toutes vos réservations sont confirmées."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {/* Titre de section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <span className="text-2xl">
                    {filter === 'all' ? '📋' : filterOptions.find(o => o.key === filter)?.icon}
                  </span>
                  {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} 
                  {filter !== 'all' && ` ${filterOptions.find(o => o.key === filter)?.label.toLowerCase()}`}
                </h2>
                <p className="text-gray-600 mt-1">
                  Gérez vos réservations et préparez vos voyages
                </p>
              </div>

              {/* Grille des réservations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredReservations.map((reservation, index) => (
                  <div
                    key={reservation.id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ClientReservationCard
                      reservation={reservation}
                      currentUser={currentUser}
                      onCancel={onCancel}
                      deletingId={deletingId}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TripsClient;