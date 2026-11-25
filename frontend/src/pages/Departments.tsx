import { useEffect, useState, type FormEvent } from "react";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../services/departmentService";
import type { Department } from "../types/lookups";
import { getApiErrorMessage } from "../utils/apiError";

const Departments = () => {
  const [rows, setRows] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchDepartments());
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load departments"));
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
      await createDepartment(name.trim());
      setName("");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create department"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: Department) => {
    setEditingId(row.id);
    setEditName(row.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const onUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId === null) return;

    setUpdating(true);
    setError("");
    try {
      const updated = await updateDepartment(editingId, editName.trim());
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
      cancelEdit();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update department"));
    } finally {
      setUpdating(false);
    }
  };

  const onDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this department?");
    if (!confirmed) return;
    try {
      await deleteDepartment(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete department"));
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Catalog</p>
        <h2>Departments</h2>
        <p className="page-subtitle">Keep org units tidy for employee assignment.</p>
      </header>

      <form className="panel inline-form" onSubmit={onCreate}>
        <input
          className="filter-input"
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add department"}
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
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="page-muted">
                      No departments yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {editingId === row.id ? (
                          <form className="inline-form" onSubmit={onUpdate}>
                            <input
                              className="filter-input"
                              aria-label="Department name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              required
                            />
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={updating}
                            >
                              {updating ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={cancelEdit}
                              disabled={updating}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          row.name
                        )}
                      </td>
                      <td className="row-actions">
                        {editingId === row.id ? null : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="link-danger"
                              onClick={() => void onDelete(row.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default Departments;
