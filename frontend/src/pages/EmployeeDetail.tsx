import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteEmployee, fetchEmployee } from "../services/employeeService";
import api from "../services/api";
import type { Employee } from "../types/employee";
import type { ApiSuccess } from "../types/api";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

type SalaryRow = {
  id: string;
  amount: string;
  currencyCode: string;
  payPeriod: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  changeType: string;
  changeReason: string | null;
  isCurrent: boolean;
};

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salaries, setSalaries] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salaryError, setSalaryError] = useState("");
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    amount: "",
    currencyCode: "",
    payPeriod: "monthly",
    effectiveFrom: "",
    changeType: "joining",
    changeReason: "",
  });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [employeeRow, salaryRes] = await Promise.all([
        fetchEmployee(id),
        api.get<ApiSuccess<SalaryRow[]>>(`/api/employees/${id}/salaries`),
      ]);
      setEmployee(employeeRow);
      setSalaries(salaryRes.data.data);
      setSalaryForm((prev) => ({
        ...prev,
        currencyCode: employeeRow.country?.currencyCode || prev.currencyCode,
        changeType: salaryRes.data.data.some((row) => row.isCurrent)
          ? "hike"
          : "joining",
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load employee"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("Soft-delete this employee?");
    if (!confirmed) return;
    try {
      await deleteEmployee(id);
      navigate("/employees");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete employee"));
    }
  };

  const onSalarySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setSavingSalary(true);
    setSalaryError("");
    try {
      await api.post(`/api/employees/${id}/salary`, {
        amount: Number(salaryForm.amount),
        currencyCode: salaryForm.currencyCode || undefined,
        payPeriod: salaryForm.payPeriod,
        effectiveFrom: salaryForm.effectiveFrom,
        changeType: salaryForm.changeType,
        changeReason: salaryForm.changeReason || undefined,
      });
      await load();
      setSalaryForm((prev) => ({
        ...prev,
        amount: "",
        changeReason: "",
        changeType: "hike",
      }));
    } catch (err) {
      setSalaryError(getApiErrorMessage(err, "Unable to save salary"));
    } finally {
      setSavingSalary(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <p className="page-muted">Loading employee…</p>
      </section>
    );
  }

  if (!employee) {
    return (
      <section className="page">
        <p className="banner-error" role="alert">
          {error || "Employee not found"}
        </p>
        <Link to="/employees" className="btn-ghost">
          Back to employees
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-header row">
        <div>
          <p className="page-eyebrow">{employee.employeeCode}</p>
          <h2>{employee.fullName}</h2>
          <p className="page-subtitle">
            {employee.jobTitle} · {employee.department?.name} ·{" "}
            {employee.country?.name}
          </p>
        </div>
        <div className="row-actions">
          <Link to={`/employees/${employee.id}/edit`} className="btn-ghost">
            Edit
          </Link>
          <button type="button" className="btn-danger" onClick={() => void onDelete()}>
            Delete
          </button>
        </div>
      </header>

      {error ? (
        <p className="banner-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="dashboard-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Profile</h3>
          </header>
          <dl className="detail-list">
            <div>
              <dt>Email</dt>
              <dd>{employee.email}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status-pill ${employee.status}`}>
                  {employee.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>Hire date</dt>
              <dd>{employee.hireDate.slice(0, 10)}</dd>
            </div>
            <div>
              <dt>Current salary</dt>
              <dd>
                {employee.currentSalary
                  ? `${formatMoney(
                      employee.currentSalary.amount,
                      employee.currentSalary.currencyCode
                    )} (${employee.currentSalary.payPeriod})`
                  : "Not set"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Set / revise salary</h3>
            <p>Close-and-insert keeps full history</p>
          </header>
          <form className="form-grid" onSubmit={onSalarySubmit}>
            <label className="auth-field">
              <span>Amount</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={salaryForm.amount}
                onChange={(e) =>
                  setSalaryForm((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </label>
            <label className="auth-field">
              <span>Currency</span>
              <input
                value={salaryForm.currencyCode}
                onChange={(e) =>
                  setSalaryForm((prev) => ({
                    ...prev,
                    currencyCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder={employee.country?.currencyCode || "INR"}
              />
            </label>
            <label className="auth-field">
              <span>Pay period</span>
              <select
                value={salaryForm.payPeriod}
                onChange={(e) =>
                  setSalaryForm((prev) => ({
                    ...prev,
                    payPeriod: e.target.value,
                  }))
                }
              >
                <option value="monthly">monthly</option>
                <option value="annual">annual</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Effective from</span>
              <input
                required
                type="date"
                value={salaryForm.effectiveFrom}
                onChange={(e) =>
                  setSalaryForm((prev) => ({
                    ...prev,
                    effectiveFrom: e.target.value,
                  }))
                }
              />
            </label>
            <label className="auth-field">
              <span>Change type</span>
              <select
                value={salaryForm.changeType}
                onChange={(e) =>
                  setSalaryForm((prev) => ({
                    ...prev,
                    changeType: e.target.value,
                  }))
                }
              >
                <option value="joining">joining</option>
                <option value="hike">hike</option>
                <option value="correction">correction</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Reason</span>
              <input
                value={salaryForm.changeReason}
                onChange={(e) =>
                  setSalaryForm((prev) => ({
                    ...prev,
                    changeReason: e.target.value,
                  }))
                }
              />
            </label>
            {salaryError ? (
              <p className="banner-error" role="alert">
                {salaryError}
              </p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={savingSalary}>
              {savingSalary ? "Saving…" : "Save salary"}
            </button>
          </form>
        </article>
      </div>

      <article className="panel">
        <header className="panel-header">
          <h3>Salary history</h3>
        </header>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Period</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="page-muted">
                    No salary rows yet.
                  </td>
                </tr>
              ) : (
                salaries.map((row) => (
                  <tr key={row.id}>
                    <td>{formatMoney(row.amount, row.currencyCode)}</td>
                    <td>{row.payPeriod}</td>
                    <td>{String(row.effectiveFrom).slice(0, 10)}</td>
                    <td>
                      {row.effectiveTo
                        ? String(row.effectiveTo).slice(0, 10)
                        : "—"}
                    </td>
                    <td>{row.changeType}</td>
                    <td>{row.isCurrent ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default EmployeeDetail;
