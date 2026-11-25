import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createEmployee,
  fetchEmployee,
  updateEmployee,
} from "../services/employeeService";
import { fetchCountries, fetchDepartments } from "../services/lookupService";
import type { Country, Department } from "../types/lookups";
import { getApiErrorMessage } from "../utils/apiError";

const emptyForm = {
  employeeCode: "",
  fullName: "",
  email: "",
  jobTitle: "",
  departmentId: "",
  countryId: "",
  hireDate: "",
};

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [deptRows, countryRows] = await Promise.all([
          fetchDepartments(),
          fetchCountries(),
        ]);
        if (!active) return;
        setDepartments(deptRows);
        setCountries(countryRows);

        if (id) {
          const employee = await fetchEmployee(id);
          if (!active) return;
          setForm({
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            email: employee.email,
            jobTitle: employee.jobTitle,
            departmentId: String(employee.departmentId),
            countryId: String(employee.countryId),
            hireDate: employee.hireDate.slice(0, 10),
          });
        }
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load employee form"));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      employeeCode: form.employeeCode.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      jobTitle: form.jobTitle.trim(),
      departmentId: Number(form.departmentId),
      countryId: Number(form.countryId),
      hireDate: form.hireDate,
    };

    try {
      if (isEdit && id) {
        await updateEmployee(id, {
          fullName: payload.fullName,
          email: payload.email,
          jobTitle: payload.jobTitle,
          departmentId: payload.departmentId,
          countryId: payload.countryId,
          hireDate: payload.hireDate,
        });
        navigate(`/employees/${id}`);
      } else {
        const created = await createEmployee(payload);
        navigate(`/employees/${created.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save employee"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <p className="page-muted">Loading form…</p>
      </section>
    );
  }

  return (
    <section className="page narrow">
      <header className="page-header">
        <p className="page-eyebrow">Workforce</p>
        <h2>{isEdit ? "Edit employee" : "Add employee"}</h2>
        <p className="page-subtitle">
          Profile only — set joining salary from the employee detail page.
        </p>
      </header>

      <form className="panel form-grid" onSubmit={onSubmit}>
        {!isEdit ? (
          <label className="auth-field">
            <span>Employee code</span>
            <input
              required
              value={form.employeeCode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, employeeCode: e.target.value }))
              }
            />
          </label>
        ) : null}

        <label className="auth-field">
          <span>Full name</span>
          <input
            required
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </label>

        <label className="auth-field">
          <span>Job title</span>
          <input
            required
            value={form.jobTitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, jobTitle: e.target.value }))
            }
          />
        </label>

        <label className="auth-field">
          <span>Department</span>
          <select
            required
            value={form.departmentId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, departmentId: e.target.value }))
            }
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>Country</span>
          <select
            required
            value={form.countryId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, countryId: e.target.value }))
            }
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>Hire date</span>
          <input
            type="date"
            required
            value={form.hireDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hireDate: e.target.value }))
            }
          />
        </label>

        {error ? (
          <p className="banner-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          <Link to="/employees" className="btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create employee"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EmployeeForm;
