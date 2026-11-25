import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { registerRequest } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiError";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerRequest(name.trim(), email.trim(), password);
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create HR account"
      subtitle="Register to start managing ACME salary data."
      footer={
        <>
          Already have access?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label className="auth-field">
          <span>Full name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kavya Sharma"
            required
          />
        </label>

        <label className="auth-field">
          <span>Work email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@acme.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </label>

        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
