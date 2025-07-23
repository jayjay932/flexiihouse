// components/host/HostReservationCard.tsx
"use client";

import { SafeReservation, SafeUser, SafeTransaction } from "@/app/types";
import Image from "next/image";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import Button from "../Button";
import ReservationDetailsModal from "./ReservationDetailsModal";

interface HostReservationCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onArchive?: (id: string) => void; // Nouvelle prop pour archiver
  updatingId: string;
  archivingId?: string; // ID de la réservation en cours d'archivage
  onEditTransaction?: (transaction: SafeTransaction) => void;
}

const HostReservationCard: React.FC<HostReservationCardProps> = ({
  reservation,
  currentUser,
  onConfirm,
  onCancel,
  onArchive,
  updatingId,
  archivingId = "",
  onEditTransaction,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { listing, user, startDate, endDate, totalPrice, status, transactions } = reservation;
  
  const formattedStart = startDate ? (() => {
    try {
      const date = new Date(startDate);
      return isValid(date) ? format(date, "dd MMM", { locale: fr }) : "Date invalide";
    } catch {
      return "Date invalide";
    }
  })() : "";
  
  const formattedEnd = endDate ? (() => {
    try {
      const date = new Date(endDate);
      return isValid(date) ? format(date, "dd MMM yyyy", { locale: fr }) : "Date invalide";
    } catch {
      return "Date invalide";
    }
  })() : "";
  
  // Déterminer la couleur du statut
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

  // Configuration du statut de transaction
  const getTransactionStatusConfig = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "success":
      case "completed":
      case "réussi":
        return {
          color: "text-green-600",
          icon: "✅",
          label: "Payé"
        };
      case "pending":
      case "en_attente":
        return {
          color: "text-yellow-600",
          icon: "⏳",
          label: "En attente"
        };
      case "failed":
      case "échec":
        return {
          color: "text-red-600",
          icon: "❌",
          label: "Échec"
        };
      default:
        return {
          color: "text-gray-600",
          icon: "💳",
          label: statut || "Non défini"
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const isLoading = updatingId === reservation.id;
  const isArchiving = archivingId === reservation.id;

  // Récupérer la dernière transaction (la plus récente)
  const latestTransaction = transactions && transactions.length > 0 
    ? transactions.sort((a, b) => new Date(b.date_transaction || 0).getTime() - new Date(a.date_transaction || 0).getTime())[0]
    : null;

  // Logique pour déterminer quels boutons afficher
  const getActionButtons = () => {
    if (status === "pending") {
      return (
        <button
          onClick={() => onConfirm(reservation.id)}
          disabled={isLoading}
          className={`flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isLoading ? 'animate-pulse' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Confirmation...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Confirmer</span>
            </>
          )}
        </button>
      );
    }

    if (status === "confirmed") {
      return (
        <button
          onClick={() => onCancel(reservation.id)}
          disabled={isLoading}
          className={`flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isLoading ? 'animate-pulse' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Annulation...</span>
            </>
          ) : (
            <>
              <span>❌</span>
              <span>Annuler</span>
            </>
          )}
        </button>
      );
    }

    if (status === "cancelled" && onArchive) {
      return (
        <button
          onClick={() => onArchive(reservation.id)}
          disabled={isArchiving}
          className={`flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isArchiving ? 'animate-pulse' : ''
          }`}
        >
          {isArchiving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Archivage...</span>
            </>
          ) : (
            <>
              <span>📦</span>
              <span>Archiver</span>
            </>
          )}
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer ${
        status === "cancelled" 
          ? "border-red-200 bg-red-50/30 hover:shadow-lg" 
          : "border-gray-200 hover:shadow-xl hover:scale-[1.02]"
      }`}>
        {/* Header avec image */}
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-4xl">🏠</div>
              </div>
            )}
            <Image
              src={listing?.images?.[0]?.url || "/placeholder.jpg"}
              alt={listing?.title || "Logement"}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${status === "cancelled" ? 'grayscale-[0.3]' : ''}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Overlay pour les réservations annulées */}
            {status === "cancelled" && (
              <div className="absolute inset-0 bg-red-900/20"></div>
            )}
          </div>
          
          {/* Badge statut */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} backdrop-blur-sm bg-white/90`}>
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.label}
            </div>
          </div>

          {/* Badge code réservation */}
          <div className="absolute top-3 left-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              status === "cancelled" 
                ? "bg-red-700/70 text-white" 
                : "bg-black/70 text-white"
            }`}>
              #{reservation.code_reservation}
            </div>
          </div>

          {/* Badge nombre de transactions */}
          {transactions && transactions.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                status === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}>
                {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Badge "Annulée" pour les réservations annulées */}
          {status === "cancelled" && (
            <div className="absolute bottom-3 left-3">
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white backdrop-blur-sm">
                Annulée
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          {/* Titre du logement */}
          <div>
            <h3 className={`text-lg font-semibold line-clamp-2 group-hover:text-gray-700 transition-colors ${
              status === "cancelled" ? "text-gray-600" : "text-gray-900"
            }`}>
              {listing?.title || "Logement sans titre"}
            </h3>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">📅</span>
            <span className="text-sm font-medium">
              {formattedStart} → {formattedEnd}
            </span>
          </div>

          {/* Info voyageur */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.image ? (
                <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${
                  status === "cancelled" ? "ring-red-200" : "ring-gray-200"
                }`}>
                  <Image 
                    src={user.image} 
                    alt="Voyageur" 
                    width={40} 
                    height={40} 
                    className={`object-cover w-full h-full ${status === "cancelled" ? 'grayscale-[0.5]' : ''}`}
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm ${
                  status === "cancelled" 
                    ? "from-red-400 to-red-500" 
                    : "from-blue-400 to-purple-500"
                }`}>
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              {/* Indicateur en ligne - visible seulement si info accessible */}
              {(currentUser?.role === "admin" || 
                (reservation.etat === "payer" && reservation.status === "confirmed")) && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                  status === "cancelled" ? "bg-red-400" : "bg-green-400"
                }`}></div>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                status === "cancelled" ? "text-gray-600" : "text-gray-900"
              }`}>
                {user?.name || "Client anonyme"}
              </p>
              {/* Statut du voyageur avec indicateur de visibilité */}
              <p className="text-xs text-gray-500">
                {(currentUser?.role === "admin" || 
                  (reservation.etat === "payer" && reservation.status === "confirmed")) 
                  ? "Contact disponible" 
                  : "Contact masqué"}
              </p>
            </div>
            
            {/* Badge de statut d'accès aux infos */}
            {currentUser?.role !== "admin" && 
             !(reservation.etat === "payer" && reservation.status === "confirmed") && (
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  status === "cancelled" ? "bg-red-400" : "bg-yellow-400"
                }`} title="Informations masquées"></div>
              </div>
            )}
          </div>

          {/* Informations de transaction */}
          {latestTransaction && (
            <div className={`rounded-xl p-4 border ${
              status === "cancelled" 
                ? "bg-red-50 border-red-100" 
                : "bg-blue-50 border-blue-100"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="text-sm font-medium text-gray-700">Paiement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs font-semibold ${getTransactionStatusConfig(latestTransaction.statut).color}`}>
                    {getTransactionStatusConfig(latestTransaction.statut).icon} {getTransactionStatusConfig(latestTransaction.statut).label}
                  </div>
                  {currentUser?.role === "admin" && status !== "cancelled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditTransaction) {
                          onEditTransaction(latestTransaction);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                {latestTransaction.nom_mobile_money && (
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{latestTransaction.nom_mobile_money}</span>
                  </div>
                )}
                {latestTransaction.numero_mobile_money && (
                  <div className="flex justify-between">
                    <span>Numéro mobile money:</span>
                    <span className="font-medium">{latestTransaction.numero_mobile_money}</span>
                  </div>
                )}
                  {latestTransaction.nom_mobile_money   && (
                  <div className="flex justify-between">
                    <span>nom mobile money:</span>
                    <span className="font-medium">{latestTransaction.nom_mobile_money}</span>
                  </div>
                )}
                {latestTransaction.reference_transaction && (
                  <div className="flex justify-between">
                    <span>Référence:</span>
                    <span className="font-medium">{latestTransaction.reference_transaction}</span>
                  </div>
                )}
                {latestTransaction.montant && (
                  <div className="flex justify-between">
                    <span>Montant:</span>
                    <span className={`font-semibold ${
                      status === "cancelled" ? "text-red-700" : "text-blue-700"
                    }`}>
                      {latestTransaction.montant.toLocaleString()} {latestTransaction.devise || 'FCFA'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Motif d'annulation si présent */}
          {status === "cancelled" && reservation.motif && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">ℹ️</span>
                <span className="text-sm font-medium text-red-700">Motif d'annulation</span>
              </div>
              <p className="text-xs text-red-600">{reservation.motif}</p>
            </div>
          )}

          {/* Prix total */}
          <div className={`rounded-xl p-4 ${
            status === "cancelled" ? "bg-red-50" : "bg-gray-50"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm text-gray-600">Montant total</span>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  status === "cancelled" ? "text-red-700 line-through" : "text-gray-900"
                }`}>
                  {totalPrice?.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-gray-500">TTC</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {getActionButtons()}

            <button
              onClick={() => setShowDetails(true)}
              className={`flex-1 bg-white border-2 hover:shadow-md hover:scale-[1.02] font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                status === "cancelled" 
                  ? "border-red-200 text-red-700 hover:text-red-900 hover:border-red-300"
                  : "border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span>👁️</span>
              <span>Détails</span>
            </button>
          </div>
        </div>

        {/* Effet de survol */}
        <div className={`absolute inset-0 bg-gradient-to-t to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ${
          status === "cancelled" ? "from-red-900/5" : "from-black/5"
        }`}></div>
      </div>

      {/* Modal des détails */}
      {showDetails && (
        <ReservationDetailsModal
          reservation={reservation}
          currentUser={currentUser}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default HostReservationCard;