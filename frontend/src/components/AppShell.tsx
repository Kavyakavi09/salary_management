import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { currentUserRequest } from "../services/authService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials, setCredentials } from "../store/slices/authSlice";
import { getInitials } from "../utils/initials";

const navItems = [
  { to: "/", label: "Dashboard", end: true, icon: "grid" },
  { to: "/employees", label: "Employees", icon: "users" },
  { to: "/departments", label: "Departments", icon: "building" },
  { to: "/countries", label: "Countries", icon: "globe" },
];

const NavIcon = ({ name }: { name: string }) => {
  const icons: Record<string, string> = {
    grid: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z",
    users:
      "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Zm-8 1c-.29 0-.62.02-.97.05A5.79 5.79 0 0 0 2 19v2h6v-2c0-.7.18-2.18 2.03-3.4-.66-.1-1.35-.15-2.03-.15Z",
    building:
      "M4 21V3h10v6h6v12H4Zm2-2h2v-2H6v2Zm0-4h2v-2H6v2Zm0-4h2V9H6v2Zm0-4h2V5H6v2Zm4 12h2v-2h-2v2Zm0-4h2v-2h-2v2Zm0-4h2V9h-2v2Zm0-4h2V5h-2v2Zm4 12h2v-2h-2v2Zm0-4h2v-2h-2v2Z",
    globe:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.9 9h-3.2a15.5 15.5 0 0 0-1.3-5 8 8 0 0 1 4.5 5ZM12 4c.9 0 2.4 2.2 3.1 7H8.9C9.6 6.2 11.1 4 12 4ZM4.1 13h3.2a15.5 15.5 0 0 0 1.3 5 8 8 0 0 1-4.5-5Zm3.2-2H4.1a8 8 0 0 1 4.5-5 15.5 15.5 0 0 0-1.3 5Zm1.6 0h6.2c-.7 4.8-2.2 7-3.1 7s-2.4-2.2-3.1-7Zm6.7 7a15.5 15.5 0 0 0 1.3-5h3.2a8 8 0 0 1-4.5 5Z",
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={icons[name] || icons.grid} />
    </svg>
  );
};

const AppShell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token || user) return;

    let active = true;
    const hydrate = async () => {
      try {
        const result = await currentUserRequest();
        if (!active || !token) return;
        dispatch(setCredentials({ token, user: result.data }));
      } catch {
        if (!active) return;
        dispatch(clearCredentials());
        navigate("/login", { replace: true });
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [token, user, dispatch, navigate]);

  const onLogout = () => {
    dispatch(clearCredentials());
    navigate("/login", { replace: true });
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/employees?search=${encodeURIComponent(q)}` : "/employees");
  };

  const initials = getInitials(user?.name || "HR");

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.2 6.5 3.6v1.7L12 13.2 5.5 9.5V7.8L12 4.2Zm-6.5 7.3L12 15.3l6.5-3.8v5.1L12 20l-6.5-3.6v-5Z" />
            </svg>
          </span>
          <div>
            <strong>ACME</strong>
            <span>Salary</span>
          </div>
        </div>

        <nav className="dash-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "dash-nav-link active" : "dash-nav-link"
              }
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar-user">
          <div className="dash-avatar">{initials}</div>
          <div>
            <p>{user?.name || "HR Manager"}</p>
            <span>{user?.role || "hr_admin"}</span>
          </div>
          <button type="button" className="dash-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="dash-content">
        <header className="dash-topbar">
          <form className="dash-search" onSubmit={onSearch}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 2a8 8 0 1 0 5.3 14.1L20 20.8 18.8 22l-4.7-4.7A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 10 4Z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees, departments..."
              aria-label="Search"
            />
          </form>
          <div className="dash-top-actions">
            <button type="button" className="dash-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3.5a2 2 0 1 0-4 0v.8A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
              </svg>
            </button>
            <div className="dash-avatar sm">{initials}</div>
          </div>
        </header>

        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
