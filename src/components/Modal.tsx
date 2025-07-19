"use client";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface Props {
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export default function Modal({ onClose, children, title }: Props) {
  // When pressing escape, close the modal
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    // Called when the component unmounts and before calling the useEffect, needed to have only one listener active
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Centered modal with black transparent background around it, taking a reactNode and adding to it a title and a close button
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center flex-1 w-full h-full lg:h-full lg:w-90 bg-gray-950 lg:static lg:inset-auto">
      <div
        aria-label="current opened menu"
        className="z-50 flex flex-col flex-1 w-screen h-full max-h-full px-3 border-gray-900 lg:w-full border-t-1 border-l-1 bg-gray-950"
      >
        <div
          className="flex items-center justify-between pt-2 mb-3 border-gray-900 border-b-1 text-md rounded-t-md hover:cursor-pointer group"
          onClick={onClose}
        >
          <h2
            aria-label="menu title"
            className="pt-4.75 pb-5.75 pl-1 text-lg font-bold text-gray-100 "
          >
            {title}
          </h2>
          <button
            aria-label="close menu button"
            className="px-1 py-1 rounded-sm cursor-pointer group-hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-200" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
