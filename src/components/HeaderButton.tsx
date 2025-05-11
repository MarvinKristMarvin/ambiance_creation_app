"use client";

import { useState } from "react";
import AmbianceMenu from "./AmbianceMenu";
import SettingsMenu from "./SettingsMenu";

interface Props {
  text: string;
}

export default function HeaderButton({ text }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpened(!opened)}
        className={`flex flex-row justify-start items-center py-4 px-6 text-center text-gray-300 text-lg font-bold hover:bg-gray-800 hover:cursor-pointer ${
          !opened && "border-b-1 border-gray-700"
        }`}
      >
        {/* <MenuIcon className="w-7 h-7 " /> */}
        <span className="ml-1 text-1xl">{text}</span>
        <span className="text-right flex-1 mr-1 text-xs select-none">
          {opened ? "▲" : "▼"}
        </span>
      </div>
      {opened && text === "Ambiance" && <AmbianceMenu />}
      {opened && text === "Settings" && <SettingsMenu />}
    </>
  );
}
