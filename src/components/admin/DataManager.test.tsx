import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => {
  const result = {
    collection: "projects",
    success: 2,
    skipped: 0,
    updated: 1,
    errors: 0,
    total: 3,
    details: ["Updated: Alpha", "Uploaded: Beta"],
  };
  return {
    firebaseEnabled: true,
    syncPortfolio: vi.fn(async () => [result]),
    syncCollection: vi.fn(async () => result),
    getCollectionCount: vi.fn(async () => 3),
    uploadAllData: vi.fn(async () => [result]),
  };
});

vi.mock("@/lib/firebase", () => ({
  get isFirebaseEnabled() {
    return mocks.firebaseEnabled;
  },
  get db() {
    return mocks.firebaseEnabled ? { __mock: "db" } : undefined;
  },
}));

vi.mock("@/utils/database-uploader", () => ({
  COLLECTIONS: {
    projects: "projects",
    experiences: "experiences",
    skills: "skills",
    testimonials: "testimonials",
    upcoming: "upcoming_projects",
    links: "links",
    settings: "settings",
  },
  DatabaseUploader: class {
    uploadAllData = mocks.uploadAllData;
    clearCollection = vi.fn();
    uploadCollection = vi.fn();
  },
  getCollectionCount: mocks.getCollectionCount,
  seedPortfolio: vi.fn(),
  clearAndSeed: vi.fn(),
  syncPortfolio: mocks.syncPortfolio,
  syncCollection: mocks.syncCollection,
  seedProjects: vi.fn(),
  seedExperience: vi.fn(),
  seedSkills: vi.fn(),
  seedTestimonials: vi.fn(),
  seedUpcoming: vi.fn(),
  seedLinks: vi.fn(),
}));

import { DataManager } from "@/components/admin/DataManager";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.firebaseEnabled = true;
  // Destructive actions ask for confirmation — accept them.
  vi.stubGlobal("confirm", vi.fn(() => true));
});

describe("DataManager (admin → Data Upload)", () => {
  it("lists every seed collection with its seed count", async () => {
    render(<DataManager />);

    expect((await screen.findAllByText("Projects")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Experience").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /seed all \(skip duplicates\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear all & reseed/i })).toBeInTheDocument();
  });

  it("Sync (update existing) rewrites existing records via syncPortfolio", async () => {
    const user = userEvent.setup();
    render(<DataManager />);

    await user.click(await screen.findByRole("button", { name: /sync \(update existing\)/i }));

    await waitFor(() => expect(mocks.syncPortfolio).toHaveBeenCalledTimes(1));
  });

  it("per-collection sync targets that collection by Firestore name", async () => {
    const user = userEvent.setup();
    render(<DataManager />);

    await user.click(
      screen.getByTitle("Update existing Projects records from the local seed data"),
    );

    await waitFor(() => expect(mocks.syncCollection).toHaveBeenCalledWith("projects"));
  });

  it("shows a configuration alert instead of controls when Firebase is unavailable", () => {
    mocks.firebaseEnabled = false;
    render(<DataManager />);

    expect(screen.getByText(/Firebase is not configured/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sync \(update existing\)/i })).toBeNull();
  });
});
