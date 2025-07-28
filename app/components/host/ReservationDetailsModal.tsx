// components/host/ReservationDetailsModal.tsx
"use client";

import { SafeReservation, SafeUser } from "@/app/types";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";

interface ReservationDetailsModalProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onClose: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  currentUser,
  onClose,
}) => {
  // Fonction utilitaire pour formater une date en toute sécurité
  const safeFormatDate = (dateString: string | null | undefined, formatString: string = "dd/MM/yyyy") => {
    if (!dateString) return "Non définie";
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "Date invalide";
      
      return format(date, formatString, { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  // Fonction pour formater une heure
  const safeFormatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Non définie";
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "Heure invalide";
      
      return format(date, "HH:mm", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage d'heure:", error);
      return "Heure invalide";
    }
  };

  // Configuration du statut
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          label: "En attente"
        };
      case "confirmed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          label: "Confirmée"
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌",
          label: "Annulée"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📋",
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(reservation.status);

  // Fermer la modal avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {reservation.listing?.title || "Réservation"}
            </h2>
            <p className="text-gray-500 text-sm">
              {safeFormatDate(reservation.startDate)} - {safeFormatDate(reservation.endDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors duration-200 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Contenu avec scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Statut et code */}
            <div className="flex items-center justify-between">
              <div className={`px-6 py-3 rounded-2xl text-sm font-bold border ${statusConfig.color}`}>
                <span className="mr-3 text-lg">{statusConfig.icon}</span>
                {statusConfig.label}
              </div>
              <div className="text-gray-500 text-sm">
                <span className="text-gray-400">Code:</span>
                <span className="font-mono font-bold text-gray-700 ml-2">#{reservation.code_reservation || "N/A"}</span>
              </div>
            </div>

            {/* Informations du logement */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <span className="mr-3">🏠</span>
                Logement
              </h3>
              <div className="space-y-3">
                <p className="text-gray-900 text-lg font-medium">{reservation.listing?.title || "Titre non disponible"}</p>
                <div className="flex items-center space-x-6 text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-2">🛏️</span>
                    {reservation.listing?.roomCount} chambres
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">🚿</span>
                    {reservation.listing?.bathroomCount} salles de bain
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">👥</span>
                    {reservation.listing?.guestCount} personnes
                  </span>
                </div>
              </div>
            </div>

            {/* Informations du voyageur */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <span className="mr-3">👤</span>
                Voyageur
              </h3>
              <div className="space-y-3">
                <p className="text-gray-900 text-lg font-medium">{reservation.user?.name || "Nom non disponible"}</p>
                
                {/* Email - visible seulement pour admin OU si réservation payée ET confirmée */}
                {(currentUser?.role === "admin" || 
                  (reservation.etat === "payer" && reservation.status === "confirmed")) ? (
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">📧</span>
                    {reservation.user?.email || "Email non disponible"}
                  </p>
                ) : (
                  <p className="text-gray-400 italic flex items-center">
                    <span className="mr-2">📧</span>
                    Email masqué (paiement en attente)
                  </p>
                )}
                
                {/* Numéro de téléphone */}
                {reservation.user?.numberPhone && (
                  (currentUser?.role === "admin" || 
                   (reservation.etat === "payer" && reservation.status === "confirmed")) ? (
                    <p className="text-gray-600 flex items-center">
                      <span className="mr-2">📞</span>
                      {reservation.user.numberPhone}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic flex items-center">
                      <span className="mr-2">📞</span>
                      Numéro masqué (paiement en attente)
                    </p>
                  )
                )}
                
                {/* Message informatif pour les non-admins */}
                {currentUser?.role !== "admin" && 
                 !(reservation.etat === "payer" && reservation.status === "confirmed") && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-xs text-yellow-700 flex items-start">
                      <span className="mr-2 mt-0.5">ℹ️</span>
                      Les coordonnées du client seront visibles une fois le paiement confirmé et la réservation validée.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates et horaires */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <span className="mr-3">📅</span>
                Dates et horaires
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-500 text-sm mb-1">Date d'arrivée</p>
                  <p className="font-bold text-gray-900">{safeFormatDate(reservation.startDate)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-500 text-sm mb-1">Date de départ</p>
                  <p className="font-bold text-gray-900">{safeFormatDate(reservation.endDate)}</p>
                </div>
                {reservation.check_in_hours && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Heure d'arrivée</p>
                    <p className="font-bold text-gray-900">{safeFormatTime(reservation.check_in_hours)}</p>
                  </div>
                )}
                {reservation.date_visite && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Date de visite</p>
                    <p className="font-bold text-gray-900">{safeFormatDate(reservation.date_visite)}</p>
                  </div>
                )}
                {reservation.heure_visite && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Heure de visite</p>
                    <p className="font-bold text-gray-900">{safeFormatTime(reservation.heure_visite)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations financières */}
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <span className="mr-3">💰</span>
                Informations financières
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Prix total</span>
                  <span className="font-bold text-2xl text-gray-900">{reservation.totalPrice?.toLocaleString()} FCFA</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type de location</span>
                    <span className="text-gray-900 font-medium">{reservation.rental_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type de transaction</span>
                    <span className="text-gray-900 font-medium">{reservation.type_transaction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">État du paiement</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                      reservation.etat === "payer" 
                        ? "bg-green-100 text-green-700" 
                        : reservation.etat === "partiel"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {reservation.etat}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            {reservation.transactions && reservation.transactions.length > 0 && (
              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <span className="mr-3">💳</span>
                  Transactions ({reservation.transactions.length})
                </h3>
                <div className="space-y-4">
                  {reservation.transactions.map((transaction, index) => (
                    <div key={transaction.id} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-gray-900 font-medium">Transaction #{index + 1}</span>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            transaction.statut === "réussi" 
                              ? "bg-green-100 text-green-700" 
                              : transaction.statut === "en_attente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.statut}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            transaction.etat === "payer" 
                              ? "bg-green-100 text-green-700" 
                              : transaction.etat === "partiel"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.etat}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Montant</span>
                          <span className="font-bold text-lg text-indigo-600">
                            {transaction.montant.toLocaleString()} {transaction.devise}
                          </span>
                        </div>
                        {transaction.nom_mobile_money && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nom mobile money</span>
                            <span className="text-gray-900">{transaction.nom_mobile_money}</span>
                          </div>
                        )}
                        {transaction.numero_mobile_money && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Numéro mobile money</span>
                            <span className="text-gray-900 font-mono">{transaction.numero_mobile_money}</span>
                          </div>
                        )}
                        {transaction.reference_transaction && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Référence</span>
                            <span className="text-gray-900 font-mono text-xs">{transaction.reference_transaction}</span>
                          </div>
                        )}
                        {transaction.date_transaction && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="text-gray-900">{safeFormatDate(transaction.date_transaction, "dd/MM/yyyy HH:mm")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {reservation.message && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <span className="mr-3">💬</span>
                  Message
                </h3>
                <p className="text-gray-700 leading-relaxed">{reservation.message}</p>
              </div>
            )}

            {/* Motif (si annulée) */}
            {reservation.motif && (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <span className="mr-3">⚠️</span>
                  Motif d'annulation
                </h3>
                <p className="text-red-700">{reservation.motif}</p>
              </div>
            )}

            {/* Informations système */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <span className="mr-3">⚙️</span>
                Informations système
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date de création</span>
                  <span className="text-gray-900 font-mono">{safeFormatDate(reservation.createdAt, "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Réservation</span>
                  <span className="text-gray-900 font-mono text-xs">{reservation.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium hover:scale-105"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;