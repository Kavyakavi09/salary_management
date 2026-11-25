import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Employees from "./Employees";

vi.mock("../services/employeeService", () => ({
  fetchEmployees: vi.fn(),
  deleteEmployee: vi.fn(),
}));

vi.mock("../services/lookupService", () => ({
  fetchDepartments: vi.fn(),
  fetchCountries: vi.fn(),
}));

import { deleteEmployee, fetchEmployees } from "../services/employeeService";
import { fetchCountries, fetchDepartments } from "../services/lookupService";

describe("Employees page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchDepartments).mockResolvedValue([
      { id: 1, name: "Engineering", createdAt: "2024-01-01" },
    ]);
    vi.mocked(fetchCountries).mockResolvedValue([
      {
        id: 1,
        name: "India",
        currencyCode: "INR",
        tdsRate: "0.2",
        createdAt: "2024-01-01",
      },
    ]);
  });

  it("lists employees from the API", async () => {
    vi.mocked(fetchEmployees).mockResolvedValue({
      success: true,
      message: "ok",
      data: [
        {
          id: "e1",
          employeeCode: "EMP001",
          fullName: "Ada Lovelace",
          email: "ada@acme.com",
          jobTitle: "Engineer",
          departmentId: 1,
          department: { id: 1, name: "Engineering" },
          countryId: 1,
          country: {
            id: 1,
            name: "India",
            currencyCode: "INR",
            tdsRate: "0.2",
          },
          currentSalary: {
            id: "s1",
            amount: "50000",
            currencyCode: "INR",
            payPeriod: "monthly",
            effectiveFrom: "2024-01-15",
            changeType: "joining",
          },
          hireDate: "2024-01-15",
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15",
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<Employees />, { token: "jwt-token", route: "/employees" });

    expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("EMP001")).toBeInTheDocument();
  });

  it("debounces search so typing does not call the API every keystroke", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    vi.mocked(fetchEmployees).mockResolvedValue({
      success: true,
      message: "ok",
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<Employees />, { token: "jwt-token", route: "/employees" });

    await waitFor(() => {
      expect(fetchEmployees).toHaveBeenCalledTimes(1);
    });

    const input = screen.getByLabelText("Search employees");
    await user.type(input, "Ada");

    expect(fetchEmployees).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    await waitFor(() => {
      expect(fetchEmployees).toHaveBeenCalledTimes(2);
      expect(fetchEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "Ada", page: 1 })
      );
    });

    vi.useRealTimers();
  });

  it("soft-deletes an employee after confirm", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(fetchEmployees).mockResolvedValue({
      success: true,
      message: "ok",
      data: [
        {
          id: "e1",
          employeeCode: "EMP001",
          fullName: "Ada Lovelace",
          email: "ada@acme.com",
          jobTitle: "Engineer",
          departmentId: 1,
          department: { id: 1, name: "Engineering" },
          countryId: 1,
          country: {
            id: 1,
            name: "India",
            currencyCode: "INR",
            tdsRate: "0.2",
          },
          currentSalary: null,
          hireDate: "2024-01-15",
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15",
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    vi.mocked(deleteEmployee).mockResolvedValue({ id: "e1" });

    renderWithProviders(<Employees />, { token: "jwt-token", route: "/employees" });

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteEmployee).toHaveBeenCalledWith("e1");
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    });
  });
});
