import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import userSignUp from "./helpers/users/signUp";
import { useZustand } from "@/lib/zustand";
import { auth } from "@/lib/firebase";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters." }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const UserSignup = () => {
  const { setUser } = useZustand();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      // Create credentials object from form data
      const credentials = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userType: "users",
      };

      // Call the userSignUp helper function with email signup type
      const response = await userSignUp(credentials, "email");

      // If signup is successful, redirect to login page
      if (response) {
        // You could optionally show a success message here using a toast notification
        navigate("/login");
      }
    } catch (error: any) {
      // Handle specific error cases here
      console.error("Error signing up:", error);
      // You could show error messages to the user here using a toast notification
      // For example: toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const user = await userSignUp(
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        userType: "users",
      },
      "google"
    );
    if (user) {
      console.log("Google signup successful:", user);
      const firstName = user.displayName?.split(" ")[0] || "";
      const lastName = user.displayName?.split(" ")[1] || "";
      const loggedinUser = {
        email: user.email,
        uid: user.uid,
        userType: "users",
        firstName,
        lastName,
        status: "Active" as "Active",
        authProvider: "google",
        termsAccepted: true,
        subscription: null,
        enquiries: undefined,
      };
      setUser(loggedinUser);
      navigate("/");
    } else {
      // Handle error case
      console.error("Google signup failed.");
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <main className="flex-grow mx-auto px-4 md:px-6 py-10 container">
        <Card className="bg-white shadow-lg mx-auto max-w-2xl">
          <CardHeader className="space-y-1 bg-realtyplus py-6 rounded-t-lg text-white text-center">
            <CardTitle className="font-bold text-2xl">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-100">
              Join RealtyPlus to find your perfect property
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the{" "}
                          <a
                            href="/terms"
                            className="text-realtyplus hover:underline"
                          >
                            terms and conditions
                          </a>
                        </FormLabel>
                        <FormDescription>
                          You must agree to our terms and conditions to create
                          an account.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-realtyplus hover:bg-realtyplus-dark w-full md:w-auto"
                >
                  Create Account
                </Button>
              </form>
            </Form>
            <div className="place-content-center grid w-full">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="flex justify-center items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md w-64 text-gray-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="border-2 border-gray-300 border-t-blue-600 rounded-full w-5 h-5 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#ffc107"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
                    />
                    <path
                      fill="#ff3d00"
                      d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
                    />
                    <path
                      fill="#4caf50"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
                    />
                    <path
                      fill="#1976d2"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
                    />
                  </svg>
                )}
                {isLoading ? "Signing up..." : "Sign up with Google"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-realtyplus hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center px-6 py-4 border-t">
            <div className="text-gray-500 text-sm text-center">
              <p>
                Are you a real estate professional?{" "}
                <Link
                  to="/agent/signup"
                  className="font-medium text-realtyplus hover:underline"
                >
                  Register as Agent
                </Link>
                {" or "}
                <Link
                  to="/agency/signup"
                  className="font-medium text-realtyplus hover:underline"
                >
                  Agency
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserSignup;
