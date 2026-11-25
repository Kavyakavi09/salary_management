import { useEffect, useState, type FormEvent } from "react";
import api from "../services/api";
import type { ApiSuccess } from "../types/api";
import type { Country } from "../types/lookups";
import { getApiErrorMessage } from "../utils/apiError";

const Countries = () => {
  const [rows, setRows] = useState<Country[]>([]);
  const [form, setForm] = useState({
    name: "",
    currencyCode: "INR",
    tdsRate: "0.2",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<ApiSuccess<Country[]>>("/api/countries");
      setRows(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load countries"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/countries", {
        name: form.name.trim(),
        currencyCode: form.currencyCode.trim().toUpperCase(),
        tdsRate: Number(form.tdsRate),
      });
      setForm({ name: "", currencyCode: "INR", tdsRate: "0.2" });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create country"));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this country?");
    if (!confirmed) return;
    try {
      await api.delete(`/api/countries/${id}`);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete country"));
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Catalog</p>
        <h2>Countries</h2>
        <p className="page-subtitle">
          Currency + TDS rate drive net-pay calculation.
        </p>
      </header>

      <form className="panel inline-form wrap" onSubmit={onCreate}>
        <input
          className="filter-input"
          placeholder="Country name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          className="filter-input"
          placeholder="Currency"
          value={form.currencyCode}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, currencyCode: e.target.value }))
          }
          required
        />
        <input
          className="filter-input"
          placeholder="TDS rate (0-1)"
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={form.tdsRate}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, tdsRate: e.target.value }))
          }
          required
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add country"}
        </button>
      </form>

      {error ? (
        <p className="banner-error" role="alert">
          {error}
        </p>
      ) : null}

      <article className="panel">
        {loading ? <p className="page-muted">Loading…</p> : null}
        {!loading ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Currency</th>
                  <th>TDS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.currencyCode}</td>
                    <td>{row.tdsRate}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="link-danger"
                        onClick={() => void onDelete(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default Countries;
