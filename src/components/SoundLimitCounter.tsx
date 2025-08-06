import { useGlobalStore } from "@/stores/useGlobalStore";
import React, { useEffect, useState } from "react";

export default function SoundLimitCounter() {
  // Zustand
  const openSettingsMenu = useGlobalStore((state) => state.openSettingsMenu);
  const numberOfSoundsDownloaded = useGlobalStore(
    (state) => state.numberOfSoundsDownloaded
  );

  // Download limits
  const unsignedLimit = 5;
  const signedLimit = 10;
  const premiumLimit = 200;

  // States
  const [limit, setLimit] = useState(0);
  const [userStatus] = useState("unsigned");

  // Update sounds download limit based on user status
  useEffect(() => {
    if (userStatus === "unsigned") setLimit(unsignedLimit);
    else if (userStatus === "signed") setLimit(signedLimit);
    else if (userStatus === "premium") setLimit(premiumLimit);
  }, [userStatus]);

  if (userStatus !== "premium") {
    return (
      <div
        className={`flex-col px-4 py-2 pb-2.5 text-green-200 rounded-sm border-0 ${
          numberOfSoundsDownloaded >= limit
            ? "bg-amber-950/90"
            : "bg-emerald-950/35"
        } text-sm font-bold text-center`}
      >
        {/* FOR UNSIGNED USER*/}
        {limit === unsignedLimit && (
          <>
            {numberOfSoundsDownloaded >= limit && (
              <p className="mb-1 text-amber-200">LIMIT REACHED</p>
            )}
            <p className="text-gray-200">
              {" "}
              {numberOfSoundsDownloaded}/{limit} Sounds downloaded today
            </p>
            <p className="text-gray-200">
              <button
                onClick={openSettingsMenu}
                className="underline hover:cursor-pointer text-emerald-200"
              >
                Sign up
              </button>{" "}
              to upgrade to 20 sounds
            </p>
            <p className="mt-2 text-xs text-emerald-200/100">
              Once a sound is downloaded, it will not count towards the limit
              the next time you use it
            </p>
          </>
        )}

        {/* FOR SIGNED USER*/}
        {limit === signedLimit && (
          <>
            {numberOfSoundsDownloaded >= limit && (
              <p className="mb-1 text-amber-200">LIMIT REACHED</p>
            )}
            <p className="text-gray-200">
              {" "}
              {numberOfSoundsDownloaded}/{limit} Sounds downloaded today
            </p>
            <p className="text-gray-200">
              <button
                onClick={openSettingsMenu}
                className="underline hover:cursor-pointer text-emerald-200"
              >
                Go premium
              </button>{" "}
              for unlimited sounds
            </p>
            <p className="mt-2 text-xs text-emerald-200/100">
              Once a sound is downloaded, it will not count towards the limit
              the next time you use it
            </p>
          </>
        )}
      </div>
    );
  }

  // FOR PREMIUM USER SHOW NOTHING
  return <></>;
}
