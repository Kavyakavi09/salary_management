import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { loginRequest } from "../services/authService";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { getApiErrorMessage } from "../utils/apiError";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginRequest(email.trim(), password);
      dispatch(
        setCredentials({
          token: result.token,
          user: result.data,
        })
      );
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage employees, salaries, and pay metrics."
      footer={
        <>
          New to ACME HR?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {registered ? (
          <p className="auth-success" role="status">
            Account created. Sign in to continue.
          </p>
        ) : null}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hr@acme.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
        </label>

        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
