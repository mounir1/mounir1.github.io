import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ toast: vi.fn() }));

// Firestore unavailable: the admin tab must say so, never fail silently.
vi.mock("@/lib/firebase", () => ({ db: undefined, isFirebaseEnabled: false }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  setDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

import { SkillsTab } from "@/components/admin/tabs/SkillsTab";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SkillsTab (admin write guards)", () => {
  it("renders the local skills when Firestore is unavailable", async () => {
    render(<SkillsTab />);

    expect((await screen.findAllByText("React")).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /add skill/i }).length).toBeGreaterThan(0);
  });

  it("toasts a destructive error instead of silently dropping the save", async () => {
    const user = userEvent.setup();
    render(<SkillsTab />);

    const [openButton] = await screen.findAllByRole("button", { name: /add skill/i });
    await user.click(openButton);

    const nameInput = await screen.findByPlaceholderText(/React, Python, Docker/i);
    await user.type(nameInput, "Vitest");

    const buttons = screen.getAllByRole("button", { name: /add skill/i });
    await user.click(buttons[buttons.length - 1]);

    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Firestore unavailable", variant: "destructive" }),
    );
  });
});
