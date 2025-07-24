'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from ".";
import Heading from "../Heading";
import SimpleEditModal from "./SimpleEditModal";
import { FaCalendarAlt, FaEdit } from "react-icons/fa";

interface EditOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

const EditOptionsModal: React.FC<EditOptionsModalProps> = ({
  isOpen,
  onClose,
  listingId
}) => {
  const router = useRouter();
  const [showSimpleEdit, setShowSimpleEdit] = useState(false);

  // Fonction pour ouvrir le modal d'édition simple
  const handleEditListing = () => {
    setShowSimpleEdit(true); // Ouvrir le modal simple SANS fermer le premier
  };

  // Fonction pour fermer complètement tous les modals
  const handleCompleteClose = () => {
    setShowSimpleEdit(false);
    onClose(); // Fermer le modal principal
  };

  const EditIcon = FaEdit as React.FC<{ size?: number; className?: string }>;
  const CalendarIcon = FaCalendarAlt as React.FC<{ size?: number; className?: string }>;

  const bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading title="Que souhaitez-vous modifier ?" subtitle="Choisissez une option" />
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={handleEditListing}
          className="border p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
        >
          <EditIcon size={24} className="text-rose-500" />
          <span className="mt-2 text-sm font-medium">Le logement</span>
        </div>

        <div
          onClick={() => {
            router.push(`/disponibilite/${listingId}`);
            handleCompleteClose();
          }}
          className="border p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
        >
          <CalendarIcon size={24} className="text-rose-500" />
          <span className="mt-2 text-sm font-medium">La disponibilité</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal de choix - Se cache quand SimpleEdit est ouvert */}
      <Modal
        isOpen={isOpen && !showSimpleEdit}
        onClose={handleCompleteClose}
        onSubmit={() => {}}
        actionLabel=""
        title="Modifier"
        body={bodyContent}
      />

      {/* Modal d'édition simple */}
      <SimpleEditModal
        isOpen={showSimpleEdit}
        onClose={handleCompleteClose} // Fermer complètement quand on ferme SimpleEdit
        listingId={listingId}
      />
    </>
  );
};

export default EditOptionsModal;