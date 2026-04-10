import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="hidden bg-[linear-gradient(135deg,#07111f_0%,#0f2239_48%,#0d1727_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/8 text-sm font-semibold tracking-[0.2em]">
            FP
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-brand">FinPulse</p>
          <h1 className="mt-6 max-w-xl text-6xl font-semibold leading-tight tracking-[-0.05em]">
            Central banking intelligence for personal wealth decisions.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
            A modern fintech workspace for investment timing, expense oversight, borrowing safety, and financial health monitoring.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Live portfolios", "Gold, stock, and crypto performance in one lens."],
            ["Trust-ranked loans", "Provider scoring weighted by reliability and rate."],
            ["Automated health", "Savings ratio and loan burden monitored continuously."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">{description}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6 dark:bg-ink">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate/78"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Secure access</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
            Access your command center and investment analytics.
          </p>
          <div className="mt-6 grid gap-4">
            <input name="email" type="email" placeholder="Email" onChange={onChange} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-brand" />
            <input name="password" type="password" placeholder="Password" onChange={onChange} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-brand" />
            {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-600 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}
            <button type="submit" disabled={submitting} className="rounded-2xl bg-slate-950 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-brand dark:text-ink dark:hover:bg-[#72f0d2]">
              {submitting ? "Signing in..." : "Login"}
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-300">
            Need an account? <Link to="/register" className="font-semibold text-brand">Register</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
