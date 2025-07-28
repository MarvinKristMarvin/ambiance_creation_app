import { Category, Theme } from "./iconMappings";

export const buildQueryString = (
  searchString: string,
  selectedCategory: Category | null,
  selectedThemes: Theme[]
): string => {
  const params = new URLSearchParams();

  if (searchString.trim()) {
    params.append("search", searchString.trim());
  }

  if (selectedCategory) {
    params.append("category", selectedCategory);
  }

  if (selectedThemes.length > 0) {
    selectedThemes.forEach((theme) => {
      params.append("theme", theme);
    });
  }

  return params.toString();
};
