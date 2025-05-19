"use client";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export default function Modal({ onClose, children, title }: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/80 ">
      <div className="relative w-full bg-gray-800 border-4 border-t-0 border-gray-800 rounded-md shadow-lg max-w-90">
        <div className="bg-gray-800 flex justify-between text-md items-center rounded-t-md py-0.5 px-0.5 border-y-2 border-gray-800 ">
          <h2 className="pl-2 font-bold text-gray-300 text-md">{title}</h2>
          <button
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
