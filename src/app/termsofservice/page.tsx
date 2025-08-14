"use client";
import { useState } from "react";

export default function TermsOfServicePage() {
  const [lang, setLang] = useState("en");

  return (
    <main className="flex flex-row justify-center min-h-screen text-gray-100 bg-gray-950">
      {/* Left side color block */}
      <div className="w-3 sm:w-0 bg-emerald-500"></div>

      <div className="w-[calc(100%-1.5rem)] p-8 sm:w-1/2">
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

        {lang === "en" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">Terms of Service</h2>
            <p className="mb-4">
              These Terms of Service govern the access and use of the 🟩
              <span className="text-green-400">FOG</span> application operated
              by 🟩
              <span className="text-green-400">Krist Marvin</span>{" "}
              (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By creating an
              account or using the service, you agree to these terms.
            </p>

            <h3 className="mt-3 font-bold">1. Service Description</h3>
            <p className="text-sm">
              FOG is a 🟥
              <span className="text-red-400">
                [briefly describe your app&apos;s purpose/functionality]
              </span>{" "}
              accessible via the web.
            </p>

            <h3 className="mt-3 font-bold">2. Account Registration</h3>
            <p className="text-sm">
              Users must provide accurate information during account creation
              and keep it updated. Accounts are personal and non-transferable.
            </p>

            <h3 className="mt-3 font-bold">3. User Obligations</h3>
            <p className="text-sm">
              You agree not to use the service for illegal activities, infringe
              intellectual property rights, or disrupt other users.
            </p>

            <h3 className="mt-3 font-bold">4. Availability</h3>
            <p className="text-sm">
              We strive to ensure service availability but cannot guarantee
              uninterrupted access.
            </p>

            <h3 className="mt-3 font-bold">5. Termination</h3>
            <p className="text-sm">
              We may suspend or delete accounts in case of breach of these
              terms. You may close your account at any time.
            </p>

            <h3 className="mt-3 font-bold">6. Changes to Terms</h3>
            <p className="text-sm">
              We may update these terms with prior notice. Continued use of the
              service constitutes acceptance of the new terms.
            </p>

            <h3 className="mt-3 font-bold">7. Governing Law</h3>
            <p className="text-sm">
              These terms are governed by French law. Disputes will be subject
              to the jurisdiction of 🟩
              <span className="text-green-400">
                [your local competent court]
              </span>
              .
            </p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Conditions Générales d&apos;Utilisation
            </h2>
            <p className="mb-4">
              Les présentes Conditions Générales d’Utilisation régissent l’accès
              et l’utilisation de l’application 🟩
              <span className="text-green-400">FOG</span> exploitée par 🟩
              <span className="text-green-400">Krist Marvin</span> (« nous »).
              En créant un compte ou en utilisant le service, vous acceptez ces
              conditions.
            </p>

            <h3 className="mt-3 font-bold">1. Description du service</h3>
            <p className="text-sm">
              FOG est 🟥
              <span className="text-red-400">
                [décrivez brièvement la finalité/fonctionnalité de l&apos;app]
              </span>{" "}
              accessible via le web.
            </p>

            <h3 className="mt-3 font-bold">2. Création de compte</h3>
            <p className="text-sm">
              L’utilisateur doit fournir des informations exactes lors de la
              création de compte et les maintenir à jour. Le compte est
              personnel et non transférable.
            </p>

            <h3 className="mt-3 font-bold">
              3. Obligations de l&apos;utilisateur
            </h3>
            <p className="text-sm">
              Vous vous engagez à ne pas utiliser le service à des fins
              illégales, à ne pas enfreindre les droits de propriété
              intellectuelle, ni à perturber l’expérience des autres
              utilisateurs.
            </p>

            <h3 className="mt-3 font-bold">4. Disponibilité</h3>
            <p className="text-sm">
              Nous mettons tout en œuvre pour assurer la disponibilité du
              service, sans pouvoir garantir un accès ininterrompu.
            </p>

            <h3 className="mt-3 font-bold">5. Résiliation</h3>
            <p className="text-sm">
              Nous pouvons suspendre ou supprimer un compte en cas de violation
              des présentes conditions. Vous pouvez fermer votre compte à tout
              moment.
            </p>

            <h3 className="mt-3 font-bold">6. Modifications</h3>
            <p className="text-sm">
              Nous pouvons modifier ces conditions avec préavis. La poursuite de
              l’utilisation du service vaut acceptation des nouvelles
              conditions.
            </p>

            <h3 className="mt-3 font-bold">7. Loi applicable</h3>
            <p className="text-sm">
              Ces conditions sont régies par le droit français. Les litiges
              seront soumis à la compétence de 🟩
              <span className="text-green-400">
                [votre tribunal compétent local]
              </span>
              .
            </p>
          </>
        )}
      </div>

      {/* Right side color block */}
      <div className="w-3 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
