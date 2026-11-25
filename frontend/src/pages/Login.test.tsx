import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Login from "./Login";

const navigateMock = vi.fn();

vi.mock("../services/authService", () => ({
  loginRequest: vi.fn(),
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

import { loginRequest } from "../services/authService";

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders branded sign-in form", () => {
    renderWithProviders(<Login />, { route: "/login" });

    expect(screen.getByText("ACME Salary")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("signs in and navigates to dashboard", async () => {
    const user = userEvent.setup();
    vi.mocked(loginRequest).mockResolvedValue({
      success: true,
      message: "Login successfully",
      token: "jwt-token",
      data: {
        id: "1",
        name: "ACME HR",
        email: "hr@acme.com",
        role: "hr_admin",
      },
    });

    const { store } = renderWithProviders(<Login />, { route: "/login" });

    await user.type(screen.getByPlaceholderText("hr@acme.com"), "hr@acme.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginRequest).toHaveBeenCalledWith("hr@acme.com", "Password123!");
      expect(store.getState().auth.token).toBe("jwt-token");
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows API error on failed login", async () => {
    const user = userEvent.setup();
    vi.mocked(loginRequest).mockRejectedValue(new Error("Invalid credentials"));

    renderWithProviders(<Login />, { route: "/login" });

    await user.type(screen.getByPlaceholderText("hr@acme.com"), "bad@acme.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials"
    );
  });

  it("shows success banner after registration redirect", () => {
    renderWithProviders(<Login />, {
      route: "/login",
      routeState: { registered: true },
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Account created. Sign in to continue."
    );
  });
});
