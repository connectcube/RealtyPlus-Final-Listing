import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USER } from "./typeDefinitions";

// Define the store state type
interface UserState {
  user: USER | null;
  isAuthenticated: boolean;
  setUser: (profile: USER) => void;
  clearUser: () => void;
}

// Create the store with persistence
export const useZustand = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (profile) =>
        set(() => ({
          user: profile,
          isAuthenticated: true,
        })),
      clearUser: () =>
        set(() => ({
          user: null,
          isAuthenticated: false,
        })),
    }),
    {
      name: "user-storage", // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
