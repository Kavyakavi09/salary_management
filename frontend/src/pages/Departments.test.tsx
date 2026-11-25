import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Departments from "./Departments";

vi.mock("../services/departmentService", () => ({
  fetchDepartments: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
}));

import {
  createDepartment,
  fetchDepartments,
  updateDepartment,
} from "../services/departmentService";

describe("Departments page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchDepartments).mockResolvedValue([
      { id: 1, name: "Engineering", createdAt: "2024-01-01" },
    ]);
  });

  it("lists departments", async () => {
    renderWithProviders(<Departments />, {
      token: "jwt-token",
      route: "/departments",
    });

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
  });

  it("creates a department", async () => {
    const user = userEvent.setup();
    vi.mocked(createDepartment).mockResolvedValue({
      id: 2,
      name: "Finance",
      createdAt: "2024-01-02",
    });
    vi.mocked(fetchDepartments)
      .mockResolvedValueOnce([
        { id: 1, name: "Engineering", createdAt: "2024-01-01" },
      ])
      .mockResolvedValueOnce([
        { id: 1, name: "Engineering", createdAt: "2024-01-01" },
        { id: 2, name: "Finance", createdAt: "2024-01-02" },
      ]);

    renderWithProviders(<Departments />, {
      token: "jwt-token",
      route: "/departments",
    });

    await screen.findByText("Engineering");
    await user.type(
      screen.getByPlaceholderText("New department name"),
      "Finance"
    );
    await user.click(screen.getByRole("button", { name: "Add department" }));

    await waitFor(() => {
      expect(createDepartment).toHaveBeenCalledWith("Finance");
      expect(screen.getByText("Finance")).toBeInTheDocument();
    });
  });

  it("updates a department name", async () => {
    const user = userEvent.setup();
    vi.mocked(updateDepartment).mockResolvedValue({
      id: 1,
      name: "Platform",
      createdAt: "2024-01-01",
    });

    renderWithProviders(<Departments />, {
      token: "jwt-token",
      route: "/departments",
    });

    await screen.findByText("Engineering");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByLabelText("Department name");
    await user.clear(input);
    await user.type(input, "Platform");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateDepartment).toHaveBeenCalledWith(1, "Platform");
      expect(screen.getByText("Platform")).toBeInTheDocument();
    });
  });
});
