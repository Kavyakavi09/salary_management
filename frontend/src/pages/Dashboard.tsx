import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchMetricsByCountry,
  fetchMetricsByJobTitle,
} from "../services/analyticsService";
import type { CountryMetric, JobTitleMetric } from "../types/analytics";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

const Dashboard = () => {
  const [byCountry, setByCountry] = useState<CountryMetric[]>([]);
  const [byJobTitle, setByJobTitle] = useState<JobTitleMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [countryRows, jobRows] = await Promise.all([
          fetchMetricsByCountry(),
          fetchMetricsByJobTitle(),
        ]);
        if (!active) return;
        setByCountry(countryRows);
        setByJobTitle(jobRows);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load salary metrics"));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const headcount = useMemo(
    () => byCountry.reduce((sum, row) => sum + row.employeeCount, 0),
    [byCountry]
  );

  const countryChart = useMemo(
    () =>
      byCountry.map((row) => ({
        label: `${row.country} · ${row.currencyCode}`,
        average: Number(row.average),
        employees: row.employeeCount,
        payPeriod: row.payPeriod,
      })),
    [byCountry]
  );

  const jobChart = useMemo(
    () =>
      byJobTitle.map((row) => ({
        label: `${row.jobTitle} · ${row.currencyCode}`,
        average: Number(row.average),
        employees: row.employeeCount,
      })),
    [byJobTitle]
  );

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">How the org pays</p>
          <h2>Dashboard</h2>
          <p className="page-subtitle">
            Current salary metrics by country and job title — currencies and pay
            periods stay separate.
          </p>
        </div>
      </header>

      {error ? (
        <p className="banner-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="page-muted">Loading metrics…</p> : null}

      {!loading && !error ? (
        <>
          <div className="metric-strip">
            <article className="metric-card">
              <p>People with current pay</p>
              <strong>{headcount}</strong>
            </article>
            <article className="metric-card">
              <p>Country buckets</p>
              <strong>{byCountry.length}</strong>
            </article>
            <article className="metric-card">
              <p>Job-title buckets</p>
              <strong>{byJobTitle.length}</strong>
            </article>
          </div>

          <div className="dashboard-grid">
            <article className="panel">
              <header className="panel-header">
                <h3>Average pay by country</h3>
                <p>Grouped by currency and pay period</p>
              </header>
              {countryChart.length === 0 ? (
                <p className="page-muted">No current salaries yet.</p>
              ) : (
                <div className="chart-frame">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={countryChart} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) =>
                          formatMoney(typeof value === "number" ? value : 0)
                        }
                      />
                      <Bar dataKey="average" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Currency</th>
                      <th>Period</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Avg</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCountry.map((row) => (
                      <tr key={`${row.countryId}-${row.currencyCode}-${row.payPeriod}`}>
                        <td>{row.country}</td>
                        <td>{row.currencyCode}</td>
                        <td>{row.payPeriod}</td>
                        <td>{formatMoney(row.min, row.currencyCode)}</td>
                        <td>{formatMoney(row.max, row.currencyCode)}</td>
                        <td>{formatMoney(row.average, row.currencyCode)}</td>
                        <td>{row.employeeCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel">
              <header className="panel-header">
                <h3>Average pay by job title</h3>
                <p>Same currency safety rules</p>
              </header>
              {jobChart.length === 0 ? (
                <p className="page-muted">No job-title metrics yet.</p>
              ) : (
                <div className="chart-frame">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={jobChart} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) =>
                          formatMoney(typeof value === "number" ? value : 0)
                        }
                      />
                      <Bar dataKey="average" fill="#0f766e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job title</th>
                      <th>Currency</th>
                      <th>Period</th>
                      <th>Avg</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byJobTitle.map((row) => (
                      <tr
                        key={`${row.jobTitle}-${row.currencyCode}-${row.payPeriod}`}
                      >
                        <td>{row.jobTitle}</td>
                        <td>{row.currencyCode}</td>
                        <td>{row.payPeriod}</td>
                        <td>{formatMoney(row.average, row.currencyCode)}</td>
                        <td>{row.employeeCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default Dashboard;
