import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  username: "",
  email: "",
  password: "",
  income: "",
  savings: "",
  liabilities: "",
  monthly_loan_obligation: "",
  risk_appetite: "medium",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.errors ? JSON.stringify(requestError.response.data.errors) : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r border-white/10 bg-[linear-gradient(180deg,#0a1525_0%,#10233a_100%)] p-12 text-white lg:block">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/8 text-sm font-semibold tracking-[0.2em]">
          FP
        </div>
        <div className="mt-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Onboarding</div>
        <h1 className="mt-5 max-w-lg text-5xl font-semibold tracking-[-0.05em]">
          Build a financial profile the system can actually reason about.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
          Capture income, savings, liabilities, and risk appetite so portfolio and loan recommendations reflect real capacity.
        </p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6 dark:bg-ink">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate/78"
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Create workspace</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Create your account</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["username", "Username", "text"],
            ["email", "Email", "email"],
            ["password", "Password", "password"],
            ["income", "Monthly income", "number"],
            ["savings", "Savings", "number"],
            ["liabilities", "Liabilities", "number"],
            ["monthly_loan_obligation", "Monthly EMI obligations", "number"],
          ].map(([name, placeholder, type]) => (
            <input
              key={name}
              name={name}
              type={type}
              placeholder={placeholder}
              value={form[name]}
              onChange={onChange}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-brand"
            />
          ))}
          <select
            name="risk_appetite"
            value={form.risk_appetite}
            onChange={onChange}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:focus:border-brand"
          >
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
          </select>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-600 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}
        <button type="submit" disabled={submitting} className="mt-6 rounded-2xl bg-slate-950 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-brand dark:text-ink dark:hover:bg-[#72f0d2]">
          {submitting ? "Creating..." : "Create account"}
        </button>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-300">
          Already have an account? <Link to="/login" className="font-semibold text-brand">Login</Link>
        </p>
      </form>
      </section>
    </div>
  );
}
