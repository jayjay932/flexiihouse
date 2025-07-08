import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import HostReservationsClient from "./HostReservationsClient";

const HostReservationsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non connecté" subtitle="Veuillez vous connecter." />
      </ClientOnly>
    );
  }

  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="Aucune réservation"
          subtitle="Vous n'avez encore reçu aucune réservation sur vos logements."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <HostReservationsClient
        reservations={reservations}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default HostReservationsPage;
