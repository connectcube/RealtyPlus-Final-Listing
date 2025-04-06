import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "./typeDefinitions";

// Define the store state type
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  updateProfile: (profile: User) => void;
  clearUser: () => void;
}

// Create the store with persistence
export const useZustand = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      updateProfile: (profile) =>
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
