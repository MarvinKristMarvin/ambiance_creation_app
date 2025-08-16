"use client";
import { useState } from "react";

export default function ContactPage() {
  const [lang, setLang] = useState("en");

  return (
    <main className="flex flex-row justify-center min-h-screen text-gray-100 bg-gray-950">
      {/* Left side color block */}
      <div className="w-2 bg-emerald-500"></div>

      <div className="w-[calc(100%-1rem)] p-8 sm:w-1/2">
        {/* Title */}
        <h1 className="mb-6 text-6xl font-bold font-title">FOG</h1>

        {/* Language toggle */}
        <div className="flex gap-4 font-bold">
          <button
            onClick={() => setLang("en")}
            className={`hover:cursor-pointer underline-offset-2 ${
              lang === "en" ? "underline text-white" : "text-gray-400"
            }`}
          >
            ENGLISH
          </button>
          <button
            onClick={() => setLang("fr")}
            className={`hover:cursor-pointer underline-offset-2 ${
              lang === "fr" ? "underline text-white" : "text-gray-400"
            }`}
          >
            FRENCH
          </button>
        </div>

        {/* Language-specific content */}
        {lang === "en" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Contact and other informations
            </h2>
            <h3 className="font-bold">Contact mail :</h3>
            <p>kristmarvin@gmail.com</p>
            <h3 className="mt-3 font-bold">Legal entity :</h3>
            <p>Krist Marvin</p>
            <p>Auto-entrepreneur</p>
            <p>SIRET : 999 999 999 99999</p>
            <p>Address : 9 rue des Champs-Élysées 75008 Paris</p>
            <h3 className="mt-3 font-bold">Hosting provider :</h3>
            <p>Vercel Inc.</p>
            <p>340 S Lemon Ave #4133</p>
            <p>Walnut, CA 91789</p>
            <p>USA</p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Contact et autres informations
            </h2>
            <h3 className="font-bold">Adresse e-mail de contact :</h3>
            <p>kristmarvin@gmail.com</p>
            <h3 className="mt-3 font-bold">Entité légale :</h3>
            <p>Krist Marvin</p>
            <p>Auto-entrepreneur</p>
            <p>SIRET : 999 999 999 99999</p>
            <p>Adresse : 9 rue des Champs-Élysées 75008 Paris</p>
            <h3 className="mt-3 font-bold">Hébergeur :</h3>
            <p>Vercel Inc.</p>
            <p>340 S Lemon Ave #4133</p>
            <p>Walnut, CA 91789</p>
            <p>États-Unis</p>
          </>
        )}
      </div>

      {/* Right side color block */}
      <div className="w-2 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
