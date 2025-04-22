import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, fireDataBase } from "@/lib/firebase"; // Assuming you have firebase config
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ADMIN } from "@/lib/typeDefinitions";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});
const API_URL = "http://localhost:3000/api";
export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const userToken = await userCredential.user.getIdToken();

      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ token: userToken, email: values.email }),
      });
      console.log("Response from backend", response);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases from backend
        switch (response.status) {
          case 400:
            throw new Error("Missing required fields");
          case 401:
            throw new Error("Authentication failed");
          case 403:
            throw new Error(data.error || "Access denied");
          case 500:
            throw new Error("Server error");
          default:
            throw new Error(data.error || "Login failed");
        }
      }

      // Check admin permissions in Firestore
      try {
        const adminDoc = await getDoc(
          doc(fireDataBase, "admins", userCredential.user.uid)
        );

        if (!adminDoc.exists()) {
          await auth.signOut();
          throw new Error("Access denied: Not an admin user");
        }

        const adminData = adminDoc.data() as ADMIN;

        if (!adminData.isApproved) {
          await auth.signOut();
          throw new Error(
            "Your admin account is pending approval. Please contact the super admin."
          );
        }

        // Store the session token from backend
        if (data.token) {
          // You might want to store this in a secure way
          localStorage.setItem("adminToken", data.token);
        }

        // Navigate on success
        navigate("/admin");
      } catch (firestoreError: any) {
        console.error("Firestore Error:", firestoreError);

        if (firestoreError.code === "permission-denied") {
          throw new Error(
            "Missing or insufficient permissions to access admin data"
          );
        }
        throw firestoreError;
      }
    } catch (error: any) {
      console.error("Login Error:", {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });

      // Handle different types of errors
      if (error.code === "permission-denied") {
        setError("You don't have permission to access this resource");
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(error.message || "An error occurred during login");
      }

      // Ensure user is signed out if there's a permission error
      if (error.code === "permission-denied") {
        await auth.signOut();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[100svh]">
      <main className="flex-grow mx-auto px-4 md:px-6 py-10 container">
        <Card className="bg-white shadow-lg mx-auto max-w-md">
          <CardHeader className="space-y-1 bg-realtyplus py-6 rounded-t-lg text-white text-center">
            <CardTitle className="font-bold text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-gray-100">
              Sign in to your RealtyPlus admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div
                className="flex items-start gap-2 mb-6 p-4 border rounded-lg text-sm"
                role="alert"
                aria-live="polite"
                style={{
                  backgroundColor: "rgba(254, 226, 226, 0.5)",
                  borderColor: "#EF4444",
                  color: "#991B1B",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 mt-0.5 w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember me and Forgot password */}
                <div className="flex justify-between items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    to="/forgot-password"
                    className="text-realtyplus text-sm hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="bg-realtyplus hover:bg-realtyplus-dark w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
