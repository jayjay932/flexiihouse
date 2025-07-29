"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import prisma from "@/app/libs/prismadb";

interface ValidateArrivalButtonProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onSuccess?: () => void;
}

const ValidateArrivalButton: React.FC<ValidateArrivalButtonProps> = ({
  reservation,
  currentUser,
  onSuccess
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur peut valider l'arrivée
  const canValidateArrival = () => {
    // L'utilisateur doit être le client de la réservation
    if (currentUser?.id !== reservation.userId) return false;
    
    // La réservation doit être confirmée par l'hôte
    if (reservation.status !== 'confirmed') return false;
    
    // Le paiement doit être effectué
    const hasSuccessfulPayment = reservation.transactions?.some(
      (transaction) => transaction.statut === "réussi" && transaction.etat === "payer"
    );
    if (!hasSuccessfulPayment) return false;
    
    // L'arrivée ne doit pas déjà être validée
    if (reservation.status_client === 'confirmed') return false;
    
    return true;
  };

  // Obtenir le message d'état
  const getStatusMessage = () => {
    if (currentUser?.id !== reservation.userId) {
      return "Seul le client peut valider son arrivée";
    }
    
    if (reservation.status !== 'confirmed') {
      return "En attente de confirmation de l'hôte";
    }
    
    const hasSuccessfulPayment = reservation.transactions?.some(
      (transaction) => transaction.statut === "réussi" && transaction.etat === "payer"
    );
    if (!hasSuccessfulPayment) {
      return "Paiement requis avant validation";
    }
    
    if (reservation.status_client === 'confirmed') {
      return "Arrivée déjà validée ✓";
    }
    
    return "Prêt à valider votre arrivée";
  };

  const handleValidateArrival = async () => {
    if (!canValidateArrival()) return;

    setIsLoading(true);

    try {
      const response = await axios.patch(`/api/reservations/${reservation.id}/validate-arrival`);
      
      toast.success("🎉 Arrivée validée avec succès !");
      
      // Callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      // Rafraîchir la page pour mettre à jour les données
      router.refresh();
      
    } catch (error: any) {
      console.error('Erreur lors de la validation:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          "Erreur lors de la validation de l'arrivée";
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canValidate = canValidateArrival();
  const statusMessage = getStatusMessage();
  const isAlreadyValidated = reservation.status_client === 'confirmed';

  return (
    <div className="space-y-3">
      {/* Bouton principal */}
      <button
        onClick={handleValidateArrival}
        disabled={!canValidate || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isAlreadyValidated
            ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
            : canValidate
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Validation en cours...
          </>
        ) : isAlreadyValidated ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Arrivée validée
          </>
        ) : canValidate ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Valider mon arrivée
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Non disponible
          </>
        )}
      </button>

      {/* Message d'état */}
      <div className={`text-center text-sm py-2 px-4 rounded-lg ${
        isAlreadyValidated
          ? "bg-green-50 text-green-700 border border-green-200"
          : canValidate
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "bg-gray-50 text-gray-600 border border-gray-200"
      }`}>
        <div className="flex items-center justify-center gap-2">
          {isAlreadyValidated ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : canValidate ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          <span>{statusMessage}</span>
        </div>
      </div>

      {/* Information supplémentaire pour les locations courtes */}
      {reservation.rental_type === 'courte' && canValidate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Information importante</p>
              <p className="text-xs text-blue-700 mt-1">
                Validez votre arrivée une fois arrivé(e) sur les lieux. 
                Cela confirmera votre présence à l'hôte.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidateArrivalButton;