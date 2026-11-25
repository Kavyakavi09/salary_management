type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => {
  return (
    <div className="auth-shell">
      <div className="auth-atmosphere" aria-hidden="true" />
      <div className="auth-grid">
        <section className="auth-brand animate-rise">
          <p className="auth-eyebrow">ACME Corp</p>
          <h1 className="auth-logo">ACME Salary</h1>
          <p className="auth-tagline">
            Pay clarity for HR — people, history, and what the org actually pays.
          </p>
        </section>

        <section className="auth-panel animate-rise-delay">
          <header className="auth-panel-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </header>
          {children}
          <footer className="auth-footer">{footer}</footer>
        </section>
      </div>
    </div>
  );
};

export default AuthShell;
