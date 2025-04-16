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

  // Add error handling specifically for permission errors
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Check for permissions
      try {
        const adminDoc = await getDoc(
          doc(fireDataBase, "admins", userCredential.user.uid)
        );

        if (!adminDoc.exists()) {
          await auth.signOut();
          throw new Error("Access denied: Not an admin user");
        }

        // Check if you can actually access the data
        const adminData = adminDoc.data() as ADMIN;

        if (!adminData) {
          await auth.signOut();
          throw new Error("Error accessing admin data");
        }

        if (!adminData.isApproved) {
          await auth.signOut();
          throw new Error(
            "Your admin account is pending approval. Please contact the super admin."
          );
        }
      } catch (firestoreError: any) {
        // Handle Firestore permission errors specifically
        if (firestoreError.code === "permission-denied") {
          throw new Error(
            "Missing or insufficient permissions to access admin data"
          );
        }
        throw firestoreError;
      }

      navigate("/admin");
    } catch (error: any) {
      console.error("Login error:", error);

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
    <div className=" h-[100svh] flex justify-center items-center ">
      <main className="flex-grow container mx-auto py-10 px-4 md:px-6">
        <Card className="max-w-md mx-auto bg-white shadow-lg">
          <CardHeader className="space-y-1 text-center bg-realtyplus text-white rounded-t-lg py-6">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-gray-100">
              Sign in to your RealtyPlus admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div
                className="mb-6 p-4 text-sm border rounded-lg flex items-start gap-2"
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
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
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
                <div className="flex items-center justify-between">
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
                        <FormLabel className="text-sm font-normal">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    to="/forgot-password"
                    className="text-sm text-realtyplus hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-realtyplus hover:bg-realtyplus-dark"
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
