import { buildQueryString } from "@/lib/buildQueryString";
import type { Category, Theme } from "@/lib/iconMappings";

describe("buildQueryString", () => {
  it("returns empty string when no parameters are provided", () => {
    const result = buildQueryString("", null, []);
    expect(result).toBe("");
  });

  it("builds query string with search term only", () => {
    const result = buildQueryString("rain sounds", null, []);
    expect(result).toBe("search=rain+sounds");
  });

  it("trims whitespace from search string", () => {
    const result = buildQueryString("  rain sounds  ", null, []);
    expect(result).toBe("search=rain+sounds");
  });

  it("ignores empty search string after trimming", () => {
    const result = buildQueryString("   ", null, []);
    expect(result).toBe("");
  });

  it("builds query string with category only", () => {
    const result = buildQueryString("", "Nature", []);
    expect(result).toBe("category=Nature");
  });

  it("builds query string with single theme only", () => {
    const result = buildQueryString("", null, ["Mysterious"]);
    expect(result).toBe("theme=Mysterious");
  });

  it("builds query string with multiple themes", () => {
    const result = buildQueryString("", null, [
      "Mysterious",
      "Aquatic",
      "Night",
    ]);
    expect(result).toBe("theme=Mysterious&theme=Aquatic&theme=Night");
  });

  it("builds query string with search and category", () => {
    const result = buildQueryString("ocean", "Nature", []);
    expect(result).toBe("search=ocean&category=Nature");
  });

  it("builds query string with search and themes", () => {
    const result = buildQueryString("forest", null, ["Mysterious", "Fantasy"]);
    expect(result).toBe("search=forest&theme=Mysterious&theme=Fantasy");
  });

  it("builds query string with category and themes", () => {
    const result = buildQueryString("", "Animals", ["Bird", "Insect"]);
    expect(result).toBe("category=Animals&theme=Bird&theme=Insect");
  });

  it("builds complete query string with all parameters", () => {
    const result = buildQueryString("ambient music", "Music", [
      "Ethereal",
      "Fantasy",
    ]);
    expect(result).toBe(
      "search=ambient+music&category=Music&theme=Ethereal&theme=Fantasy"
    );
  });

  it("handles special characters in search string", () => {
    const result = buildQueryString("rain & thunder", "Nature", []);
    expect(result).toBe("search=rain+%26+thunder&category=Nature");
  });

  it("handles all category types", () => {
    const categories: Category[] = ["Nature", "Animals", "Human", "Music"];

    categories.forEach((category) => {
      const result = buildQueryString("", category, []);
      expect(result).toBe(`category=${category}`);
    });
  });

  it("handles all theme types", () => {
    const themes: Theme[] = [
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
    ];

    themes.forEach((theme) => {
      const result = buildQueryString("", null, [theme]);
      expect(result).toBe(`theme=${theme}`);
    });
  });
});
