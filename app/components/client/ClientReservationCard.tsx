"use client"

import type React from "react"

import { useState } from "react"
import type { SafeReservation, SafeUser } from "@/app/types"
import Image from "next/image"
import { format, isValid } from "date-fns"
import { fr } from "date-fns/locale"
import ReservationDetailsModal from "@/app/components/modals/ReservationDetailsModal"

interface ClientReservationCardProps {
  reservation: SafeReservation
  currentUser?: SafeUser | null
  onCancel: (id: string) => void
  onArchive?: (id: string) => void
  deletingId: string
  archivingId?: string
}

const ClientReservationCard: React.FC<ClientReservationCardProps> = ({
  reservation,
  currentUser,
  onCancel,
  onArchive,
  deletingId,
  archivingId = "",
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const { listing, startDate, endDate, code_reservation, totalPrice, status, price } = reservation

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

  const formattedStart = safeFormatDate(startDate, "MMM d")
  const formattedEnd = safeFormatDate(endDate, "MMM d")
  const isLoading = deletingId === reservation.id
  const isArchiving = archivingId === reservation.id

  // Vérifier si les infos de l'hôte doivent être visibles
  const hasSuccessfulPaidTransaction =
    reservation.transactions?.some((transaction) => transaction.statut === "réussi" && transaction.etat === "payer") ||
    false

  const canViewHostInfo =
    currentUser?.role === "admin" || (reservation.status === "confirmed" && hasSuccessfulPaidTransaction)

  // Récupérer les infos de l'hôte (propriétaire du listing)
  const hostInfo = listing?.user

  return (
    <>
      {/* Card style Airbnb - Transparente grisâtre */}
      <div
        className={`bg-gray-200/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg border border-gray-300/30 hover:bg-gray-200/40 transition-all duration-300 ${
          status === "cancelled" ? "opacity-60" : ""
        }`}
      >
        {/* En-tête avec titre et prix - Style Airbnb */}
        <div className="p-6 pb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{listing?.title || "Logement sans titre"}</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 text-base font-medium">
              ${listing.price} /nuit · <span className="font-bold">${totalPrice?.toLocaleString()} total</span>
            </p>
          </div>
        </div>

        {/* Images côte à côte - Style Airbnb */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Image principale */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src={listing?.images?.[0]?.url || "/placeholder.jpg"}
                  alt={listing?.title || "Logement"}
                  fill
                  className={`object-cover ${imageLoaded ? "opacity-100" : "opacity-0"} ${
                    status === "cancelled" ? "grayscale" : ""
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-300/60 backdrop-blur-sm animate-pulse flex items-center justify-center rounded-3xl">
                    <div className="text-3xl">🏠</div>
                  </div>
                )}
              </div>

              {/* Nom et dates - Style Airbnb */}
              <div className="mt-3">
                <p className="font-bold text-gray-900 text-base">{listing?.quater || "Location"}</p>
                <p className="text-gray-600 text-sm font-medium">
                  {formattedStart} – {formattedEnd}
                </p>
              </div>
            </div>

            {/* Image secondaire */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src={listing?.images?.[1]?.url || listing?.images?.[0]?.url || "/placeholder.jpg"}
                  alt={listing?.title || "Logement"}
                  fill
                  className={`object-cover ${status === "cancelled" ? "grayscale" : ""}`}
                />
              </div>

              {/* Nom et dates - Style Airbnb */}
              <div className="mt-3">
                <p className="font-bold text-gray-900 text-base">{listing?.category || "Category"}</p>
                <p className="text-gray-600 text-sm font-medium">
                  {formattedStart} – {formattedEnd}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur l'hôte - Simplifié */}
        {canViewHostInfo && (
          <div className="px-6 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                {hostInfo?.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={hostInfo.image || "/placeholder.svg"}
                      alt="Hôte"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-500/70 backdrop-blur-sm text-white text-sm flex items-center justify-center font-bold">
                    {hostInfo?.name?.[0]?.toUpperCase() || "H"}
                  </div>
                )}
              </div>
              <p className="text-base text-gray-700 font-semibold">Hôte: {hostInfo?.name || "Nom de l'hôte"}</p>
            </div>
          </div>
        )}

     {/* Actions - Boutons noirs opaques dès le départ */}
<div className="px-6 pb-6 flex gap-3">
  <button
    onClick={() => setShowDetails(true)}
    className="flex-1 bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl text-base transition-colors"
  >
    Voir détails
  </button>

  {status === "cancelled" && onArchive ? (
    <button
      onClick={() => onArchive(reservation.id)}
      disabled={isArchiving}
      className="bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl text-base transition-colors disabled:opacity-50"
    >
      {isArchiving ? "..." : "Archiver"}
    </button>
  ) : (
    status !== "cancelled" && (
      <button
        onClick={() => onCancel(reservation.id)}
        disabled={isLoading}
        className="bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl text-base transition-colors disabled:opacity-50"
      >
        {isLoading ? "..." : "Annuler"}
      </button>
    )
  )}
</div>

      </div>

      {/* Modal */}
      <ReservationDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        reservation={reservation}
        currentUser={currentUser}
      />
    </>
  )
}

export default ClientReservationCard
