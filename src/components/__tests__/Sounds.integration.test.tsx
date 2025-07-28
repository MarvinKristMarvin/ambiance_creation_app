// **tests**/Sounds.integration.test.tsx
import { render, screen } from "@testing-library/react";
import Sounds from "@/components/Sounds";
import { useGlobalStore } from "@/stores/useGlobalStore";
import type { Ambiance, AmbianceSound, Sound } from "@/types";

// Mock SimpleSound component to avoid Tone.js dependency
jest.mock("@/components/SimpleSound", () => {
  return function MockSimpleSound({
    soundName,
    id,
  }: {
    soundName: string;
    id: number;
  }) {
    return <div data-testid={`simple-sound-${id}`}>{soundName}</div>;
  };
});

// Mock Zustand store
jest.mock("@/stores/useGlobalStore", () => ({
  useGlobalStore: jest.fn(),
}));

const mockUseGlobalStore = useGlobalStore as unknown as jest.MockedFunction<
  typeof useGlobalStore
>;

describe("Sounds Component - Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all SimpleSound components based on ambiance_sounds and soundsUsed", () => {
    const mockAmbiance: Ambiance = {
      id: 1,
      ambiance_name: "Test Ambiance",
      author_id: "test-author",
      ambiance_sounds: [
        {
          id: 101,
          sound_id: 1,
          volume: 50,
          reverb: 20,
          reverb_duration: 3,
          speed: 1,
          direction: 30,
          repeat_delay: [3, 7],
          low: 0,
          mid: 0,
          high: 0,
          low_cut: 1000,
          high_cut: 10000,
        },
        {
          id: 102,
          sound_id: 2,
          volume: 40,
          reverb: 10,
          reverb_duration: 2,
          speed: 1,
          direction: 70,
          repeat_delay: [5, 10],
          low: 1,
          mid: 1,
          high: 1,
          low_cut: 800,
          high_cut: 12000,
        },
      ] as AmbianceSound[],
    };

    const mockSoundsUsed: Sound[] = [
      {
        id: 1,
        sound_name: "Rain",
        image_path: "/images/rain.jpg",
        audio_paths: ["/sounds/rain.mp3"],
        looping: true,
        volume: 50,
        reverb: 20,
        reverb_duration: 3,
        speed: 1,
        direction: 30,
        category: "Weather",
        repeat_delay: [3, 7],
      },
      {
        id: 2,
        sound_name: "Wind",
        image_path: "/images/wind.jpg",
        audio_paths: ["/sounds/wind.mp3"],
        looping: false,
        volume: 40,
        reverb: 10,
        reverb_duration: 2,
        speed: 1,
        direction: 70,
        category: "Weather",
        repeat_delay: [5, 10],
      },
    ];

    mockUseGlobalStore.mockImplementation((selector) =>
      selector({
        soundsCentering: "Center",
        setSoundsCentering: jest.fn(),
        currentAmbiance: mockAmbiance,
        setCurrentAmbiance: jest.fn(),
        soundsUsed: mockSoundsUsed,
        setSoundsUsed: jest.fn(),
        globalVolume: 0.5,
        setGlobalVolume: jest.fn(),
        searchSoundsMenu: false,
        setSearchSoundsMenu: jest.fn(),
        settingsMenu: false,
        setSettingsMenu: jest.fn(),
        searchAmbianceMenu: false,
        setSearchAmbianceMenu: jest.fn(),
        ambianceSettingsMenu: false,
        setAmbianceSettingsMenu: jest.fn(),
        searchedSoundsBasicInformations: [],
        setSearchedSoundsBasicInformations: jest.fn(),
        searchedAmbiancesBasicInformations: [],
        setSearchedAmbiancesBasicInformations: jest.fn(),
        toasts: [],
        showToast: jest.fn(),
        removeToast: jest.fn(),
        clearAllToasts: jest.fn(),
        openSettingsMenu: jest.fn(),
        openSearchSoundsMenu: jest.fn(),
        openSearchAmbianceMenu: jest.fn(),
        openAmbianceSettingsMenu: jest.fn(),
        closeAllModals: jest.fn(),
        refreshSearchAmbianceMenu: false,
        setRefreshSearchAmbianceMenu: jest.fn(),
      })
    );

    render(<Sounds />);

    expect(
      screen.getByLabelText("my ambiance sounds container")
    ).toBeInTheDocument();
    expect(screen.getByText("Rain")).toBeInTheDocument();
    expect(screen.getByText("Wind")).toBeInTheDocument();

    // Button should NOT appear
    expect(
      screen.queryByLabelText("add your first sound button")
    ).not.toBeInTheDocument();
  });

  it("shows 'add your first sound' button when no ambiance_sounds", () => {
    const mockAmbiance: Ambiance = {
      id: 1,
      ambiance_name: "Empty Ambiance",
      author_id: "test-author",
      ambiance_sounds: [],
    };

    mockUseGlobalStore.mockImplementation((selector) =>
      selector({
        soundsCentering: "Center",
        setSoundsCentering: jest.fn(),
        currentAmbiance: mockAmbiance,
        setCurrentAmbiance: jest.fn(),
        soundsUsed: [],
        setSoundsUsed: jest.fn(),
        globalVolume: 0.5,
        setGlobalVolume: jest.fn(),
        searchSoundsMenu: false,
        setSearchSoundsMenu: jest.fn(),
        settingsMenu: false,
        setSettingsMenu: jest.fn(),
        searchAmbianceMenu: false,
        setSearchAmbianceMenu: jest.fn(),
        ambianceSettingsMenu: false,
        setAmbianceSettingsMenu: jest.fn(),
        searchedSoundsBasicInformations: [],
        setSearchedSoundsBasicInformations: jest.fn(),
        searchedAmbiancesBasicInformations: [],
        setSearchedAmbiancesBasicInformations: jest.fn(),
        toasts: [],
        showToast: jest.fn(),
        removeToast: jest.fn(),
        clearAllToasts: jest.fn(),
        openSettingsMenu: jest.fn(),
        openSearchSoundsMenu: jest.fn(),
        openSearchAmbianceMenu: jest.fn(),
        openAmbianceSettingsMenu: jest.fn(),
        closeAllModals: jest.fn(),
        refreshSearchAmbianceMenu: false,
        setRefreshSearchAmbianceMenu: jest.fn(),
      })
    );

    render(<Sounds />);

    expect(
      screen.getByLabelText("add your first sound button")
    ).toBeInTheDocument();
  });

  it("renders nothing when currentAmbiance is null", () => {
    mockUseGlobalStore.mockImplementation((selector) =>
      selector({
        soundsCentering: "Center",
        setSoundsCentering: jest.fn(),
        currentAmbiance: null,
        setCurrentAmbiance: jest.fn(),
        soundsUsed: [],
        setSoundsUsed: jest.fn(),
        globalVolume: 0.5,
        setGlobalVolume: jest.fn(),
        searchSoundsMenu: false,
        setSearchSoundsMenu: jest.fn(),
        settingsMenu: false,
        setSettingsMenu: jest.fn(),
        searchAmbianceMenu: false,
        setSearchAmbianceMenu: jest.fn(),
        ambianceSettingsMenu: false,
        setAmbianceSettingsMenu: jest.fn(),
        searchedSoundsBasicInformations: [],
        setSearchedSoundsBasicInformations: jest.fn(),
        searchedAmbiancesBasicInformations: [],
        setSearchedAmbiancesBasicInformations: jest.fn(),
        toasts: [],
        showToast: jest.fn(),
        removeToast: jest.fn(),
        clearAllToasts: jest.fn(),
        openSettingsMenu: jest.fn(),
        openSearchSoundsMenu: jest.fn(),
        openSearchAmbianceMenu: jest.fn(),
        openAmbianceSettingsMenu: jest.fn(),
        closeAllModals: jest.fn(),
        refreshSearchAmbianceMenu: false,
        setRefreshSearchAmbianceMenu: jest.fn(),
      })
    );

    const { container } = render(<Sounds />);
    expect(container).toBeEmptyDOMElement();
  });
});
