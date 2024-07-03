import { create } from 'zustand'; //manages the state in this application

interface useProModalStore {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

export const useProModal = create<useProModalStore>((set) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
}));
