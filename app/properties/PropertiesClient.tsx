'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeListing, SafeUser } from "@/app/types";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EditOptionsModal from "@/app/components/modals/EditOptionsModal";

interface PropertiesClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);
      
      // Confirmation avant suppression
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) {
        setDeletingId('');
        return;
      }

      axios
        .delete(`/api/listings/${id}`)
        .then(() => {
          toast.success('🎉 Logement supprimé avec succès', {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '16px 24px',
              fontWeight: '600',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            },
          });
          router.refresh();
        })
        .catch((error) => {
          toast.error('❌ ' + (error?.response?.data?.error || 'Erreur lors de la suppression'), {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '16px 24px',
              fontWeight: '600',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            },
          });
        })
        .finally(() => {
          setDeletingId('');
        });
    },
    [router]
  );

  const openEditOptions = (id: string) => {
    setSelectedListingId(id);
    setIsEditModalOpen(true);
  };

  // Filtrer les logements (exemple de logique)
  const filteredListings = listings.filter(listing => {
    switch (filter) {
      case 'active':
        return listing.isActive !== false; // Supposons qu'il y ait une propriété isActive
      case 'inactive':
        return listing.isActive === false;
      default:
        return true;
    }
  });

  const getFilterCount = (type: string) => {
    switch (type) {
      case 'active':
        return listings.filter(l => l.isActive !== false).length;
      case 'inactive':
        return listings.filter(l => l.isActive === false).length;
      default:
        return listings.length;
    }
  };

  const filterOptions = [
    { key: 'all', label: 'Tous', icon: '🏠', count: getFilterCount('all') },
    { key: 'active', label: 'Actifs', icon: '✅', count: getFilterCount('active') },
    { key: 'inactive', label: 'Inactifs', icon: '⏸️', count: getFilterCount('inactive') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderne style Airbnb */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <Container>
          <div className={`relative py-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg mb-6">
                <span className="text-3xl">🏠</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Vos logements
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Gérez vos annonces, modifiez vos disponibilités et optimisez vos revenus
              </p>
              
              {/* Stats élégantes */}
              <div className="flex justify-center gap-12 mt-12">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300 mx-auto">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
                  <div className="text-sm text-gray-500 font-medium">Logements</div>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300 mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{getFilterCount('active')}</div>
                  <div className="text-sm text-gray-500 font-medium">Actifs</div>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300 mx-auto">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {listings.reduce((total, listing) => total + (listing.price || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">FCFA/nuit total</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12">
          {/* Filtres modernes */}
          <div className={`mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              {/* Filtres à gauche */}
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100">
                <div className="flex flex-wrap gap-3">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key as any)}
                      className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        filter === option.key
                          ? 'bg-gray-900 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                        {option.icon}
                      </span>
                      <span className="text-base">{option.label}</span>
                      {option.count > 0 && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 ${
                          filter === option.key
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {option.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton Ajouter à droite */}
              <button
                onClick={() => router.push('/properties/new')}
                className="group flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">➕</span>
                <span>Ajouter un logement</span>
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          {filteredListings.length === 0 ? (
            <div className={`transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100 text-center">
                <div className="max-w-md mx-auto space-y-8">
                  {filter === 'all' ? (
                    <>
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-6xl">🏠</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          Créez votre première annonce !
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Commencez à gagner de l'argent en partageant votre espace avec des voyageurs du monde entier.
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push('/properties/new')}
                        className="group inline-flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">➕</span>
                        <span>Créer une annonce</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-4xl">📭</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Aucun logement {filter === 'active' ? 'actif' : 'inactif'}
                        </h3>
                        <p className="text-gray-600">
                          {filter === 'active' && "Activez vos logements pour commencer à recevoir des réservations."}
                          {filter === 'inactive' && "Tous vos logements sont actuellement actifs."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {/* Titre de section élégant */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-xl text-white">
                      {filter === 'all' ? '🏠' : filterOptions.find(o => o.key === filter)?.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {filteredListings.length} logement{filteredListings.length > 1 ? 's' : ''} 
                      {filter !== 'all' && ` ${filterOptions.find(o => o.key === filter)?.label.toLowerCase()}`}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Gérez vos annonces et optimisez vos revenus
                    </p>
                  </div>
                </div>
              </div>

              {/* Grille des logements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {filteredListings.map((listing, index) => (
                  <div 
                    key={listing.id} 
                    className="group animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="relative">
                        <ListingCard
                          data={listing}
                          actionId={listing.id}
                          onAction={() => {}} // Pas d'action directe sur la card
                          disabled={false}
                          currentUser={currentUser}
                        />
                        
                        {/* Badge statut en overlay */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                            listing.isActive !== false
                              ? 'bg-green-100/90 text-green-800 border border-green-200'
                              : 'bg-red-100/90 text-red-800 border border-red-200'
                          }`}>
                            {listing.isActive !== false ? '✅ Actif' : '⏸️ Inactif'}
                          </div>
                        </div>
                      </div>

                      {/* Actions en bas */}
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditOptions(listing.id)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                          >
                            <span>✏️</span>
                            <span>Modifier</span>
                          </button>
                          
                          <button
                            onClick={() => onCancel(listing.id)}
                            disabled={deletingId === listing.id}
                            className="flex-1 bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {deletingId === listing.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Suppression...</span>
                              </>
                            ) : (
                              <>
                                <span>🗑️</span>
                                <span>Supprimer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

     {/* Modal de modification - TOUJOURS MONTÉ */}
      <EditOptionsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedListingId(''); // Reset l'ID aussi
        }}
        listingId={selectedListingId}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PropertiesClient;