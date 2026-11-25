import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import Dashboard from "./Dashboard";

vi.mock("../services/analyticsService", () => ({
  fetchMetricsByCountry: vi.fn(),
  fetchMetricsByJobTitle: vi.fn(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

import {
  fetchMetricsByCountry,
  fetchMetricsByJobTitle,
} from "../services/analyticsService";

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders salary metrics tables", async () => {
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

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("India")).toBeInTheDocument();
      expect(screen.getByText("Engineer")).toBeInTheDocument();
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    });
  });
});
