// app/checkout/[listingId]/visite/page.tsx
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import CheckoutVisitePage from "./CheckoutVisitePage";

import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";

interface IParams {
  listingId?: string;
}

const CheckoutVisiteRoute = async ({ params }: { params: IParams }) => {
  const listing = await getListingById(params);
  const currentUser = await getCurrentUser();

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
      <CheckoutVisitePage listing={listing} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default CheckoutVisiteRoute;
