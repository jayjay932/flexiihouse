// components/modals/TransactionEditModal.tsx
"use client";

import { useState } from "react";
import { SafeUser, SafeTransaction } from "@/app/types";

interface TransactionEditModalProps {
  transaction: SafeTransaction;
  currentUser: SafeUser;
  onClose: () => void;
  onUpdate: () => void;
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  transaction,
  currentUser,
  onClose,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statut, setStatut] = useState(transaction.statut);
  const [etat, setEtat] = useState(transaction.etat);

  const statutOptions = [
    { value: "en_attente", label: "En attente", color: "text-yellow-600", icon: "⏳" },
    { value: "réussi", label: "Réussi", color: "text-green-600", icon: "✅" },
    { value: "échoué", label: "Échoué", color: "text-red-600", icon: "❌" },
  ];

  const etatOptions = [
    { value: "non_payer", label: "Non payé", color: "text-red-600", icon: "❌" },
    { value: "partiel", label: "Partiellement payé", color: "text-yellow-600", icon: "⚠️" },
    { value: "payer", label: "Payé", color: "text-green-600", icon: "✅" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statut,
          etat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour de la transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Modifier la transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Informations de la transaction */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">Informations de base</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono text-xs">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{transaction.type_transaction}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant:</span>
                <span className="font-bold text-blue-600">
                  {transaction.montant.toLocaleString()} {transaction.devise}
                </span>
              </div>
              {transaction.nom_mobile_money && (
                <div className="flex justify-between">
                  <span>nom mobile money:</span>
                  <span className="font-medium">{transaction.nom_mobile_money}</span>
                </div>
              )}
                {transaction.numero_mobile_money && (
                <div className="flex justify-between">
                  <span>numero mobile money:</span>
                  <span className="font-medium">{transaction.numero_mobile_money}</span>
                </div>
              )}
              {transaction.reference_transaction && (
                <div className="flex justify-between">
                  <span>Référence:</span>
                  <span className="font-mono text-xs">{transaction.reference_transaction}</span>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Statut de la transaction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Statut de la transaction
              </label>
              <div className="space-y-2">
                {statutOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      statut === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="statut"
                      value={option.value}
                      checked={statut === option.value}
                      onChange={(e) => setStatut(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-lg mr-3">{option.icon}</span>
                    <span className={`font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* État du paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                État du paiement
              </label>
              <div className="space-y-2">
                {etatOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      etat === option.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="etat"
                      value={option.value}
                      checked={etat === option.value}
                      onChange={(e) => setEtat(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-lg mr-3">{option.icon}</span>
                    <span className={`font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionEditModal;