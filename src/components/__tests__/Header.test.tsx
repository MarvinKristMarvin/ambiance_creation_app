import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../Header";
import { useGlobalStore } from "@/stores/useGlobalStore";

// Mock the global store
jest.mock("@/stores/useGlobalStore", () => ({
  useGlobalStore: jest.fn(),
}));

// Mock the AmbianceMenu component
jest.mock("../AmbianceMenu", () => {
  return function MockAmbianceMenu() {
    return <div data-testid="ambiance-menu">Ambiance Menu</div>;
  };
});

describe("Header Component", () => {
  const mockUseGlobalStore = useGlobalStore as jest.MockedFunction<
    typeof useGlobalStore
  >;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test("renders header with correct aria-label", () => {
    // Mock store to return no current ambiance
    mockUseGlobalStore.mockReturnValue(null);

    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("aria-label", "main header");
  });

  test("renders header without AmbianceMenu when no current ambiance", () => {
    // Mock store to return no current ambiance
    mockUseGlobalStore.mockReturnValue(null);

    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // AmbianceMenu should not be rendered
    expect(screen.queryByTestId("ambiance-menu")).not.toBeInTheDocument();
  });

  test("renders AmbianceMenu when current ambiance exists", () => {
    // Mock store to return a current ambiance
    mockUseGlobalStore.mockReturnValue({ name: "Test Ambiance" });

    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // AmbianceMenu should be rendered
    expect(screen.getByTestId("ambiance-menu")).toBeInTheDocument();
  });

  test("applies correct CSS classes", () => {
    mockUseGlobalStore.mockReturnValue(null);

    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "relative",
      "flex",
      "text-center",
      "justify-center"
    );
  });
});
