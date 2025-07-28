"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { format, isValid } from "date-fns"
import { fr } from "date-fns/locale"
import type { SafeTrip, SafeUser } from "@/app/types"
import TripDetailsModal from "../../trips/TripDetailsModal"

interface ClientTripCardProps {
  trip: SafeTrip
  currentUser?: SafeUser | null
  onCancel: (id: string) => void
  onArchive: (id: string) => void
  deletingId: string
  archivingId: string
}

const ClientTripCard: React.FC<ClientTripCardProps> = ({
  trip,
  currentUser,
  onCancel,
  onArchive,
  deletingId,
  archivingId,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Formatage sécurisé des dates
  const safeFormatDate = (dateString: string, formatStr: string) => {
    try {
      const date = new Date(dateString)
      if (!isValid(date)) return "Date invalide"
      return format(date, formatStr, { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  const formattedStartShort = safeFormatDate(trip.startDate, "dd MMM")
  const formattedEndShort = safeFormatDate(trip.endDate, "dd MMM")
  const formattedYear = safeFormatDate(trip.startDate, "yyyy")

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-100/70 text-amber-700 border-amber-200",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          label: "En attente",
        }
      case "confirmed":
        return {
          color: "bg-green-100/70 text-green-700 border-green-200",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: "Confirmé",
        }
      case "cancelled":
        return {
          color: "bg-red-100/70 text-red-700 border-red-200",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          label: "Annulé",
        }
      default:
        return {
          color: "bg-gray-100/70 text-gray-700 border-gray-200",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
          label: status,
        }
    }
  }

  const statusConfig = getStatusConfig(trip.status)
  const mainDestination = trip.destinations[0]
  const destinationCount = trip.destinations.length
  const hasSuccessfulPaidTransaction =
    trip.transactions?.some((transaction) => transaction.statut === "réussi" && transaction.etat === "payer") || false

  return (
    <>
      <div className="group bg-gray-200/30 backdrop-blur-md rounded-2xl shadow-sm border border-gray-300/30 overflow-hidden hover:shadow-lg hover:bg-gray-200/40 transition-all duration-300 hover:-translate-y-1">
        {/* Image principale */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={mainDestination?.images?.[0]?.url || "/placeholder.jpg"}
            alt={trip.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-md ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span className="text-xs font-medium">{statusConfig.label}</span>
            </div>
          </div>

          {/* Nombre de destinations */}
          {destinationCount > 1 && (
            <div className="absolute top-3 left-3">
              <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full text-xs font-medium">
                {destinationCount}
              </div>
            </div>
          )}

          {/* Info en bas de l'image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-2 text-white/90 text-xs mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {destinationCount > 1
                  ? `${mainDestination?.city} +${destinationCount - 1}`
                  : `${mainDestination?.city}, ${mainDestination?.country}`}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu de la carte */}
        <div className="p-4 space-y-4">
          {/* Titre et dates */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">{trip.title}</h3>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {formattedStartShort} - {formattedEndShort} {formattedYear}
              </span>
            </div>
          </div>

          {/* Prix et statut paiement */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {trip.totalPrice.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">FCFA</span>
              </div>
              <div className="text-xs text-gray-500">Total TTC</div>
            </div>

            <div
              className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                hasSuccessfulPaidTransaction ? "bg-green-200/70 text-green-700" : "bg-amber-200/70 text-amber-700"
              }`}
            >
              {hasSuccessfulPaidTransaction ? "✓ Payé" : "En attente"}
            </div>
          </div>

          {/* Code de réservation */}
          <div className="text-xs text-gray-500 font-mono bg-gray-100/60 backdrop-blur-sm px-2 py-1 rounded">
            #{trip.code_reservation}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-300/40">
            {/* Bouton voir détails */}
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 bg-gray-800/80 hover:bg-gray-800 backdrop-blur-sm text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Détails
            </button>

            {/* Actions selon le statut */}
            {trip.status !== "cancelled" ? (
              <button
                onClick={() => onCancel(trip.id)}
                disabled={deletingId === trip.id}
                className="px-4 py-2.5 text-red-600 hover:text-red-100/60 hover:bg-red-50/80 backdrop-blur-sm text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deletingId === trip.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Annuler
              </button>
            ) : (
              <button
                onClick={() => onArchive(trip.id)}
                disabled={archivingId === trip.id}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100/60 backdrop-blur-sm text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {archivingId === trip.id ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4-4 4m9-8l4 4-4 4" />
                  </svg>
                )}
                Archiver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal des détails */}
      {showDetailsModal && (
        <TripDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          trip={trip}
          currentUser={currentUser}
        />
      )}
    </>
  )
}

export default ClientTripCard
