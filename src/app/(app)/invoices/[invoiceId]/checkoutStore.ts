import { create } from "zustand";

interface CheckoutStore {
  checkoutUrl: string | null;
  setCheckoutUrl: (url: string | null) => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  checkoutUrl: null,
  setCheckoutUrl: (url) => set({ checkoutUrl: url }),
}));
