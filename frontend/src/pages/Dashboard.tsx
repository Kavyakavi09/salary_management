import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchMetricsByCountry,
  fetchMetricsByJobTitle,
} from "../services/analyticsService";
import { fetchEmployees } from "../services/employeeService";
import { fetchCountries } from "../services/lookupService";
import { calculateByEmployeeId } from "../services/salaryCalcService";
import type { CountryMetric, JobTitleMetric } from "../types/analytics";
import type { Employee } from "../types/employee";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";
import { getInitials } from "../utils/initials";

const CHART_COLORS = ["#2563eb", "#0ea5e9", "#14b8a6", "#f59e0b", "#6366f1"];

const Dashboard = () => {
  const [byCountry, setByCountry] = useState<CountryMetric[]>([]);
  const [byJobTitle, setByJobTitle] = useState<JobTitleMetric[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [tableSearch, setTableSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [calcId, setCalcId] = useState("EMP001");
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResult, setCalcResult] = useState<{
    gross: string;
    deduction: string;
    net: string;
    tdsRate: string;
    currencyCode: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [countryRows, jobRows, employeePage, countries] = await Promise.all([
          fetchMetricsByCountry(),
          fetchMetricsByJobTitle(),
          fetchEmployees({ page: 1, limit: 5 }),
          fetchCountries(),
        ]);
        if (!active) return;
        setByCountry(countryRows);
        setByJobTitle(jobRows);
        setEmployees(employeePage.data);
        setEmployeeTotal(employeePage.meta.total);
        setCountryCount(countries.length);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load dashboard"));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (row) =>
        row.fullName.toLowerCase().includes(q) ||
        row.jobTitle.toLowerCase().includes(q) ||
        row.employeeCode.toLowerCase().includes(q)
    );
  }, [employees, tableSearch]);

  const countryChart = useMemo(
    () =>
      byCountry.map((row) => ({
        name: row.country,
        label: `${row.country} (${row.currencyCode})`,
        average: Number(row.average),
        employees: row.employeeCount,
        currencyCode: row.currencyCode,
        payPeriod: row.payPeriod,
      })),
    [byCountry]
  );

  const jobChart = useMemo(
    () =>
      byJobTitle.slice(0, 6).map((row) => ({
        name: row.jobTitle,
        label: `${row.jobTitle} (${row.currencyCode})`,
        average: Number(row.average),
        employees: row.employeeCount,
        currencyCode: row.currencyCode,
      })),
    [byJobTitle]
  );

  const headline = useMemo(() => {
    const monthly = byCountry.filter((row) => row.payPeriod === "monthly");
    const pool = monthly.length > 0 ? monthly : byCountry;
    if (pool.length === 0) {
      return { avgLabel: "—", avgSub: "No current salaries", payroll: "—" };
    }

    const dominant = [...pool].sort(
      (a, b) => b.employeeCount - a.employeeCount
    )[0];

    const sameCurrency = pool.filter(
      (row) => row.currencyCode === dominant.currencyCode
    );
    const totalPeople = sameCurrency.reduce(
      (sum, row) => sum + row.employeeCount,
      0
    );
    const weightedAvg =
      sameCurrency.reduce(
        (sum, row) => sum + Number(row.average) * row.employeeCount,
        0
      ) / totalPeople;

    const payroll = sameCurrency.reduce(
      (sum, row) =>
        sum +
        Number(row.average) *
          row.employeeCount *
          (row.payPeriod === "monthly" ? 12 : 1),
      0
    );

    return {
      avgLabel: formatMoney(weightedAvg, dominant.currencyCode, { compact: true }),
      avgSub: `${dominant.currencyCode} · ${dominant.payPeriod}`,
      payroll: formatMoney(payroll, dominant.currencyCode, { compact: true }),
    };
  }, [byCountry]);

  const insights = useMemo(() => {
    const items: string[] = [];
    if (byJobTitle.length > 0) {
      const top = [...byJobTitle].sort(
        (a, b) => Number(b.average) - Number(a.average)
      )[0];
      items.push(
        `${top.jobTitle} leads average pay at ${formatMoney(
          top.average,
          top.currencyCode
        )}.`
      );
    }
    if (byCountry.length > 0) {
      const topCountry = [...byCountry].sort(
        (a, b) => b.employeeCount - a.employeeCount
      )[0];
      items.push(
        `${topCountry.country} has the largest paid cohort (${topCountry.employeeCount}).`
      );
    }
    const headcount = byCountry.reduce((sum, row) => sum + row.employeeCount, 0);
    if (headcount > 0) {
      items.push(`${headcount} active salaries power these charts.`);
    }
    if (items.length === 0) {
      items.push("Add employees and joining salaries to unlock insights.");
    }
    return items.slice(0, 3);
  }, [byCountry, byJobTitle]);

  const onCalculate = async (event: FormEvent) => {
    event.preventDefault();
    setCalcLoading(true);
    setCalcError("");
    setCalcResult(null);
    try {
      const list = await fetchEmployees({
        search: calcId.trim(),
        page: 1,
        limit: 5,
      });
      const match =
        list.data.find(
          (row) =>
            row.employeeCode.toLowerCase() === calcId.trim().toLowerCase()
        ) || list.data[0];

      if (!match) {
        throw new Error("Employee not found");
      }

      const result = await calculateByEmployeeId(match.id);
      setCalcResult({
        gross: result.gross,
        deduction: result.deduction,
        net: result.net,
        tdsRate: result.tdsRate,
        currencyCode: result.currencyCode,
      });
    } catch (err) {
      setCalcError(getApiErrorMessage(err, "Unable to calculate salary"));
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <section className="dash-page">
      <header className="dash-page-header">
        <div>
          <h1>Salary Management Dashboard</h1>
          <p>Manage employee salaries and get insights across your organization.</p>
        </div>
        <button type="button" className="dash-chip" disabled>
          Current salaries
        </button>
      </header>

      {error ? (
        <p className="banner-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="page-muted">Loading dashboard…</p> : null}

      {!loading && !error ? (
        <div className="dash-layout">
          <div className="dash-primary">
            <div className="stat-grid">
              <article className="stat-card">
                <div className="stat-icon blue" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Zm-8 1c-.29 0-.62.02-.97.05A5.79 5.79 0 0 0 2 19v2h6v-2c0-.7.18-2.18 2.03-3.4-.66-.1-1.35-.15-2.03-.15Z" />
                  </svg>
                </div>
                <div>
                  <p>Total Employees</p>
                  <strong>{employeeTotal.toLocaleString()}</strong>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon green" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15.9V19h-2v-1.1A4 4 0 0 1 8 15l1.6-1.2A2.2 2.2 0 0 0 11 15h2a1 1 0 0 0 0-2h-2a3 3 0 0 1 0-6V5h2v1.1A4 4 0 0 1 16 9l-1.6 1.2A2.2 2.2 0 0 0 13 9h-2a1 1 0 0 0 0 2h2a3 3 0 0 1 0 6Z" />
                  </svg>
                </div>
                <div>
                  <p>Avg Salary</p>
                  <strong>{headline.avgLabel}</strong>
                  <span>{headline.avgSub}</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon violet" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.9 9h-3.2a15.5 15.5 0 0 0-1.3-5 8 8 0 0 1 4.5 5ZM12 4c.9 0 2.4 2.2 3.1 7H8.9C9.6 6.2 11.1 4 12 4ZM4.1 13h3.2a15.5 15.5 0 0 0 1.3 5 8 8 0 0 1-4.5-5Zm3.2-2H4.1a8 8 0 0 1 4.5-5 15.5 15.5 0 0 0-1.3 5Zm1.6 0h6.2c-.7 4.8-2.2 7-3.1 7s-2.4-2.2-3.1-7Zm6.7 7a15.5 15.5 0 0 0 1.3-5h3.2a8 8 0 0 1-4.5 5Z" />
                  </svg>
                </div>
                <div>
                  <p>Countries</p>
                  <strong>{countryCount}</strong>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon orange" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M3 5h18v4H3V5Zm0 6h18v8H3v-8Zm2 2v4h4v-4H5Zm6 0v4h8v-4h-8Z" />
                  </svg>
                </div>
                <div>
                  <p>Est. Annual Payroll</p>
                  <strong>{headline.payroll}</strong>
                  <span>Largest currency cohort</span>
                </div>
              </article>
            </div>

            <div className="insight-grid">
              <article className="dash-card chart-card">
                <header className="chart-header">
                  <div>
                    <h2>Average pay by country</h2>
                    <p>Grouped safely by currency and pay period</p>
                  </div>
                </header>
                {countryChart.length === 0 ? (
                  <p className="page-muted">No country salary data yet.</p>
                ) : (
                  <div className="chart-frame">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={countryChart}
                        margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={56}
                          tickFormatter={(value) =>
                            Number(value) >= 1000
                              ? `${Math.round(Number(value) / 1000)}k`
                              : String(value)
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                          }}
                          formatter={(value, _name, item) => {
                            const payload = item?.payload as {
                              currencyCode?: string;
                              payPeriod?: string;
                            };
                            return [
                              formatMoney(
                                typeof value === "number" ? value : 0,
                                payload?.currencyCode
                              ),
                              `Avg (${payload?.payPeriod || "pay"})`,
                            ];
                          }}
                        />
                        <Bar dataKey="average" radius={[10, 10, 0, 0]} maxBarSize={48}>
                          {countryChart.map((entry, index) => (
                            <Cell
                              key={`${entry.label}-${entry.payPeriod}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              <article className="dash-card">
                <header className="chart-header">
                  <div>
                    <h2>Key Insights</h2>
                    <p>Auto-generated from current salaries</p>
                  </div>
                </header>
                <ul className="insight-list">
                  {insights.map((item) => (
                    <li key={item}>
                      <span className="insight-dot" aria-hidden="true" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="dash-card chart-card">
              <header className="chart-header">
                <div>
                  <h2>Average pay by job title</h2>
                  <p>Top roles in the current salary set</p>
                </div>
              </header>
              {jobChart.length === 0 ? (
                <p className="page-muted">No job-title metrics yet.</p>
              ) : (
                <div className="chart-frame tall">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      layout="vertical"
                      data={jobChart}
                      margin={{ top: 8, right: 16, left: 24, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fill: "#334155", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(14, 165, 233, 0.06)" }}
                        formatter={(value, _name, item) => {
                          const payload = item?.payload as {
                            currencyCode?: string;
                          };
                          return [
                            formatMoney(
                              typeof value === "number" ? value : 0,
                              payload?.currencyCode
                            ),
                            "Average",
                          ];
                        }}
                      />
                      <Bar dataKey="average" fill="#0ea5e9" radius={[0, 10, 10, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>

            <article className="dash-card">
              <header className="table-toolbar">
                <h2>Employee List</h2>
                <div className="table-tools">
                  <input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search employees..."
                    aria-label="Filter employee preview"
                  />
                  <Link to="/employees" className="btn-ghost">
                    Open directory
                  </Link>
                </div>
              </header>

              <div className="table-wrap">
                <table className="data-table dash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job Title</th>
                      <th>Department</th>
                      <th>Country</th>
                      <th>Current Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="page-muted">
                          No employees to preview.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="name-cell">
                              <span className="dash-avatar sm">
                                {getInitials(row.fullName)}
                              </span>
                              <div>
                                <strong>{row.fullName}</strong>
                                <span>{row.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{row.jobTitle}</td>
                          <td>{row.department?.name || "—"}</td>
                          <td>{row.country?.name || "—"}</td>
                          <td>
                            {row.currentSalary
                              ? formatMoney(
                                  row.currentSalary.amount,
                                  row.currentSalary.currencyCode
                                )
                              : "—"}
                          </td>
                          <td>
                            <Link to={`/employees/${row.id}`} className="more-link">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <footer className="table-footer">
                <span>
                  Showing {filteredEmployees.length} of {employeeTotal} employees
                </span>
                <Link to="/employees">View all</Link>
              </footer>
            </article>
          </div>

          <aside className="dash-rail">
            <article className="dash-card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <Link to="/employees/new" className="btn-primary">
                  + Add Employee
                </Link>
                <Link to="/employees" className="btn-outline">
                  Update Salary
                </Link>
                <a href="#calc" className="btn-outline">
                  Salary Calculator
                </a>
                <Link to="/departments" className="btn-outline">
                  Manage Departments
                </Link>
              </div>
            </article>

            <article className="dash-card" id="calc">
              <h2>Salary Calculator</h2>
              <form className="calc-form" onSubmit={onCalculate}>
                <label>
                  <span>Employee Code</span>
                  <input
                    value={calcId}
                    onChange={(e) => setCalcId(e.target.value)}
                    placeholder="EMP001"
                    required
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={calcLoading}>
                  {calcLoading ? "Calculating…" : "Calculate"}
                </button>
              </form>

              {calcError ? (
                <p className="banner-error" role="alert">
                  {calcError}
                </p>
              ) : null}

              {calcResult ? (
                <div className="calc-result">
                  <div>
                    <span>Gross Salary</span>
                    <strong>
                      {formatMoney(calcResult.gross, calcResult.currencyCode)}
                    </strong>
                  </div>
                  <div>
                    <span>
                      TDS {(Number(calcResult.tdsRate) * 100).toFixed(0)}%
                    </span>
                    <strong>
                      {formatMoney(calcResult.deduction, calcResult.currencyCode)}
                    </strong>
                  </div>
                  <div className="net">
                    <span>Net Salary</span>
                    <strong>
                      {formatMoney(calcResult.net, calcResult.currencyCode)}
                    </strong>
                  </div>
                </div>
              ) : null}
            </article>
          </aside>
        </div>
      ) : null}
    </section>
  );
};

export default Dashboard;
