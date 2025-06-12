"use client";
import React from "react";
import Toast from "./Toast";
import { useGlobalStore } from "@/stores/useGlobalStore";

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalStore();

  return (
    <>
      {[...toasts].reverse().map((toast, index) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          icon={toast.icon}
          duration={toast.duration}
          message={toast.message}
          onClose={removeToast}
          index={index}
          zIndex={toasts.length - index} // ensures top toast is on top
        />
      ))}
    </>
  );
};

export default ToastContainer;
