"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const signIn = async (email: string, password: string) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(), // Important for setting cookies
    });

    // Better Auth throws an error if authentication fails
    // If we reach here, it was successful
    return { success: true, data: response };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(), // Important for setting cookies
    });

    // Better Auth throws an error if sign up fails
    // If we reach here, it was successful
    return { success: true, data: response };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
};

export const signOut = async () => {
  try {
    const response = await auth.api.signOut({
      headers: await headers(), // Important for clearing cookies
    });

    // If we reach here, sign out was successful
    return { success: true, data: response };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
};
