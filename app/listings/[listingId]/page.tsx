"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import { SafeListing, SafeUser } from "@/app/types";

interface ListingsPageProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

const ListingsPage: React.FC<ListingsPageProps> = ({ listings, currentUser }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = useMemo(() => {
    return searchParams && Array.from(searchParams.entries()).length > 0;
  }, [searchParams]);

  const handleResetFilters = () => {
    router.push("/"); // ou "/listings" si tu préfères
  };

  return (
    <Container>
      <div className="pt-4">
        {hasFilters && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
            >
              🔄 Réinitialiser les filtres
            </button>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            Aucun logement trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                data={listing}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default ListingsPage;
