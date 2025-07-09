'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EditOptionsModal from "@/app/components/modals/EditOptionsModal";

interface PropertiesClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/listings/${id}`)
        .then(() => {
          toast.success('Listing supprimé');
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error);
        })
        .finally(() => {
          setDeletingId('');
        });
    },
    [router]
  );

  const openEditOptions = (id: string) => {
    setSelectedListingId(id);
    setIsEditModalOpen(true);
  };

  return (
    <Container>
      <Heading title="Vos logements" subtitle="Gérez vos annonces et disponibilités" />

      <div
        className="
          mt-10
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
      >
        {listings.map((listing) => (
          <div key={listing.id} className="relative group border rounded-xl overflow-hidden">
            <ListingCard
              data={listing}
              actionId={listing.id}
              onAction={onCancel}
              disabled={deletingId === listing.id}
           
              currentUser={currentUser}
            />

            {/* ✅ Boutons en bas, overlay stylé */}
            <div className="flex justify-between px-4 py-3 bg-white border-t text-sm text-gray-700">
              <button
                onClick={() => openEditOptions(listing.id)}
                className="flex-1 mr-2 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded-lg transition"
              >
                Modifier
              </button>
              <button
                onClick={() => onCancel(listing.id)}
                disabled={deletingId === listing.id}
                className="flex-1 ml-2 border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && selectedListingId && (
        <EditOptionsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          listingId={selectedListingId}
        />
      )}
    </Container>
  );
};

export default PropertiesClient;
