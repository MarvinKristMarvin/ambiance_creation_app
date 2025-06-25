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
    <div className="z-10 flex items-center justify-center flex-1 h-full bg-black/80 w-90">
      <div
        aria-label="modal window"
        className="flex flex-col flex-1 w-full h-full max-h-screen bg-gray-800 border-8 border-t-0 border-gray-800"
      >
        <div
          className="flex items-center justify-between pt-2 mb-2 bg-gray-800 border-gray-700 text-md rounded-t-md "
          onClick={onClose}
        >
          <h2
            aria-label="modal title"
            className="pl-1 text-lg font-bold text-gray-100"
          >
            {title}
          </h2>
          <button
            aria-label="close modal button"
            className="px-1 py-1 rounded-sm cursor-pointer hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
