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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de la réservation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Statut et code */}
          <div className="flex items-center justify-between">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
              <span className="mr-2">{statusConfig.icon}</span>
              {statusConfig.label}
            </div>
            <div className="text-sm text-gray-500">
              Code: <span className="font-mono font-medium">#{reservation.code_reservation || "N/A"}</span>
            </div>
          </div>

          {/* Informations du logement */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Logement</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{reservation.listing?.title || "Titre non disponible"}</p>
              <p className="text-sm text-gray-600">
                {reservation.listing?.roomCount} chambres • {reservation.listing?.bathroomCount} salles de bain
              </p>
              <p className="text-sm text-gray-600">
                Capacité: {reservation.listing?.guestCount} personnes
              </p>
            </div>
          </div>

          {/* Informations du voyageur */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Voyageur</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{reservation.user?.name || "Nom non disponible"}</p>
              
              {/* Email - visible seulement pour admin OU si réservation payée ET confirmée */}
              {(currentUser?.role === "admin" || 
                (reservation.etat === "payer" && reservation.status === "confirmed")) ? (
                <p className="text-sm text-gray-600">{reservation.user?.email || "Email non disponible"}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Email masqué (paiement en attente)</p>
              )}
              
              {/* Numéro de téléphone - visible seulement pour admin OU si réservation payée ET confirmée */}
              {reservation.user?.numberPhone && (
                (currentUser?.role === "admin" || 
                 (reservation.etat === "payer" && reservation.status === "confirmed")) ? (
                  <p className="text-sm text-gray-600">📞 {reservation.user.numberPhone}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">📞 Numéro masqué (paiement en attente)</p>
                )
              )}
              
              {/* Message informatif pour les non-admins */}
              {currentUser?.role !== "admin" && 
               !(reservation.etat === "payer" && reservation.status === "confirmed") && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    ℹ️ Les coordonnées du client seront visibles une fois le paiement confirmé et la réservation validée.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates et horaires */}
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Dates et horaires</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Date d'arrivée:</p>
                <p className="font-medium">{safeFormatDate(reservation.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Date de départ:</p>
                <p className="font-medium">{safeFormatDate(reservation.endDate)}</p>
              </div>
              {reservation.check_in_hours && (
                <div>
                  <p className="text-gray-600">Heure d'arrivée:</p>
                  <p className="font-medium">{safeFormatTime(reservation.check_in_hours)}</p>
                </div>
              )}
              {reservation.date_visite && (
                <div>
                  <p className="text-gray-600">Date de visite:</p>
                  <p className="font-medium">{safeFormatDate(reservation.date_visite)}</p>
                </div>
              )}
              {reservation.heure_visite && (
                <div>
                  <p className="text-gray-600">Heure de visite:</p>
                  <p className="font-medium">{safeFormatTime(reservation.heure_visite)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations financières */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informations financières</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix total:</span>
                <span className="font-bold text-lg">{reservation.totalPrice?.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type de location:</span>
                <span className="font-medium">{reservation.rental_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type de transaction:</span>
                <span className="font-medium">{reservation.type_transaction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">État du paiement:</span>
                <span className={`font-medium ${
                  reservation.etat === "payer" 
                    ? "text-green-600" 
                    : reservation.etat === "partiel"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                  {reservation.etat}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions */}
          {reservation.transactions && reservation.transactions.length > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Transactions ({reservation.transactions.length})
              </h3>
              <div className="space-y-3">
                {reservation.transactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Transaction #{index + 1}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.statut === "réussi" 
                            ? "bg-green-100 text-green-600" 
                            : transaction.statut === "en_attente"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {transaction.statut}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.etat === "payer" 
                            ? "bg-green-100 text-green-600" 
                            : transaction.etat === "partiel"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {transaction.etat}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Montant:</span>
                        <span className="font-semibold text-indigo-600">
                          {transaction.montant.toLocaleString()} {transaction.devise}
                        </span>
                      </div>
                      {transaction.nom_mobile_money && (
                        <div className="flex justify-between">
                          <span>nom mobile money:</span>
                          <span>{transaction.nom_mobile_money}</span>
                        </div>
                      )}
                      {transaction.numero_mobile_money && (
                        <div className="flex justify-between">
                          <span>Numéro mobile money:</span>
                          <span>{transaction.numero_mobile_money}</span>
                        </div>
                      )}
                      {transaction.reference_transaction && (
                        <div className="flex justify-between">
                          <span>Référence:</span>
                          <span className="font-mono text-xs">{transaction.reference_transaction}</span>
                        </div>
                      )}
                      {transaction.date_transaction && (
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{safeFormatDate(transaction.date_transaction, "dd/MM/yyyy HH:mm")}</span>
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
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
              <p className="text-gray-700">{reservation.message}</p>
            </div>
          )}

          {/* Motif (si annulée) */}
          {reservation.motif && (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Motif</h3>
              <p className="text-gray-700">{reservation.motif}</p>
            </div>
          )}

          {/* Informations système */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informations système</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p>Date de création:</p>
                <p className="font-medium">{safeFormatDate(reservation.createdAt, "dd/MM/yyyy HH:mm")}</p>
              </div>
              <div>
                <p>ID Réservation:</p>
                <p className="font-mono text-xs">{reservation.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;