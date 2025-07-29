"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";

interface ConfirmPaymentButtonProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onSuccess?: () => void;
}

const ConfirmPaymentButton: React.FC<ConfirmPaymentButtonProps> = ({
  reservation,
  currentUser,
  onSuccess
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'hôte peut confirmer le paiement
  const canConfirmPayment = () => {
    // L'utilisateur doit être l'hôte (propriétaire du listing)
    if (currentUser?.id !== reservation.listing?.user?.id) return false;
    
    // Il doit y avoir au moins une transaction réussie
    const hasSuccessfulTransaction = reservation.transactions?.some(
      (transaction) => transaction.statut === "réussi"
    );
    if (!hasSuccessfulTransaction) return false;
    
    // Le paiement ne doit pas déjà être confirmé par l'hôte
    if (reservation.status_hote === 'confirmed') return false;
    
    return true;
  };

  // Obtenir le message d'état
  const getStatusMessage = () => {
    if (currentUser?.id !== reservation.listing?.user?.id) {
      return "Seul l'hôte peut confirmer le paiement";
    }
    
    const hasSuccessfulTransaction = reservation.transactions?.some(
      (transaction) => transaction.statut === "réussi"
    );
    if (!hasSuccessfulTransaction) {
      return "En attente d'une transaction réussie";
    }
    
    if (reservation.status_hote === 'confirmed') {
      return "Paiement déjà confirmé ✓";
    }
    
    return "Prêt à confirmer le paiement";
  };

  const handleConfirmPayment = async () => {
    if (!canConfirmPayment()) return;

    // Demander confirmation à l'hôte
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir confirmer la réception du paiement ? Cette action est irréversible."
    );

    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      const response = await axios.patch(`/api/reservations/${reservation.id}/confirm-payment`);
      
      toast.success("💰 Paiement confirmé avec succès !");
      
      // Callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      // Rafraîchir la page pour mettre à jour les données
      router.refresh();
      
    } catch (error: any) {
      console.error('Erreur lors de la confirmation:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          "Erreur lors de la confirmation du paiement";
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canConfirm = canConfirmPayment();
  const statusMessage = getStatusMessage();
  const isAlreadyConfirmed = reservation.status_hote === 'confirmed';

  // Afficher les détails des transactions pour l'hôte
  const successfulTransactions = reservation.transactions?.filter(
    (transaction) => transaction.statut === "réussi"
  ) || [];

  return (
    <div className="space-y-4">
      {/* Bouton principal */}
      <button
        onClick={handleConfirmPayment}
        disabled={!canConfirm || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isAlreadyConfirmed
            ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
            : canConfirm
            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirmation en cours...
          </>
        ) : isAlreadyConfirmed ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Paiement confirmé
          </>
        ) : canConfirm ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Confirmer le paiement
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
        isAlreadyConfirmed
          ? "bg-green-50 text-green-700 border border-green-200"
          : canConfirm
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "bg-gray-50 text-gray-600 border border-gray-200"
      }`}>
        <div className="flex items-center justify-center gap-2">
          {isAlreadyConfirmed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : canConfirm ? (
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

      {/* Affichage des transactions réussies pour l'hôte */}
      {canConfirm && successfulTransactions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transactions à confirmer
          </h4>
          <div className="space-y-2">
            {successfulTransactions.map((transaction, index) => (
              <div key={transaction.id} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {transaction.montant.toLocaleString()} {transaction.devise}
                    </span>
                    {transaction.nom_mobile_money && (
                      <span className="text-gray-600 ml-2">
                        via {transaction.nom_mobile_money}
                      </span>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {transaction.statut}
                  </span>
                </div>
                {transaction.reference_transaction && (
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    Réf: {transaction.reference_transaction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information importante pour l'hôte */}
      {canConfirm && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-800">Action importante</p>
              <p className="text-xs text-orange-700 mt-1">
                En confirmant le paiement, vous attestez avoir reçu le montant total. 
                Cette action permettra au client d'accéder à vos coordonnées.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmPaymentButton;