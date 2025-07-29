"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { SafeReservation, SafeUser } from "@/app/types";

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
  currentUser,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const { listing, startDate, endDate, code_reservation, totalPrice, status, rental_type, date_visite, heure_visite, check_in_hours } = reservation;

  // Formatage sécurisé des dates
  const safeFormatDate = (dateString: string | null | undefined, formatStr: string = "dd MMM yyyy") => {
    try {
      if (!dateString) return "Non définie";
      const date = new Date(dateString);
      if (!isValid(date)) return "Date invalide";
      return format(date, formatStr, { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  // Formatage sécurisé des heures
  const safeFormatTime = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return "Non définie";
      const date = new Date(dateString);
      if (!isValid(date)) return "Heure invalide";
      return format(date, "HH:mm", { locale: fr });
    } catch {
      return "Heure invalide";
    }
  };

  const formattedStart = safeFormatDate(startDate, "dd MMM yyyy");
  const formattedEnd = safeFormatDate(endDate, "dd MMM yyyy");
  const formattedStartShort = safeFormatDate(startDate, "dd MMM");
  const formattedEndShort = safeFormatDate(endDate, "dd MMM");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "En attente",
        };
      case "confirmed":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: "Confirmée",
        };
      case "cancelled":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          label: "Annulée",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Vérifier si les infos de l'hôte doivent être visibles
  const hasSuccessfulPaidTransaction = reservation.transactions?.some(
    (transaction) => transaction.statut === "réussi" && transaction.etat === "payer"
  ) || false;

  const canViewHostInfo = currentUser?.role === "admin" || 
    (reservation.status === "confirmed" && hasSuccessfulPaidTransaction);

  const hostInfo = listing?.user;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:mx-4 bg-white sm:rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header fixe */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full"></div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Détails de la réservation</h2>
                <p className="text-sm text-gray-500">#{code_reservation}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Hero Image avec overlay */}
          <div className="relative h-48 sm:h-64">
            <Image
              src={listing?.images?.[0]?.url || "/placeholder.jpg"}
              alt={listing?.title || "Logement"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md ${statusConfig.color} bg-white/90`}>
                {statusConfig.icon}
                <span className="text-sm font-medium">{statusConfig.label}</span>
              </div>
            </div>

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">{listing?.title}</h3>
              <div className="flex items-center gap-2 text-white/90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{listing?.city}, {listing?.locationValue}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Dates et Prix - Section principale avec logique conditionnelle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Dates - Logique conditionnelle selon rental_type */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {rental_type === 'courte' ? 'Dates de séjour' : 'Dates de visite'}
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Pour les locations courtes : dates d'arrivée et départ */}
                  {rental_type === 'courte' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Arrivée</span>
                        <span className="font-medium text-gray-900">{formattedStart}</span>
                      </div>
                      <div className="w-full border-t border-gray-200"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Départ</span>
                        <span className="font-medium text-gray-900">{formattedEnd}</span>
                      </div>
                      
                      {check_in_hours && (
                        <>
                          <div className="w-full border-t border-gray-200"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Heure d'arrivée</span>
                            <span className="font-medium text-gray-900">{safeFormatTime(check_in_hours)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-sm font-medium">
                          {formattedStartShort} → {formattedEndShort}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pour les locations mensuelles et achat : dates de visite */}
                  {(rental_type === 'mensuel' || rental_type === 'achat') && (
                    <>
                      {date_visite ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Date de visite</span>
                          <span className="font-medium text-gray-900">{safeFormatDate(date_visite)}</span>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">Date de visite à définir</span>
                        </div>
                      )}
                      
                      {heure_visite && date_visite && (
                        <>
                          <div className="w-full border-t border-gray-200"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Heure de visite</span>
                            <span className="font-medium text-gray-900">{safeFormatTime(heure_visite)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          date_visite 
                            ? "bg-green-50 text-green-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {date_visite 
                            ? `Visite prévue ${safeFormatDate(date_visite, 'dd MMM')}`
                            : `${rental_type === 'mensuel' ? 'Location mensuelle' : 'Achat'} - Visite à planifier`
                          }
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Prix */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Tarification
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {totalPrice?.toLocaleString()} 
                      <span className="text-lg font-normal text-gray-600 ml-1">FCFA</span>
                    </div>
                    <p className="text-sm text-gray-500">Total TTC</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {rental_type === 'courte' ? 'Séjour complet' : rental_type === 'mensuel' ? 'Prix mensuel' : 'Prix d\'achat'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails du logement */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Caractéristiques du logement
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{listing?.guestCount || 0}</div>
                  <div className="text-xs text-gray-600">Voyageurs</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{listing?.roomCount || 0}</div>
                  <div className="text-xs text-gray-600">Chambres</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M21 10l-7-7L3 10" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{listing?.bathroomCount || 0}</div>
                  <div className="text-xs text-gray-600">Salles de bain</div>
                </div>
              </div>
            </div>

            {/* Informations hôte */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Votre hôte
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {hostInfo?.image ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <Image 
                          src={hostInfo.image} 
                          alt={hostInfo.name || "Hôte"} 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xl">
                        {hostInfo?.name?.[0]?.toUpperCase() || "H"}
                      </div>
                    )}
                    
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${
                      canViewHostInfo ? "bg-green-400" : "bg-gray-400"
                    }`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-lg">
                        {hostInfo?.name || "Nom de l'hôte"}
                      </h5>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        canViewHostInfo 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {canViewHostInfo ? "Disponible" : "Protégé"}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">
                          {canViewHostInfo 
                            ? (hostInfo?.email || "Non renseigné")
                            : "•••••••@••••••.com"
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700">
                          {canViewHostInfo 
                            ? (hostInfo?.numberPhone || "Non renseigné")
                            : "+225 •• •• •• ••"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!canViewHostInfo && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Coordonnées protégées</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Les informations de contact seront disponibles après validation du paiement
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions */}
            {reservation.transactions && reservation.transactions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Historique des paiements
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasSuccessfulPaidTransaction
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {hasSuccessfulPaidTransaction ? "✓ Validé" : "En attente"}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {reservation.transactions.map((transaction, index) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Transaction #{index + 1}
                            </p>
                            {transaction.nom_mobile_money && (
                              <p className="text-sm text-gray-600">
                                via {transaction.nom_mobile_money}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.statut === "réussi" 
                              ? "bg-green-100 text-green-700" 
                              : transaction.statut === "en_attente"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.statut}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.etat === "payer" 
                              ? "bg-green-100 text-green-700" 
                              : transaction.etat === "partiel"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.etat}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Montant:</span>
                          <span className="font-medium text-gray-900">
                            {transaction.montant.toLocaleString()} {transaction.devise}
                          </span>
                        </div>
                        
                        {transaction.reference_transaction && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Référence:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {transaction.reference_transaction}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Paiement
                </h4>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">Paiement en attente</h5>
                  <p className="text-sm text-gray-600">
                    Aucune transaction n'a encore été enregistrée pour cette réservation.
                    Les coordonnées de l'hôte seront disponibles après validation du paiement.
                  </p>
                </div>
              </div>
            )}

            {/* Informations importantes */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations importantes
              </h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Code de réservation</p>
                      <p className="text-xs text-gray-600">
                        Conservez précieusement votre code #{code_reservation} pour toute correspondance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Statut en temps réel</p>
                      <p className="text-xs text-gray-600">
                        Le statut de votre réservation et de votre paiement est mis à jour automatiquement
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Support client</p>
                      <p className="text-xs text-gray-600">
                        Contactez notre équipe pour toute question concernant votre réservation
                      </p>
                    </div>
                  </div>

                  {/* Information spécifique selon le type de location */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Type de location</p>
                      <p className="text-xs text-gray-600">
                        {rental_type === 'courte' && 
                          "Location courte durée : arrivée et départ selon les dates convenues"
                        }
                        {rental_type === 'mensuel' && 
                          "Location mensuelle : rendez-vous de visite requis avant signature du contrat"
                        }
                        {rental_type === 'achat' && 
                          "Processus d'achat : visite de contrôle nécessaire avant finalisation"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fixe */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 sm:rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;