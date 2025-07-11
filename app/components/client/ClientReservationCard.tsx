"use client";

import { useState } from "react";
import { SafeReservation, SafeUser } from "@/app/types";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Modal from "../modals/Modal";

interface ClientReservationCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onCancel: (id: string) => void;
  deletingId: string;
}

const ClientReservationCard: React.FC<ClientReservationCardProps> = ({
  reservation,
  currentUser,
  onCancel,
  deletingId,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { listing, startDate, endDate, code_reservation, totalPrice, status } = reservation;

  const formattedStart = format(new Date(startDate), "dd MMM", { locale: fr });
  const formattedEnd = format(new Date(endDate), "dd MMM yyyy", { locale: fr });

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

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
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
              }`}
              onLoad={() => setImageLoaded(true)}
            />
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
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
              #{code_reservation}
            </div>
          </div>
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
            {status !== "cancelled" && (
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
      </div>

      {/* Modal */}
      {showDetails && (
        <Modal
          title="Détails de la réservation"
          isOpen
          onClose={() => setShowDetails(false)}
        >
          <div className="text-sm space-y-2 text-neutral-700">
            <p>
              <strong>Logement :</strong> {listing?.title}
            </p>
            <p>
              <strong>Ville :</strong> {listing?.city}
            </p>
            <p>
              <strong>Adresse :</strong> {listing?.locationValue}
            </p>
            <p>
              <strong>Code réservation :</strong> #{code_reservation}
            </p>
            <p>
              <strong>Dates :</strong>{" "}
              {formattedStart} → {formattedEnd}
            </p>
            <p>
              <strong>Montant :</strong> {totalPrice?.toLocaleString()} FCFA
            </p>
            <p>
              <strong>Statut :</strong> {statusConfig.label}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ClientReservationCard;
