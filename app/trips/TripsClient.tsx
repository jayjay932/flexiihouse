'use client';

import React, { createElement } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import { Calendar, Clock, CheckCircle, AlertCircle, Search, Plane, MapPin } from 'lucide-react';
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
            background: 'linear-gradient(135deg, #F43F5E, #EC4899)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
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
            fontWeight: '500',
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
    { key: 'all', label: 'Tous', icon: Calendar, count: getFilterCount('all'), color: 'text-gray-600' },
    { key: 'upcoming', label: 'À venir', icon: Clock, count: getFilterCount('upcoming'), color: 'text-blue-600' },
    { key: 'past', label: 'Passés', icon: CheckCircle, count: getFilterCount('past'), color: 'text-green-600' },
    { key: 'pending', label: 'En attente', icon: AlertCircle, count: getFilterCount('pending'), color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50">
      {/* Header avec gradient rose */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white">
        <Container>
          <div className={`py-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Mes voyages
                </h1>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-xl text-rose-100 max-w-2xl mx-auto font-medium">
                Découvrez et gérez toutes vos aventures en un seul endroit
              </p>
              
              {/* Stats rapides */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold">{reservations.length}</div>
                  <div className="text-sm text-rose-200 font-medium">Réservations</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold">{getFilterCount('upcoming')}</div>
                  <div className="text-sm text-rose-200 font-medium">À venir</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold">{getFilterCount('past')}</div>
                  <div className="text-sm text-rose-200 font-medium">Complétés</div>
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
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      filter === option.key
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span>{option.label}</span>
                    {option.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filter === option.key
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100 text-rose-600'
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
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full mb-4">
                        <Search className="w-12 h-12 text-rose-500" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Votre aventure commence ici !
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Vous n'avez encore aucune réservation. Explorez nos destinations 
                        incroyables et réservez votre prochain voyage dès maintenant.
                      </p>
                      <button 
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold px-8 py-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <Search className="w-5 h-5" />
                        <span>Découvrir nos logements</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
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
                  <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg">
                    {filter === 'all' ? (
                      <Calendar className="w-5 h-5 text-white" />
                    ) : (
                      React.createElement(filterOptions.find(o => o.key === filter)?.icon || Calendar, {
                        className: "w-5 h-5 text-white"
                      })
                    )}
                  </div>
                  {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} 
                  {filter !== 'all' && ` ${filterOptions.find(o => o.key === filter)?.label.toLowerCase()}`}
                </h2>
                <p className="text-gray-600 mt-1 ml-11">
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