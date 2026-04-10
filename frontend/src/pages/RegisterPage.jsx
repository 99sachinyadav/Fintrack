import { useState } from "react";
import { AtSign, BadgeDollarSign, CircleDollarSign, LockKeyhole, MoveRight, ShieldCheck, Sparkles, TriangleAlert, UserRound } from "lucide-react";
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
    <div className="auth-shell grid min-h-screen xl:grid-cols-[1.08fr_0.92fr]">
      <section className="auth-panel relative hidden min-h-screen p-10 xl:flex xl:flex-col xl:justify-between 2xl:p-14">
        <div className="auth-orb" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Luminescence
          </div>
          <h1 className="mt-10 max-w-3xl text-6xl font-semibold leading-[0.95] tracking-[-0.06em] text-white 2xl:text-[6rem]">
            Create your
            <br />
            <span className="bg-[linear-gradient(135deg,#f3f4f6_0%,#df9cff_68%,#c084fc_100%)] bg-clip-text text-transparent">
              Neon Identity.
            </span>
          </h1>
          <p className="auth-muted mt-8 max-w-2xl text-xl leading-10">
            Configure your financial baseline so the protocol can personalize investment analytics, trust scoring, and loan capacity with precision.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Profile", "Income and savings posture"],
              ["Risk", "Investment appetite calibration"],
              ["Borrowing", "Loan capacity checks"],
            ].map(([title, caption]) => (
              <div key={title} className="auth-chip rounded-[24px] p-5">
                <div className="text-base font-semibold text-white">{title}</div>
                <div className="auth-muted mt-2 text-sm leading-6">{caption}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 auth-muted text-sm tracking-[0.24em]">
          © 2026 FinPulse Protocol
        </div>
      </section>

      <section className="flex min-h-screen flex-col justify-between bg-[rgba(14,17,23,0.82)] p-6 sm:p-8 xl:p-12">
        <div className="mx-auto flex w-full max-w-[560px] flex-1 items-center py-10">
          <form onSubmit={onSubmit} className="w-full">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
              Create workspace
            </div>
            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white">
              Build Your Vault
            </h2>
            <p className="auth-muted mt-4 max-w-xl text-lg leading-9">
              Initialize your account with the signals FinPulse needs to generate portfolio, expense, and lending guidance.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Field icon={<UserRound size={20} className="text-slate-500" />} name="username" type="text" placeholder="Identity handle" value={form.username} onChange={onChange} />
              <Field icon={<AtSign size={20} className="text-slate-500" />} name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange} />
              <Field icon={<LockKeyhole size={20} className="text-slate-500" />} name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
              <Field icon={<BadgeDollarSign size={20} className="text-slate-500" />} name="income" type="number" placeholder="Monthly income" value={form.income} onChange={onChange} />
              <Field icon={<CircleDollarSign size={20} className="text-slate-500" />} name="savings" type="number" placeholder="Savings" value={form.savings} onChange={onChange} />
              <Field icon={<TriangleAlert size={20} className="text-slate-500" />} name="liabilities" type="number" placeholder="Liabilities" value={form.liabilities} onChange={onChange} />
              <Field icon={<ShieldCheck size={20} className="text-slate-500" />} name="monthly_loan_obligation" type="number" placeholder="Monthly EMI obligations" value={form.monthly_loan_obligation} onChange={onChange} />
              <select
                name="risk_appetite"
                value={form.risk_appetite}
                onChange={onChange}
                className="auth-input"
              >
                <option value="low">Low risk appetite</option>
                <option value="medium">Medium risk appetite</option>
                <option value="high">High risk appetite</option>
              </select>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="auth-chip flex items-center gap-3 rounded-[22px] px-5 py-4 text-base font-medium">
                <ShieldCheck size={18} className="text-cyan-400" />
                Encrypted Profile State
              </div>
              <div className="auth-chip flex items-center gap-3 rounded-[22px] px-5 py-4 text-base font-medium">
                <Sparkles size={18} className="text-lime-400" />
                Adaptive Risk Scoring
              </div>
            </div>

            {error ? (
              <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#1dd6f2_0%,#1693a8_100%)] px-5 py-5 text-2xl font-semibold text-white transition hover:brightness-110"
            >
              {submitting ? "Creating..." : "Create Identity"}
              <MoveRight size={24} />
            </button>

            <p className="auth-muted mt-10 text-lg">
              Already in the protocol?{" "}
              <Link to="/login" className="font-semibold text-[#e0a7ff] transition hover:text-[#f0c2ff]">
                Return to Vault
              </Link>
            </p>
          </form>
        </div>

        <footer className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 border-t border-white/6 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-white">Luminescence</div>
            <div className="mt-1">© 2026 FinPulse. All assets encrypted.</div>
          </div>
          <div className="flex flex-wrap gap-6">
            <span>Legal</span>
            <span>Privacy</span>
            <span>Protocol</span>
            <span>API</span>
          </div>
        </footer>
      </section>
    </div>
  );
}

function Field({ icon, name, type, placeholder, value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="auth-input pl-12"
      />
    </div>
  );
}
