import getCurrentUser from "@/app/actions/getCurrentUser";
import getAllReservations from "@/app/actions/getAllReservations";
import AllReservationsAdmin from "@/app/components/admin/AllReservationsAdmin";
import EmptyState from "@/app/components/EmptyState";

const AdminReservationsPage = async () => {
  const currentUser = await getCurrentUser();

  // Si l'utilisateur n'est pas connecté ou n'est pas admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <EmptyState
        title="Accès refusé"
        subtitle="Seuls les administrateurs peuvent consulter cette page."
      />
    );
  }

  const reservations = await getAllReservations();

  if (!reservations || reservations.length === 0) {
    return (
      <EmptyState
        title="Aucune réservation"
        subtitle="Aucune réservation trouvée pour le moment."
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Toutes les réservations</h1>
      <AllReservationsAdmin
        reservations={reservations}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminReservationsPage;
