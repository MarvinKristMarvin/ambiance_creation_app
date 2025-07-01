import { useGlobalStore } from "@/stores/useGlobalStore";
import React from "react";
import { useState } from "react";
import { signIn, signUp, signOut } from "@/server/users"; // async code outside of client component
import { authClient } from "@/lib/auth-client";

export default function SettingsMenu() {
  const { data: session, refetch } = authClient.useSession();
  // Zustand
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const setSoundsCentering = useGlobalStore(
    (state) => state.setSoundsCentering
  );

  // States
  const [signingUp, setSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Options to map the sounds positionning buttons
  const positions = ["Left", "Center", "Right"] as const;

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);
      if (result.success) {
        await refetch(); // Refresh session
      } else {
        setError(result.error || "Sign in failed");
      }
    } catch (error) {
      setError("Sign in failed");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp(email, password, name);
      if (result.success) {
        await refetch(); // Refresh session
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch (error) {
      setError("Sign up failed");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const result = await signOut();
      if (result.success) {
        await refetch(); // Refresh session
      } else {
        setError(result.error || "Sign out failed");
      }
    } catch (error) {
      setError("Sign out failed");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div aria-label="settings menu" className="pl-1 text-gray-300">
      <p className="mb-2 font-bold text-left text-gray-300 text-md">
        {session ? "Connected as " + session.user.name : "Connexion"}
      </p>

      {!session && (
        <div className="flex gap-2 mb-2 ">
          <button
            aria-label="login button"
            type="button"
            onClick={() => setSigningUp(false)}
            className={`px-8 py-2 text-sm font-bold rounded-xs flex-1 hover:cursor-pointer  ${
              !signingUp
                ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "text-gray-500 bg-gray-900 hover:bg-gray-800"
            }`}
          >
            Log in
          </button>
          <button
            aria-label="sign up button"
            type="button"
            onClick={() => setSigningUp(true)}
            className={`px-8 py-2 text-sm font-bold rounded-xs flex-1.5 hover:cursor-pointer ${
              signingUp
                ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "text-gray-500 bg-gray-900 hover:bg-gray-800"
            }`}
          >
            Or sign up
          </button>
        </div>
      )}

      {error && (
        <div className="p-2 mb-2 text-sm text-red-400 rounded bg-red-900/20">
          {error}
        </div>
      )}

      {!session && (
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-2 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-950 rounded-xs bg-gray-950 focus:outline-none focus:border-emerald-700 "
          />

          {signingUp && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mb-2 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-800 rounded-xs bg-gray-950 focus:outline-none focus:border-emerald-700"
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-2 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-800 rounded-xs bg-gray-950 focus:outline-none focus:border-emerald-700"
          />

          {signingUp && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 mb-2 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-800 rounded-xs bg-gray-950 focus:outline-none focus:border-emerald-700"
            />
          )}
        </form>
      )}

      <button
        aria-label={session ? "sign out button" : "auth action button"}
        type="button"
        onClick={() =>
          session
            ? handleSignOut()
            : signingUp
            ? handleSignUp()
            : handleSignIn()
        }
        disabled={isLoading}
        className={`w-full px-6 py-2 mb-3 text-sm font-bold text-gray-100 rounded-xs hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          session
            ? "bg-red-800 hover:bg-red-700"
            : "bg-emerald-600 hover:bg-emerald-500"
        }`}
      >
        {isLoading
          ? "Loading..."
          : session
          ? "Log out"
          : signingUp
          ? "Sign up"
          : "Log in"}
      </button>

      {/* <p className="pl-0 mb-2 font-bold text-left text-gray-300 text-md">
        Sounds positioning
      </p>
      <div className="flex gap-2">
        {positions.map((position) => (
          <button
            aria-label={`${position} position button`}
            key={position}
            onClick={() => setSoundsCentering(position)}
            className={`flex-1 py-2 font-bold text-sm hover:bg-gray-700 hover:cursor-pointer rounded-xs ${
              soundsCentering === position
                ? "bg-gray-700 text-gray-300" // Active state
                : "bg-gray-900 text-gray-500" // Inactive state
            }`}
          >
            {position}
          </button>
        ))}
      </div> */}

      <p className="pl-0 mt-0 mb-1.5 font-bold text-left text-gray-300 text-md">
        Shortcuts
      </p>
      <div className="flex-col gap-2 text-sm font-bold">
        <div className="flex justify-between">
          <span className="text-gray-400">Expand all sounds</span>
          <span className="text-gray-600">Ctrl + E</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Collapse all sounds</span>
          <span className="text-gray-600">Ctrl + C</span>
        </div>
      </div>
    </div>
  );
}
