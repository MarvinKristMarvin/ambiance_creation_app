// lib/iconMappings.tsx

import {
  Leaf,
  PawPrint,
  PersonStanding,
  Music,
  Ghost,
  Droplet,
  Moon,
  House,
  CloudDrizzle,
  Sparkles,
  BookOpen,
  Bug,
  Guitar,
  Bird,
  Zap,
} from "lucide-react";

// Categories and types
export const CATEGORIES = ["Nature", "Animals", "Human", "Music"] as const;

export type Category = (typeof CATEGORIES)[number];

// Themes and types
export const THEMES = [
  "Mysterious",
  "Aquatic",
  "Night",
  "House",
  "Ethereal",
  "Fantasy",
  "Elemental",
  "Insect",
  "Instrument",
  "Bird",
  "Action",
] as const;

export type Theme = (typeof THEMES)[number];

// Theme icon mapping with colors
export const getThemeIcon = (theme: Theme) => {
  const iconProps = { className: "w-4 h-4" };

  switch (theme) {
    case "Action":
      return <Zap {...iconProps} className="w-4 h-4 text-amber-400" />;
    case "Bird":
      return <Bird {...iconProps} className="w-4 h-4 text-sky-400" />;
    case "Instrument":
      return <Guitar {...iconProps} className="w-4 h-4 text-rose-400" />;
    case "Insect":
      return <Bug {...iconProps} className="w-4 h-4 text-lime-400" />;
    case "Fantasy":
      return <BookOpen {...iconProps} className="w-4 h-4 text-violet-400" />;
    case "Ethereal":
      return <Sparkles {...iconProps} className="w-4 h-4 text-pink-400" />;
    case "Elemental":
      return <CloudDrizzle {...iconProps} className="w-4 h-4 text-sky-400" />;
    case "Mysterious":
      return <Ghost {...iconProps} className="w-4 h-4 text-gray-400" />;
    case "Aquatic":
      return <Droplet {...iconProps} className="w-4 h-4 text-blue-400" />;
    case "Night":
      return <Moon {...iconProps} className="w-4 h-4 text-indigo-400" />;
    case "House":
      return <House {...iconProps} className="w-4 h-4 text-orange-200" />;
    default:
      return null;
  }
};

// Category icon mapping with colors
export const getCategoryIcon = (category: Category) => {
  const iconProps = { className: "w-4 h-4" };

  switch (category) {
    case "Nature":
      return <Leaf {...iconProps} className="w-4 h-4 text-green-400" />;
    case "Animals":
      return <PawPrint {...iconProps} className="w-4 h-4 text-amber-400" />;
    case "Human":
      return (
        <PersonStanding {...iconProps} className="w-4 h-4 text-orange-400" />
      );
    case "Music":
      return <Music {...iconProps} className="w-4 h-4 text-purple-400" />;
    default:
      return null;
  }
};
