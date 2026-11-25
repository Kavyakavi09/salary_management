import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { currentUserRequest } from "../services/authService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials, setCredentials } from "../store/slices/authSlice";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/employees", label: "Employees" },
  { to: "/departments", label: "Departments" },
  { to: "/countries", label: "Countries" },
];

const AppShell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

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

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <p className="app-eyebrow">ACME Corp</p>
          <h1>ACME Salary</h1>
        </div>

        <nav className="app-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "app-nav-link active" : "app-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-user">
          <div>
            <p className="app-user-name">{user?.name || "HR Manager"}</p>
            <p className="app-user-email">{user?.email || "Signed in"}</p>
          </div>
          <button type="button" className="app-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;
