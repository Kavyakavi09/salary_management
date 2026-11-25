import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Register from "./Register";

const navigateMock = vi.fn();

vi.mock("../services/authService", () => ({
  registerRequest: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { registerRequest } from "../services/authService";

describe("Register page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration form", () => {
    renderWithProviders(<Register />, { route: "/register" });

    expect(
      screen.getByRole("heading", { name: "Create HR account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
  });

  it("registers and redirects to login", async () => {
    const user = userEvent.setup();
    vi.mocked(registerRequest).mockResolvedValue({
      success: true,
      message: "User created",
      data: {
        id: "2",
        name: "Kavya",
        email: "kavya@acme.com",
        role: "hr_admin",
      },
    });

    renderWithProviders(<Register />, { route: "/register" });

    await user.type(screen.getByPlaceholderText("Kavya Sharma"), "Kavya");
    await user.type(screen.getByPlaceholderText("you@acme.com"), "kavya@acme.com");
    await user.type(
      screen.getByPlaceholderText("At least 8 characters"),
      "Password123!"
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalledWith(
        "Kavya",
        "kavya@acme.com",
        "Password123!"
      );
      expect(navigateMock).toHaveBeenCalledWith("/login", {
        replace: true,
        state: { registered: true },
      });
    });
  });

  it("shows API error on failed registration", async () => {
    const user = userEvent.setup();
    vi.mocked(registerRequest).mockRejectedValue(
      new Error("User with this email already exist")
    );

    renderWithProviders(<Register />, { route: "/register" });

    await user.type(screen.getByPlaceholderText("Kavya Sharma"), "Kavya");
    await user.type(screen.getByPlaceholderText("you@acme.com"), "hr@acme.com");
    await user.type(
      screen.getByPlaceholderText("At least 8 characters"),
      "Password123!"
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "User with this email already exist"
    );
  });
});
