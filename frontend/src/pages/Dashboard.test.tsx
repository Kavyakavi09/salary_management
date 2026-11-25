import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Dashboard from "./Dashboard";

vi.mock("../services/analyticsService", () => ({
  fetchMetricsByCountry: vi.fn(),
  fetchMetricsByJobTitle: vi.fn(),
}));

vi.mock("../services/employeeService", () => ({
  fetchEmployees: vi.fn(),
}));

vi.mock("../services/lookupService", () => ({
  fetchCountries: vi.fn(),
  fetchDepartments: vi.fn(),
}));

vi.mock("../services/salaryCalcService", () => ({
  calculateByEmployeeId: vi.fn(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  Cell: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

import {
  fetchMetricsByCountry,
  fetchMetricsByJobTitle,
} from "../services/analyticsService";
import { fetchEmployees } from "../services/employeeService";
import { fetchCountries } from "../services/lookupService";

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
    });
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

  it("renders mock-style dashboard with metrics and employee preview", async () => {
    vi.mocked(fetchMetricsByCountry).mockResolvedValue([
      {
        countryId: 1,
        country: "India",
        currencyCode: "INR",
        payPeriod: "monthly",
        min: "40000.00",
        max: "60000.00",
        average: "50000.00",
        employeeCount: 2,
      },
    ]);
    vi.mocked(fetchMetricsByJobTitle).mockResolvedValue([
      {
        jobTitle: "Engineer",
        currencyCode: "INR",
        payPeriod: "monthly",
        average: "50000.00",
        employeeCount: 2,
      },
    ]);

    renderWithProviders(<Dashboard />, { token: "jwt-token" });

    expect(
      screen.getByRole("heading", { name: "Salary Management Dashboard" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Total Employees")).toBeInTheDocument();
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Key Insights" })).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Average pay by country" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Average pay by job title" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Salary Calculator" })
      ).toBeInTheDocument();
      expect(screen.getAllByTestId("chart").length).toBeGreaterThan(0);
    });
  });
});
