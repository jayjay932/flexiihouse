import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";

import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import CheckoutClient from "./CheckoutClient";

interface IParams {
  listingId?: string;
}

const CheckoutPage = async ({ params }: { params: IParams }) => {
  const listing = await getListingById(params); // ✅ Peut être null
  const currentUser = await getCurrentUser();

  // Gestion du cas où le logement est introuvable
  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState
          title="Logement introuvable"
          subtitle="Ce logement n'existe pas ou a été supprimé."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <CheckoutClient listing={listing} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default CheckoutPage;
