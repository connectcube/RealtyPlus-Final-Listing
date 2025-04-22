// Frontend authentication service
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const authService = {
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseToken = await userCredential.user.getIdToken();

      // Get JWT from your backend
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseToken,
          email: userCredential.user.email,
        }),
      });

      const data = await response.json();

      // Store JWT token
      localStorage.setItem("token", data.token);

      return {
        user: userCredential.user,
        token: data.token,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
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
