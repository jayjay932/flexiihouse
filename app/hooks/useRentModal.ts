import { create } from 'zustand';

interface RentModalStore {
  isOpen: boolean;
  initialData?: any; // Données pour pré-remplir les champs en mode édition
  onOpen: (data?: any) => void;
  onClose: () => void;
}

const useRentModal = create<RentModalStore>((set) => ({
  isOpen: false,
  initialData: undefined,
  onOpen: (data) => set({ isOpen: true, initialData: data }), // ouvrir avec ou sans data
  onClose: () => set({ isOpen: false, initialData: undefined }), // réinitialiser tout
}));

export default useRentModal;
