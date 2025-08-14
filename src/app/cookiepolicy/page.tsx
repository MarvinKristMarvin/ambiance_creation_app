"use client";
import { useState } from "react";

export default function CookiePolicyPage() {
  const [lang, setLang] = useState("en");

  return (
    <main className="flex flex-row justify-center min-h-screen text-gray-100 bg-gray-950">
      <div className="w-3 sm:w-0 bg-emerald-500"></div>

      <div className="w-[calc(100%-1.5rem)] p-8 sm:w-1/2">
        <h1 className="mb-6 text-6xl font-bold font-title">FOG</h1>

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

        {lang === "en" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">Cookie Policy</h2>
            <p className="mb-4">
              This Cookie Policy explains how 🟩
              <span className="text-green-400">FOG</span> uses cookies and
              similar technologies.
            </p>

            <h3 className="mt-3 font-bold">1. What are cookies?</h3>
            <p className="text-sm">
              Cookies are small text files stored on your device to enhance your
              experience.
            </p>

            <h3 className="mt-3 font-bold">2. Types of cookies we use</h3>
            <ul className="text-sm list-disc list-inside">
              <li>Essential cookies for site operation</li>
              <li>
                Analytics cookies via 🟩
                <span className="text-green-400">Sentry</span>
              </li>
              <li>Authentication tokens stored in IndexedDB</li>
            </ul>

            <h3 className="mt-3 font-bold">3. Managing cookies</h3>
            <p className="text-sm">
              You can disable cookies in your browser, but this may affect site
              functionality.
            </p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Politique de Cookies
            </h2>
            <p className="mb-4">
              Cette Politique de Cookies explique comment 🟩
              <span className="text-green-400">FOG</span> utilise les cookies et
              technologies similaires.
            </p>

            <h3 className="mt-3 font-bold">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h3>
            <p className="text-sm">
              Les cookies sont de petits fichiers texte stockés sur votre
              appareil pour améliorer votre expérience.
            </p>

            <h3 className="mt-3 font-bold">2. Types de cookies utilisés</h3>
            <ul className="text-sm list-disc list-inside">
              <li>Cookies essentiels au fonctionnement du site</li>
              <li>
                Cookies d&apos;analyse via 🟩
                <span className="text-green-400">Sentry</span>
              </li>
              <li>Jetons d&apos;authentification stockés dans IndexedDB</li>
            </ul>

            <h3 className="mt-3 font-bold">3. Gestion des cookies</h3>
            <p className="text-sm">
              Vous pouvez désactiver les cookies dans votre navigateur, mais
              cela peut affecter certaines fonctionnalités.
            </p>
          </>
        )}
      </div>

      <div className="w-3 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
