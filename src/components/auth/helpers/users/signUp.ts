import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, fireDataBase } from "@/lib/firebase";

interface UserCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: string;
}

export default async function userSignUp(
  credentials: UserCredentials,
  type: "google" | "email"
) {
  try {
    if (type === "google") {
      // Google signup
      const googleProvider = new GoogleAuthProvider();

      try {
        // First try with popup
        const result = await signInWithPopup(auth, googleProvider);
        const user = await result.user;
        const docRef = await doc(fireDataBase, "users", user.uid);
        // Create user profile in Firestore
        await setDoc(docRef, {
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          phone: user.phoneNumber || "",
          createdAt: new Date(),
          authProvider: "google",
          role:"user"
        });

        return user;
      } catch (popupError: any) {
        // If popup fails due to COOP or other popup-related issues, fall back to redirect
        if (
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.code === "auth/cancelled-popup-request" ||
          popupError.message.includes("Cross-Origin-Opener-Policy")
        ) {
          await signInWithRedirect(auth, googleProvider);
          // Note: The redirect flow will handle the rest of the authentication
          // The user will be redirected back to your app after successful authentication
          return null;
        }
        throw popupError;
      }
    } else {
      // Email signup
      const { email, password, firstName, lastName, phone } = credentials;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = await userCredential.user;
      const docRef = await doc(fireDataBase, "users", user.uid);
      // Create user profile in Firestore
      await setDoc(docRef, {
        email,
        firstName,
        lastName,
        phone,
        role:"user",
        createdAt: new Date(),
        authProvider: "email",
      });

      return user;
    }
  } catch (error: any) {
    // Handle specific Firebase errors
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error(
          "Email already registered. Please login or use a different email."
        );

      case "auth/invalid-email":
        throw new Error("Invalid email address.");

      case "auth/operation-not-allowed":
        throw new Error("Operation not allowed.");

      case "auth/weak-password":
        throw new Error(
          "Password is too weak. Please use a stronger password."
        );

      case "auth/popup-closed-by-user":
        throw new Error("Google sign-in was cancelled.");

      default:
        throw new Error("An error occurred during sign up. Please try again.");
    }
  }
}
