"use client";

import { IoMdClose } from "react-icons/io";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const CloseIcon = IoMdClose as React.FC<{ size?: number; className?: string }>;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Ferme la modale avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
      {/* Conteneur */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative animate-fadeIn">
        {/* Titre et bouton de fermeture */}
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="text-sm text-gray-800">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
