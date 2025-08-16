"use client";
import { useState } from "react";

export default function CopyrightNoticePage() {
  const [lang, setLang] = useState<"en" | "fr">("en");

  return (
    <main className="flex flex-row justify-center min-h-screen text-gray-100 bg-gray-950">
      <div className="w-2 bg-emerald-500"></div>

      <div className="w-[calc(100%-1rem)] p-8 sm:w-1/2">
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
              All custom code, design, and branding on this website are the
              property of Krist Marvin unless otherwise stated.
            </p>

            <p className="mb-4">
              The sounds and images used in this application are sourced from
              libraries that are{" "}
              <strong>
                free for commercial use and do not require attribution
              </strong>
              . While they are free to use, they remain the property of their
              respective creators.
            </p>

            <p className="text-sm">
              Unauthorized reproduction, distribution, or modification of the
              proprietary code, design, or branding elements is prohibited
              without prior written consent.
            </p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Mentions de Copyright
            </h2>
            <p className="mb-4">
              L’ensemble du code personnalisé, du design et de l’identité
              visuelle de ce site est la propriété de Krist Marvin, sauf
              indication contraire.
            </p>

            <p className="mb-4">
              Les sons et images utilisés dans cette application proviennent de
              bibliothèques{" "}
              <strong>
                libres de droits pour un usage commercial et ne nécessitant
                aucune attribution
              </strong>
              . Bien qu’ils soient libres d’utilisation, ils restent la
              propriété de leurs créateurs respectifs.
            </p>

            <p className="text-sm">
              Toute reproduction, distribution ou modification non autorisée du
              code, du design ou des éléments visuels propriétaires est
              interdite sans l’accord écrit préalable.
            </p>
          </>
        )}
      </div>

      <div className="w-2 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
