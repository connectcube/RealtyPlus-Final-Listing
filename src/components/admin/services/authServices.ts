// Frontend authentication service
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const authService = {
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error) {
      throw error;
    }
  },

  // Use this for authenticated requests
  async getAuthHeader() {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  },
};
