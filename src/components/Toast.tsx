"use client";
import React, { useEffect, useState } from "react";
import {
  Star,
  FileText,
  Ghost,
  Check,
  AlertTriangle,
  X,
  Info,
  Music,
} from "lucide-react";
import { ToastType, ToastIcon } from "@/types";

interface ToastProps {
  id: string;
  type: ToastType;
  icon: ToastIcon;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  index: number;
  zIndex: number;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  icon,
  message,
  onClose,
  index,
  zIndex,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstantClose, setIsInstantClose] = useState(false);

  // Fade in immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto fade out 500ms before the store removes it
  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration - 500);

    return () => clearTimeout(fadeOutTimer);
  }, [duration]);

  // Instant close on click
  const handleClose = () => {
    setIsInstantClose(true);
    setIsVisible(false);
    // Remove immediately when clicked
    setTimeout(() => onClose(id), 50);
  };

  // Toast type configurations
  const typeConfigs = {
    success: {
      bgColor: "bg-green-800",
      borderColor: "border-green-800",
      iconBgColor: "bg-gray-950",
    },
    warning: {
      bgColor: "bg-yellow-800",
      borderColor: "border-yellow-800",
      iconBgColor: "bg-gray-950",
    },
    error: {
      bgColor: "bg-red-900",
      borderColor: "border-red-900",
      iconBgColor: "bg-gray-950",
    },
    info: {
      bgColor: "bg-blue-900",
      borderColor: "border-blue-900",
      iconBgColor: "bg-gray-950",
    },
  };

  // Icon configurations
  const iconConfigs = {
    star: {
      component: Star,
      color: "text-yellow-200",
      strokeWidth: 3,
      fill: true,
    },
    note: {
      component: FileText,
      color: "text-blue-200",
      strokeWidth: 2,
      fill: false,
    },
    music: {
      component: Music,
      color: "text-green-300",
      strokeWidth: 2,
      fill: false,
    },
    ghost: {
      component: Ghost,
      color: "text-purple-200",
      strokeWidth: 2,
      fill: true,
    },
    check: {
      component: Check,
      color: "text-green-200",
      strokeWidth: 3,
      fill: false,
    },
    warning: {
      component: AlertTriangle,
      color: "text-orange-200",
      strokeWidth: 2,
      fill: true,
    },
    error: {
      component: X,
      color: "text-red-200",
      strokeWidth: 2,
      fill: false,
    },
    info: {
      component: Info,
      color: "text-blue-200",
      strokeWidth: 2,
      fill: false,
    },
  };

  const toastConfig = typeConfigs[type];
  const iconConfig = iconConfigs[icon];
  const IconComponent = iconConfig.component;

  return (
    <div
      aria-label="toast"
      className={`
        fixed p-5 transform -translate-x-1/2 ${toastConfig.bgColor} rounded-sm
        left-1/2 w-[360px] hover:cursor-pointer z-50
        ${
          isInstantClose
            ? "transition-none"
            : "transition-all duration-500 ease-out"
        }
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        bottom: `${16 + index * 80}px`,
        zIndex: zIndex + 10,
      }}
      onClick={handleClose}
    >
      {/* Icon */}
      <div
        className={`
          absolute p-2 transform -translate-x-1/2 ${toastConfig.iconBgColor}
          ${toastConfig.borderColor} rounded-full border-6 -top-8.5 left-1/2
        `}
      >
        <IconComponent
          className={`w-6 h-6 ${iconConfig.color}`}
          strokeWidth={iconConfig.strokeWidth}
          fill={iconConfig.fill ? "currentColor" : "none"}
        />
      </div>
      {/* Message */}
      <p className="text-sm font-bold text-center text-gray-100">{message}</p>
    </div>
  );
};

export default Toast;
