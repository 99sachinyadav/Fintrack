import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Landmark,
  MoveRight,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "user",
  income: "",
  savings: "",
  liabilities: "",
  monthly_loan_obligation: "",
  risk_appetite: "medium",
};

const roleCards = [
  {
    value: "user",
    title: "Personal account",
    caption: "For borrowers, investors, and everyday financial tracking.",
    icon: UserRound,
  },
  {
    value: "loan_provider",
    title: "Loan provider",
    caption: "For institutions or operators publishing offers and reviewing applications.",
    icon: Building2,
  },
];

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
      await register({
        ...form,
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        income: form.income === "" ? 0 : Number(form.income),
        savings: form.savings === "" ? 0 : Number(form.savings),
        liabilities: form.liabilities === "" ? 0 : Number(form.liabilities),
        monthly_loan_obligation:
          form.monthly_loan_obligation === "" ? 0 : Number(form.monthly_loan_obligation),
      });
      navigate("/");
    } catch (requestError) {
      const responseData = requestError.response?.data;
      setError(
        responseData?.detail ||
          (responseData?.errors
            ? Object.entries(responseData.errors)
                .map(([field, messages]) => `${field}: ${messages}`)
                .join(" | ")
            : "Registration failed."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell grid min-h-screen xl:grid-cols-[1.04fr_0.96fr]">
      <section className="auth-panel relative hidden min-h-screen overflow-hidden xl:flex xl:flex-col xl:justify-between xl:p-12 2xl:p-14">
        <div className="auth-orb" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
            <ShieldCheck size={14} />
            Professional Onboarding
          </div>

          <h1 className="mt-10 max-w-3xl text-6xl font-semibold leading-[0.94] tracking-[-0.06em] text-white 2xl:text-[6rem]">
            Open a secure
            <br />
            financial workspace.
          </h1>

          <p className="auth-muted mt-8 max-w-2xl text-xl leading-10">
            Create a polished account profile for portfolio intelligence, live payment tracking,
            and institution-grade loan workflows.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Verified Identity", "Structured onboarding for users and lending operators."],
              ["Risk-Aware Setup", "Capture income, savings, liabilities, and repayment posture."],
              ["Decision Engine", "Unlock lending advice and approval workflows from day one."],
            ].map(([title, caption]) => (
              <div key={title} className="auth-chip rounded-[26px] p-5">
                <div className="text-base font-semibold text-white">{title}</div>
                <div className="auth-muted mt-2 text-sm leading-6">{caption}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[30px] border border-white/8 bg-white/5 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Trusted For
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TrustPoint
                icon={<Landmark size={18} className="text-cyan-300" />}
                title="Borrower onboarding"
                caption="Users receive health-based guidance before taking credit exposure."
              />
              <TrustPoint
                icon={<BriefcaseBusiness size={18} className="text-emerald-300" />}
                title="Provider operations"
                caption="Providers can publish offers, review applications, and approve requests."
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-slate-400">
          <span>Luminescence</span>
          <span>2026 FinPulse Platform</span>
        </div>
      </section>

      <section className="flex min-h-screen flex-col justify-between bg-[rgba(10,13,19,0.78)] p-6 sm:p-8 xl:p-10">
        <div className="mx-auto flex w-full max-w-[640px] flex-1 items-center py-8">
          <form onSubmit={onSubmit} className="auth-form-card w-full rounded-[32px] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Create Account
                </div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Sign up to FinPulse
                </h2>
                <p className="auth-muted mt-3 max-w-xl text-base leading-8 sm:text-lg">
                  Set up a professional profile to access dashboard analytics, payments,
                  and loan operations.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Security</div>
                <div className="mt-1 text-sm font-semibold text-white">JWT + profile sync</div>
              </div>
            </div>

            <div className="mt-8">
              <SectionLabel title="Choose Role" description="Select the workspace type you want to create." />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {roleCards.map((roleCard) => {
                  const Icon = roleCard.icon;
                  const active = form.role === roleCard.value;
                  return (
                    <button
                      key={roleCard.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, role: roleCard.value }))}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        active
                          ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_12px_30px_rgba(34,211,238,0.08)]"
                          : "border-white/8 bg-white/5 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-white">
                          <Icon size={20} />
                        </div>
                        {active ? (
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-white">{roleCard.title}</div>
                      <div className="auth-muted mt-2 text-sm leading-6">{roleCard.caption}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-8">
              <div>
                <SectionLabel title="Identity" description="Primary credentials for your account." />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    name="username"
                    type="text"
                    label="Full name / username"
                    placeholder="Enter your name"
                    value={form.username}
                    onChange={onChange}
                  />
                  <Field
                    name="email"
                    type="email"
                    label="Work email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={onChange}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      name="password"
                      type="password"
                      label="Password"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel title="Financial Profile" description="Used to personalize health, lending, and analytics." />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    name="income"
                    type="number"
                    label="Monthly income"
                    placeholder="0"
                    value={form.income}
                    onChange={onChange}
                  />
                  <Field
                    name="savings"
                    type="number"
                    label="Savings"
                    placeholder="0"
                    value={form.savings}
                    onChange={onChange}
                  />
                  <Field
                    name="liabilities"
                    type="number"
                    label="Liabilities"
                    placeholder="0"
                    value={form.liabilities}
                    onChange={onChange}
                  />
                  <Field
                    name="monthly_loan_obligation"
                    type="number"
                    label="Existing EMI obligations"
                    placeholder="0"
                    value={form.monthly_loan_obligation}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div>
                <SectionLabel title="Risk Preference" description="Helps tune investment and lending recommendations." />
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Risk appetite
                  </label>
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
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FeatureBadge icon={<ShieldCheck size={16} className="text-cyan-300" />} text="Encrypted profile state" />
              <FeatureBadge icon={<Sparkles size={16} className="text-emerald-300" />} text="Adaptive health and trust scoring" />
            </div>

            {error ? (
              <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#17c6de_0%,#0e7490_100%)] px-5 py-4 text-lg font-semibold text-white transition hover:brightness-110 sm:text-xl"
            >
              {submitting ? "Creating account..." : "Create account"}
              <MoveRight size={22} />
            </button>

            <p className="auth-muted mt-8 text-base sm:text-lg">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#c8ecff] transition hover:text-white">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <footer className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 border-t border-white/6 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Luminescence</div>
            <div className="mt-1">Professional financial command center</div>
          </div>
          <div className="flex flex-wrap gap-6">
            <span>Legal</span>
            <span>Privacy</span>
            <span>Security</span>
            <span>Platform</span>
          </div>
        </footer>
      </section>
    </div>
  );
}

function SectionLabel({ title, description }) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        {title}
      </div>
      <div className="auth-muted mt-1 text-sm leading-6">{description}</div>
    </div>
  );
}

function Field({ name, type, label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="auth-input"
        required
      />
    </div>
  );
}

function FeatureBadge({ icon, text }) {
  return (
    <div className="auth-chip flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function TrustPoint({ icon, title, caption }) {
  return (
    <div className="rounded-[22px] border border-white/6 bg-black/10 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
          {icon}
        </div>
        <div className="text-base font-semibold text-white">{title}</div>
      </div>
      <div className="auth-muted mt-3 text-sm leading-6">{caption}</div>
    </div>
  );
}
