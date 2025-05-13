"use client";

import { useState } from "react";
import SettingsMenu from "./SettingsMenu";
import Modal from "./Modal";

interface Props {
  text: string;
}

export default function HeaderButton({ text }: Props) {
  const [opened, setOpened] = useState(false);

  const handleClose = () => setOpened(false);

  return (
    <>
      <div
        onClick={() => setOpened(true)}
        className={`flex flex-row justify-start items-center py-4 px-6 text-center text-gray-400 text-lg font-bold hover:bg-gray-800 hover:cursor-pointer h-full`}
      >
        <span className="ml-1 text-1xl">{text}</span>
      </div>

      {opened && (
        <Modal onClose={handleClose}>
          {text === "Settings" && <SettingsMenu />}
        </Modal>
      )}
    </>
  );
}
