"use client";
import { useState } from "react";

export default function TermsOfSalePage() {
  const [lang, setLang] = useState("en");

  return (
    <main className="flex flex-row justify-center min-h-screen text-gray-100 bg-gray-950">
      {/* Left color block */}
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

        {/* English */}
        {lang === "en" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">Terms of Sale</h2>
            <p className="mb-4">
              These Terms of Sale apply to purchases made on the 🟩
              <span className="text-green-400">FOG</span> platform, operated by
              🟩<span className="text-green-400">Krist Marvin</span>.
            </p>

            <h3 className="mt-3 font-bold">1. Prices</h3>
            <p className="text-sm">
              All prices are indicated in 🟩
              <span className="text-green-400">EUR</span> and include or exclude
              applicable taxes as stated at checkout.
            </p>

            <h3 className="mt-3 font-bold">2. Payment</h3>
            <p className="text-sm">
              Payments are processed securely through 🟩
              <span className="text-green-400">Lemon Squeezy</span>. We do not
              store payment card details.
            </p>

            <h3 className="mt-3 font-bold">3. Delivery</h3>
            <p className="text-sm">
              Digital services are provided immediately after payment
              confirmation. You acknowledge that by accessing paid features, you
              waive your right of withdrawal as per EU law.
            </p>

            <h3 className="mt-3 font-bold">4. Refunds</h3>
            <p className="text-sm">
              Refunds may be granted only in cases of technical failure or as
              required by law. Please contact us at 🟩
              <span className="text-green-400">[your email]</span>.
            </p>

            <h3 className="mt-3 font-bold">5. Changes</h3>
            <p className="text-sm">
              We may update these Terms of Sale with prior notice.
            </p>
          </>
        )}

        {/* French */}
        {lang === "fr" && (
          <>
            <h2 className="mt-4 mb-3 text-2xl font-bold">
              Conditions Générales de Vente
            </h2>
            <p className="mb-4">
              Les présentes Conditions Générales de Vente s&apos;appliquent aux
              achats effectués sur la plateforme 🟩
              <span className="text-green-400">FOG</span>, exploitée par 🟩
              <span className="text-green-400">Krist Marvin</span>.
            </p>

            <h3 className="mt-3 font-bold">1. Prix</h3>
            <p className="text-sm">
              Tous les prix sont indiqués en 🟩
              <span className="text-green-400">EUR</span> et incluent ou
              excluent les taxes applicables, comme précisé lors du paiement.
            </p>

            <h3 className="mt-3 font-bold">2. Paiement</h3>
            <p className="text-sm">
              Les paiements sont traités de manière sécurisée via 🟩
              <span className="text-green-400">Lemon Squeezy</span>. Nous ne
              stockons pas les coordonnées bancaires.
            </p>

            <h3 className="mt-3 font-bold">3. Livraison</h3>
            <p className="text-sm">
              Les services numériques sont fournis immédiatement après la
              confirmation du paiement. Vous reconnaissez qu&apos;en accédant
              aux fonctionnalités payantes, vous renoncez à votre droit de
              rétractation conformément au droit de l&apos;UE.
            </p>

            <h3 className="mt-3 font-bold">4. Remboursements</h3>
            <p className="text-sm">
              Les remboursements peuvent être accordés uniquement en cas de
              défaillance technique ou si la loi l&apos;exige. Contactez-nous à
              🟩<span className="text-green-400">[votre email]</span>.
            </p>

            <h3 className="mt-3 font-bold">5. Modifications</h3>
            <p className="text-sm">
              Nous pouvons modifier ces Conditions Générales de Vente avec
              préavis.
            </p>
          </>
        )}
      </div>

      {/* Right color block */}
      <div className="w-3 sm:w-1/2 bg-emerald-500"></div>
    </main>
  );
}
