import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteEmployee, fetchEmployees } from "../services/employeeService";
import { fetchCountries, fetchDepartments } from "../services/lookupService";
import type { Employee } from "../types/employee";
import type { Country, Department } from "../types/lookups";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadLookups = async () => {
      try {
        const [deptRows, countryRows] = await Promise.all([
          fetchDepartments(),
          fetchCountries(),
        ]);
        if (!active) return;
        setDepartments(deptRows);
        setCountries(countryRows);
      } catch {
        // filters still usable without lookup labels
      }
    };
    void loadLookups();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchEmployees({
          search: search.trim() || undefined,
          departmentId: departmentId || undefined,
          countryId: countryId || undefined,
          jobTitle: jobTitle.trim() || undefined,
          page,
          limit: 10,
        });
        if (!active) return;
        setEmployees(result.data);
        setTotalPages(result.meta.totalPages);
        setTotal(result.meta.total);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load employees"));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [search, departmentId, countryId, jobTitle, page]);

  const onDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Soft-delete this employee? They will leave active lists."
    );
    if (!confirmed) return;

    setBusyId(id);
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((row) => row.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete employee"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page">
      <header className="page-header row">
        <div>
          <p className="page-eyebrow">Workforce</p>
          <h2>Employees</h2>
          <p className="page-subtitle">
            Search, filter, and manage ACME people records.
          </p>
        </div>
        <Link to="/employees/new" className="btn-primary">
          Add employee
        </Link>
      </header>

      <div className="filters">
        <input
          className="filter-input"
          placeholder="Search name, email, code"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="filter-input"
          value={departmentId}
          onChange={(e) => {
            setPage(1);
            setDepartmentId(e.target.value);
          }}
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          className="filter-input"
          value={countryId}
          onChange={(e) => {
            setPage(1);
            setCountryId(e.target.value);
          }}
        >
          <option value="">All countries</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        <input
          className="filter-input"
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => {
            setPage(1);
            setJobTitle(e.target.value);
          }}
        />
      </div>

      {error ? (
        <p className="banner-error" role="alert">
          {error}
        </p>
      ) : null}

      <article className="panel">
        <div className="panel-header row">
          <h3>Directory</h3>
          <p>{total} total</p>
        </div>

        {loading ? <p className="page-muted">Loading employees…</p> : null}

        {!loading ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Department</th>
                  <th>Country</th>
                  <th>Current pay</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="page-muted">
                      No employees match these filters.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.employeeCode}</td>
                      <td>
                        <div className="cell-stack">
                          <strong>{employee.fullName}</strong>
                          <span>{employee.email}</span>
                        </div>
                      </td>
                      <td>{employee.jobTitle}</td>
                      <td>{employee.department?.name || "—"}</td>
                      <td>{employee.country?.name || "—"}</td>
                      <td>
                        {employee.currentSalary
                          ? formatMoney(
                              employee.currentSalary.amount,
                              employee.currentSalary.currencyCode
                            )
                          : "No salary"}
                      </td>
                      <td>
                        <span className={`status-pill ${employee.status}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <Link to={`/employees/${employee.id}`}>View</Link>
                        <button
                          type="button"
                          className="link-danger"
                          disabled={busyId === employee.id}
                          onClick={() => void onDelete(employee.id)}
                        >
                          {busyId === employee.id ? "Removing…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="pagination">
          <button
            type="button"
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </article>
    </section>
  );
};

export default Employees;
