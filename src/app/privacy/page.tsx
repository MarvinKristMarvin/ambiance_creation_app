"use client";
import { useState } from "react";

export default function PrivacyPolicyPage() {
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

        {/* Language-specific content */}
        {lang === "en" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">Privacy Policy</h2>
            <p className="mb-4">
              This Privacy Policy describes how 🟩
              <span className="text-green-400">Krist Marvin</span>{" "}
              (&apos;we&apos;, &apos;our&apos;, &apos;us&apos;) collects, uses,
              and protects your personal data when you use the 🟩
              <span className="text-green-400">FOG</span> application.
            </p>

            <h3 className="mt-3 font-bold">1. Data We Collect</h3>
            <p className="text-sm">
              - Email address (for account creation and communication) <br />
              - Pseudonym (display name) <br />
              - Hashed password (for authentication) <br />
              - Audio files stored locally in IndexedDB <br />
              - Technical logs and error reports via Sentry <br />
            </p>

            <h3 className="mt-3 font-bold">2. How We Use Your Data</h3>
            <p className="text-sm">
              We use your data to:
              <br />- Create and manage your account
              <br />- Enable additional features for signed-in and subscribed
              users
              <br />- Process subscription payments via Lemon Squeezy
              <br />- Improve application stability and fix bugs
            </p>

            <h3 className="mt-3 font-bold">
              3. Third Parties Who May Access Data
            </h3>
            <p className="text-sm">
              - Vercel (hosting provider) <br />
              - Lemon Squeezy (payment processing) <br />
              - Sentry (error monitoring) <br />- Supabase (database and
              authentication services) 🟥
              <span className="text-red-400">
                (confirm exactly what user data is stored here)
              </span>
            </p>

            <h3 className="mt-3 font-bold">4. Cookies and Storage</h3>
            <p className="text-sm">
              We use:
              <br />- JWT tokens stored in your browser for authentication
              <br />- IndexedDB for storing audio files locally
              <br />- No advertising cookies are used
            </p>

            <h3 className="mt-3 font-bold">5. Data Retention</h3>
            <p className="text-sm">
              Data is retained until you request its deletion or your account is
              inactive for 🟩
              <span className="text-green-400">X months/years</span>.
            </p>

            <h3 className="mt-3 font-bold">6. Your Rights</h3>
            <p className="text-sm">
              You have the right to access, rectify, erase, and port your data,
              and to object to processing. To exercise these rights, contact us
              at: 🟩
              <span className="text-green-400">kristmarvin@gmail.com</span>.
            </p>

            <h3 className="mt-3 font-bold">7. Minors</h3>
            <p className="text-sm">
              The service is accessible to minors; if you are under 15, parental
              consent may be required under French law.
            </p>

            <h3 className="mt-3 font-bold">8. Data Transfers Outside the EU</h3>
            <p className="text-sm">
              Your data may be transferred outside the EU (e.g., to the United
              States via Vercel and Sentry). Such transfers are protected by
              Standard Contractual Clauses approved by the European Commission.
            </p>

            <h3 className="mt-3 font-bold">9. Supervisory Authority</h3>
            <p className="text-sm">
              You can lodge a complaint with the CNIL (www.cnil.fr) if you
              believe your rights have been violated.
            </p>
          </>
        )}

        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Politique de Confidentialité
            </h2>
            <p className="mb-4">
              La présente politique de confidentialité explique comment 🟩
              <span className="text-green-400">Krist Marvin</span> (« nous »)
              collecte, utilise et protège vos données personnelles lorsque vous
              utilisez l&apos;application 🟩
              <span className="text-green-400">FOG</span>.
            </p>

            <h3 className="mt-3 font-bold">1. Données collectées</h3>
            <p className="text-sm">
              - Adresse e-mail (création de compte et communication) <br />
              - Pseudonyme (nom affiché) <br />
              - Mot de passe haché (authentification) <br />
              - Fichiers audio stockés localement dans IndexedDB <br />
              - Journaux techniques et rapports d’erreurs via Sentry <br />
            </p>

            <h3 className="mt-3 font-bold">2. Utilisation des données</h3>
            <p className="text-sm">
              Nous utilisons vos données pour :
              <br />- Créer et gérer votre compte
              <br />- Activer des fonctionnalités supplémentaires pour les
              utilisateurs connectés et abonnés
              <br />- Traiter les paiements d’abonnement via Lemon Squeezy
              <br />- Améliorer la stabilité de l’application et corriger les
              bugs
            </p>

            <h3 className="mt-3 font-bold">3. Tiers ayant accès aux données</h3>
            <p className="text-sm">
              - Vercel (hébergement) <br />
              - Lemon Squeezy (paiement) <br />
              - Sentry (surveillance des erreurs) <br />- Supabase (base de
              données et authentification) 🟥
              <span className="text-red-400">
                (à confirmer : quelles données utilisateur sont stockées ?)
              </span>
            </p>

            <h3 className="mt-3 font-bold">4. Cookies et stockage</h3>
            <p className="text-sm">
              Nous utilisons :
              <br />- Jetons JWT stockés dans votre navigateur pour
              l’authentification
              <br />- IndexedDB pour stocker les fichiers audio localement
              <br />- Aucun cookie publicitaire
            </p>

            <h3 className="mt-3 font-bold">5. Durée de conservation</h3>
            <p className="text-sm">
              Les données sont conservées jusqu’à ce que vous demandiez leur
              suppression ou après une inactivité de 🟩
              <span className="text-green-400">X mois/années</span>.
            </p>

            <h3 className="mt-3 font-bold">6. Vos droits</h3>
            <p className="text-sm">
              Vous disposez d’un droit d’accès, de rectification, d’effacement,
              de portabilité et d’opposition au traitement. Pour exercer ces
              droits, contactez : 🟩
              <span className="text-green-400">kristmarvin@gmail.com</span>.
            </p>

            <h3 className="mt-3 font-bold">7. Mineurs</h3>
            <p className="text-sm">
              Le service est accessible aux mineurs ; si vous avez moins de 15
              ans, un consentement parental peut être requis conformément à la
              loi française.
            </p>

            <h3 className="mt-3 font-bold">8. Transfert de données hors UE</h3>
            <p className="text-sm">
              Vos données peuvent être transférées hors de l’UE (par ex. vers
              les États-Unis via Vercel et Sentry). Ces transferts sont encadrés
              par les clauses contractuelles types approuvées par la Commission
              européenne.
            </p>

            <h3 className="mt-3 font-bold">9. Autorité de contrôle</h3>
            <p className="text-sm">
              Vous pouvez déposer une réclamation auprès de la CNIL
              (www.cnil.fr) si vous estimez que vos droits ont été violés.
            </p>
          </>
        )}
      </div>

      {/* Right side color block */}
      <div className="w-3 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
