"use client";
import { useState } from "react";

export default function CopyrightNoticePage() {
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
            <h2 className="mt-4 mb-3 text-2xl font-bold">Copyright Notice</h2>
            <p className="mb-4">
              All content on this website, including but not limited to text,
              images, logos, and software, is the property of 🟩
              <span className="text-green-400">Krist Marvin</span> unless
              otherwise stated.
            </p>

            <p className="text-sm">
              Unauthorized reproduction, distribution, or modification of the
              content is prohibited without prior written consent.
            </p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Mentions de Copyright
            </h2>
            <p className="mb-4">
              Tout le contenu de ce site, y compris mais sans s&apos;y limiter
              aux textes, images, logos et logiciels, est la propriété de 🟩
              <span className="text-green-400">Krist Marvin</span>, sauf mention
              contraire.
            </p>

            <p className="text-sm">
              Toute reproduction, distribution ou modification non autorisée du
              contenu est interdite sans l&apos;accord écrit préalable.
            </p>
          </>
        )}
      </div>

      <div className="w-3 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
