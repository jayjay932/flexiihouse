// components/host/HostReservationCard.tsx
"use client";

import { SafeReservation, SafeUser } from "@/app/types";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import Button from "../Button";
import ReservationDetailsModal from "./ReservationDetailsModal";

interface HostReservationCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  updatingId: string;
}

const HostReservationCard: React.FC<HostReservationCardProps> = ({
  reservation,
  currentUser,
  onConfirm,
  onCancel,
  updatingId,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { listing, user, startDate, endDate, totalPrice, status } = reservation;
  
  const formattedStart = startDate ? format(new Date(startDate), "dd MMM", { locale: fr }) : "";
  const formattedEnd = endDate ? format(new Date(endDate), "dd MMM yyyy", { locale: fr }) : "";
  
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

  const statusConfig = getStatusConfig(status);
  
  const isLoading = updatingId === reservation.id;

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
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
              }`}
              onLoad={() => setImageLoaded(true)}
            />
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
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
              #{reservation.code_reservation}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          {/* Titre du logement */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
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
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <Image 
                    src={user.image} 
                    alt="Voyageur" 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              {/* Indicateur en ligne */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Client anonyme"}
              </p>
              <p className="text-xs text-gray-500">Voyageur</p>
            </div>
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
            {status === "pending" ? (
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
            ) : (
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
            )}

            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              <span>Détails</span>
            </button>
          </div>
        </div>

        {/* Effet de survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
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