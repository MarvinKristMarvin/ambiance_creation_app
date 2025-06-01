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
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/80 ">
      <div
        aria-label="modal window"
        className="relative w-full bg-gray-900 border-4 border-t-0 border-gray-900 rounded-md shadow-lg max-w-90"
      >
        <div className="bg-gray-900 flex justify-between text-md items-center rounded-t-md py-0.5 px-0.5 border-y-2 border-gray-900 ">
          <h2
            aria-label="modal title"
            className="pl-2 font-bold text-gray-300 text-md"
          >
            {title}
          </h2>
          <button
            aria-label="close modal button"
            onClick={onClose}
            className="px-2 py-2 rounded-sm cursor-pointer hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
