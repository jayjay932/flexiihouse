"use client";
import { useState } from "react";
import { SafeReservation, SafeUser, SafeTransaction } from "@/app/types";
import HostReservationCard from "../host/HostReservationCard";
import TransactionEditModal from "../modals/TransactionEditModal";

interface AllReservationsAdminProps {
  reservations: SafeReservation[];
  currentUser: SafeUser;
}

const AllReservationsAdmin: React.FC<AllReservationsAdminProps> = ({
  reservations,
  currentUser,
}) => {
  const [updatingId, setUpdatingId] = useState<string>("");
  const [archivingId, setArchivingId] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<SafeTransaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const handleConfirm = async (reservationId: string) => {
    setUpdatingId(reservationId);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/confirm`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur confirmation");
      window.location.reload();
    } catch (error) {
      console.error("Erreur confirmation :", error);
      alert("Erreur lors de la confirmation de la réservation");
    } finally {
      setUpdatingId("");
    }
  };

  // Utiliser PATCH au lieu de POST pour l'annulation
  const handleCancel = async (reservationId: string) => {
    setUpdatingId(reservationId);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "PATCH", // ✅ PATCH au lieu de POST
      });
      if (!res.ok) throw new Error("Erreur annulation");
      window.location.reload();
    } catch (error) {
      console.error("Erreur annulation :", error);
      alert("Erreur lors de l'annulation de la réservation");
    } finally {
      setUpdatingId("");
    }
  };

  // Nouvelle fonction d'archivage
  const handleArchive = async (reservationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir archiver cette réservation ? Elle ne sera plus visible dans cette liste.")) {
      return;
    }

    setArchivingId(reservationId);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/archive`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur archivage");
      }
      window.location.reload();
    } catch (error) {
      console.error("Erreur archivage :", error);
      alert(`Erreur lors de l'archivage : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setArchivingId("");
    }
  };

  const handleEditTransaction = (transaction: SafeTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleTransactionUpdate = () => {
    // Recharger la page pour voir les changements
    window.location.reload();
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  // Statistiques rapides (incluant les annulées)
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
    totalTransactions: reservations.reduce((acc, r) => acc + (r.transactions?.length || 0), 0),
    paidTransactions: reservations.reduce((acc, r) => 
      acc + (r.transactions?.filter(t => t.statut === "réussi" && t.etat === "payer").length || 0), 0
    ),
  };

  // Séparer les réservations par statut pour un meilleur affichage
  const activeReservations = reservations.filter(r => r.status !== "cancelled");
  const cancelledReservations = reservations.filter(r => r.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Réservations administrateur
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Connecté en tant que : <strong>{currentUser.name || currentUser.email}</strong>
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="hidden md:flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <div className="text-blue-600 font-semibold text-lg">{stats.total}</div>
            <div className="text-blue-600 text-xs">Total</div>
          </div>
          <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 font-semibold text-lg">{stats.pending}</div>
            <div className="text-yellow-600 text-xs">En attente</div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <div className="text-green-600 font-semibold text-lg">{stats.confirmed}</div>
            <div className="text-green-600 text-xs">Confirmées</div>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <div className="text-red-600 font-semibold text-lg">{stats.cancelled}</div>
            <div className="text-red-600 text-xs">Annulées</div>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
            <div className="text-purple-600 font-semibold text-lg">{stats.paidTransactions}/{stats.totalTransactions}</div>
            <div className="text-purple-600 text-xs">Transactions payées</div>
          </div>
        </div>
      </div>

      {/* Section des réservations actives */}
      {activeReservations.length > 0 && (
        <div className="space-y-8">
          {/* Réservations actives avec transactions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>💳</span>
              Réservations actives avec transactions ({activeReservations.filter(r => r.transactions && r.transactions.length > 0).length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeReservations
                .filter(reservation => reservation.transactions && reservation.transactions.length > 0)
                .map((reservation) => (
                  <div key={reservation.id} className="space-y-3">
                    <HostReservationCard
                      reservation={reservation}
                      currentUser={currentUser}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                      onArchive={handleArchive}
                      updatingId={updatingId}
                      archivingId={archivingId}
                      onEditTransaction={handleEditTransaction}
                    />
                    
                    {/* Boutons d'édition des transactions */}
                    {currentUser.role === "admin" && reservation.transactions && reservation.transactions.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Actions admin - Transactions ({reservation.transactions.length})
                        </div>
                        <div className="space-y-2">
                          {reservation.transactions.map((transaction, index) => (
                            <button
                              key={transaction.id}
                              onClick={() => handleEditTransaction(transaction)}
                              className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Transaction #{index + 1}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.statut === "réussi" 
                                      ? "bg-green-100 text-green-600" 
                                      : transaction.statut === "en_attente"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-red-100 text-red-600"
                                  }`}>
                                    {transaction.statut}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.etat === "payer" 
                                      ? "bg-green-100 text-green-600" 
                                      : transaction.etat === "partiel"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-red-100 text-red-600"
                                  }`}>
                                    {transaction.etat}
                                  </span>
                                </div>
                                <div className="text-gray-500">
                                  {transaction.montant.toLocaleString()} {transaction.devise}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Réservations actives sans transactions */}
          {activeReservations.filter(reservation => !reservation.transactions || reservation.transactions.length === 0).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                Réservations actives sans transactions ({activeReservations.filter(r => !r.transactions || r.transactions.length === 0).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeReservations
                  .filter(reservation => !reservation.transactions || reservation.transactions.length === 0)
                  .map((reservation) => (
                    <HostReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      currentUser={currentUser}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                      onArchive={handleArchive}
                      updatingId={updatingId}
                      archivingId={archivingId}
                      onEditTransaction={handleEditTransaction}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section des réservations annulées */}
      {cancelledReservations.length > 0 && (
        <div className="mt-8">
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <span>❌</span>
              Réservations annulées ({cancelledReservations.length})
              <span className="text-sm font-normal text-red-600">- Cliquez sur "Archiver" pour les masquer</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cancelledReservations.map((reservation) => (
                <div key={reservation.id} className="space-y-3">
                  <HostReservationCard
                    reservation={reservation}
                    currentUser={currentUser}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onArchive={handleArchive}
                    updatingId={updatingId}
                    archivingId={archivingId}
                    onEditTransaction={handleEditTransaction}
                  />
                  
                  {/* Boutons d'édition des transactions (désactivés pour les annulées) */}
                  {currentUser.role === "admin" && reservation.transactions && reservation.transactions.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-3 space-y-2 border border-red-100">
                      <div className="text-xs font-medium text-red-600 mb-2">
                        Transactions de la réservation annulée ({reservation.transactions.length})
                      </div>
                      <div className="space-y-2">
                        {reservation.transactions.map((transaction, index) => (
                          <div
                            key={transaction.id}
                            className="w-full text-left p-2 bg-white border border-red-200 rounded-lg text-xs opacity-75"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-red-700">Transaction #{index + 1}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.statut === "réussi" 
                                    ? "bg-green-100 text-green-600" 
                                    : transaction.statut === "en_attente"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                                }`}>
                                  {transaction.statut}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.etat === "payer" 
                                    ? "bg-green-100 text-green-600" 
                                    : transaction.etat === "partiel"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                                }`}>
                                  {transaction.etat}
                                </span>
                              </div>
                              <div className="text-red-500 line-through">
                                {transaction.montant.toLocaleString()} {transaction.devise}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-red-600 italic mt-2">
                        ⚠️ Réservation annulée - Transactions en lecture seule
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune réservation */}
      {reservations.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune réservation trouvée</h3>
          <p className="text-gray-600">
            Il n'y a actuellement aucune réservation à afficher.
          </p>
        </div>
      )}

      {/* Modal d'édition des transactions */}
      {showTransactionModal && selectedTransaction && (
        <TransactionEditModal
          transaction={selectedTransaction}
          currentUser={currentUser}
          onClose={closeTransactionModal}
          onUpdate={handleTransactionUpdate}
        />
      )}
    </div>
  );
};

export default AllReservationsAdmin;