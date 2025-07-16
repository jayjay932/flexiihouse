"use client";

import { SafeReservation, SafeUser } from "@/app/types";
import HostReservationCard from "../host/HostReservationCard";
import { useState } from "react";

interface AllReservationsAdminProps {
  reservations: SafeReservation[];
  currentUser: SafeUser;
}

const AllReservationsAdmin: React.FC<AllReservationsAdminProps> = ({
  reservations,
  currentUser,
}) => {
  const [updatingId, setUpdatingId] = useState("");

  const handleConfirm = async (reservationId: string) => {
    setUpdatingId(reservationId);
    try {
      await fetch(`/api/reservations/${reservationId}/confirm`, {
        method: "POST",
      });
      window.location.reload();
    } catch (error) {
      console.error("Erreur confirmation:", error);
    } finally {
      setUpdatingId("");
    }
  };

  const handleCancel = async (reservationId: string) => {
    setUpdatingId(reservationId);
    try {
      await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "POST",
      });
      window.location.reload();
    } catch (error) {
      console.error("Erreur annulation:", error);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Réservations (admin : {currentUser.name || currentUser.email})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <HostReservationCard
            key={reservation.id}
            reservation={reservation}
            currentUser={currentUser}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            updatingId={updatingId}
          />
        ))}
      </div>
    </div>
  );
};

export default AllReservationsAdmin;