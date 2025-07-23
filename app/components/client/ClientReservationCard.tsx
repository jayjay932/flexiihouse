"use client";

import { useState } from "react";
import { SafeReservation, SafeUser } from "@/app/types";
import Image from "next/image";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import ReservationDetailsModal from'@/app/components/modals/ReservationDetailsModal' 

interface ClientReservationCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onCancel: (id: string) => void;
  onArchive?: (id: string) => void;
  deletingId: string;
  archivingId?: string;
}

const ClientReservationCard: React.FC<ClientReservationCardProps> = ({
  reservation,
  currentUser,
  onCancel,
  onArchive,
  deletingId,
  archivingId = "",
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { listing, startDate, endDate, code_reservation, totalPrice, status } = reservation;

  // Formatage sécurisé des dates
  const safeFormatDate = (dateString: string, formatStr: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "Date invalide";
      return format(date, formatStr, { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const formattedStart = safeFormatDate(startDate, "dd MMM");
  const formattedEnd = safeFormatDate(endDate, "dd MMM yyyy");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          label: "En attente",
        };
      case "confirmed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          label: "Confirmée",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌",
          label: "Annulée",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📋",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const isLoading = deletingId === reservation.id;
  const isArchiving = archivingId === reservation.id;

  // Vérifier si les infos de l'hôte doivent être visibles
  const hasSuccessfulPaidTransaction = reservation.transactions?.some(
    (transaction) => transaction.statut === "réussi" && transaction.etat === "payer"
  ) || false;

  const canViewHostInfo = currentUser?.role === "admin" || 
    (reservation.status === "confirmed" && hasSuccessfulPaidTransaction);

  // Récupérer les infos de l'hôte (propriétaire du listing)
  const hostInfo = listing?.user;

  return (
    <>
      {/* Card principale (inchangée) */}
      <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer ${
        status === "cancelled" 
          ? "border-red-200 bg-red-50/30 hover:shadow-lg" 
          : "border-gray-200 hover:shadow-xl hover:scale-[1.02]"
      }`}>
        {/* Image */}
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
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${status === "cancelled" ? "grayscale-[0.3]" : ""}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Overlay pour les réservations annulées */}
            {status === "cancelled" && (
              <div className="absolute inset-0 bg-red-900/20"></div>
            )}
          </div>

          {/* Statut */}
          <div className="absolute top-3 right-3">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} backdrop-blur-sm bg-white/90`}
            >
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.label}
            </div>
          </div>

          {/* Code réservation */}
          <div className="absolute top-3 left-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              status === "cancelled" 
                ? "bg-red-700/70 text-white" 
                : "bg-black/70 text-white"
            }`}>
              #{code_reservation}
            </div>
          </div>

          {/* Badge d'accès aux infos hôte */}
          {!canViewHostInfo && (
            <div className="absolute bottom-3 right-3">
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white backdrop-blur-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Contact masqué
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {listing?.title || "Logement sans titre"}
          </h3>

          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">📅</span>
            <span className="text-sm font-medium">
              {formattedStart} → {formattedEnd}
            </span>
          </div>

          {/* Informations sur l'hôte */}
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                {hostInfo?.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-200">
                    <Image 
                      src={hostInfo.image} 
                      alt="Hôte" 
                      width={32} 
                      height={32} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                    {hostInfo?.name?.[0]?.toUpperCase() || "H"}
                  </div>
                )}
                
                {/* Indicateur de disponibilité des infos */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                  canViewHostInfo ? "bg-green-400" : "bg-gray-400"
                }`}></div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {hostInfo?.name || "Nom de l'hôte"}
                </p>
                <p className="text-xs text-gray-500">
                  {canViewHostInfo ? "Contact disponible" : "Contact masqué"}
                </p>
              </div>

              {/* Badge d'état */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                canViewHostInfo 
                  ? "bg-green-100 text-green-600" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {canViewHostInfo ? "✓" : "⚠️"}
              </div>
            </div>

            {/* Message informatif */}
            {!canViewHostInfo && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  ℹ️ Les coordonnées de l'hôte seront disponibles après confirmation de la réservation et réussite du paiement.
                </p>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm text-gray-600">Montant total</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {totalPrice?.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-gray-500">TTC</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {status === "cancelled" && onArchive ? (
              <button
                onClick={() => onArchive(reservation.id)}
                disabled={isArchiving}
                className={`flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isArchiving ? "animate-pulse" : ""
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
            ) : (
              status !== "cancelled" && (
                <button
                  onClick={() => onCancel(reservation.id)}
                  disabled={isLoading}
                  className={`flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    isLoading ? "animate-pulse" : ""
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
              )
            )}

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

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
      </div>

      {/* Nouveau modal séparé */}
      <ReservationDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        reservation={reservation}
        currentUser={currentUser}
      />
    </>
  );
};

export default ClientReservationCard;