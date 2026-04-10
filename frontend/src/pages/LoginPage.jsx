import { useState } from "react";
import { AtSign, Eye, Fingerprint, LockKeyhole, MoveRight, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
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
    <div className="auth-shell grid min-h-screen xl:grid-cols-[1.15fr_0.85fr]">
      <section className="auth-panel relative hidden min-h-screen p-10 xl:flex xl:flex-col xl:justify-between 2xl:p-14">
        <div className="auth-orb" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Luminescence
          </div>
          <h1 className="mt-10 max-w-3xl text-6xl font-semibold leading-[0.95] tracking-[-0.06em] text-white 2xl:text-[6.4rem]">
            Enter the
            <br />
            <span className="bg-[linear-gradient(135deg,#f3f4f6_0%,#df9cff_68%,#c084fc_100%)] bg-clip-text text-transparent">
              Neon Economy.
            </span>
          </h1>
          <p className="auth-muted mt-8 max-w-2xl text-xl leading-10">
            Experience a high-frequency interface built for the next generation of asset curation. Secure, fluid, and precise.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <div className="auth-chip flex items-center gap-3 rounded-[22px] px-5 py-4 text-base font-medium">
              <ShieldCheck size={18} className="text-cyan-400" />
              AES-256 Encrypted
            </div>
            <div className="auth-chip flex items-center gap-3 rounded-[22px] px-5 py-4 text-base font-medium">
              <Sparkles size={18} className="text-lime-400" />
              Real-time Insights
            </div>
          </div>
        </div>
        <div className="relative z-10 auth-muted text-sm tracking-[0.24em]">
          © 2026 FinPulse Protocol
        </div>
      </section>

      <section className="flex min-h-screen flex-col justify-between bg-[rgba(14,17,23,0.82)] p-6 sm:p-8 xl:p-12">
        <div className="mx-auto flex w-full max-w-[480px] flex-1 items-center py-10">
          <form onSubmit={onSubmit} className="w-full">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
              Secure Access
            </div>
            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white">
              Welcome Back
            </h2>
            <p className="auth-muted mt-4 max-w-md text-lg leading-9">
              Please enter your credentials to access your vault.
            </p>

            <div className="mt-10 space-y-7">
              <div>
                <label className="mb-3 block text-base font-semibold text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    name="email"
                    type="email"
                    placeholder="operator@finpulse.io"
                    onChange={onChange}
                    className="auth-input pl-12"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="block text-base font-semibold text-slate-200">
                    Password
                  </label>
                  <button type="button" className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300">
                    Forgot Access?
                  </button>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    onChange={onChange}
                    className="auth-input pl-12 pr-12"
                  />
                  <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                </div>
              </div>

              <label className="flex items-center gap-3 text-base text-slate-300">
                <span className="flex h-7 w-7 rounded-xl bg-white/8" />
                Maintain persistent session
              </label>

              {error ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#1dd6f2_0%,#1693a8_100%)] px-5 py-5 text-2xl font-semibold text-white transition hover:brightness-110"
              >
                {submitting ? "Signing In..." : "Sign In to Vault"}
                <MoveRight size={24} />
              </button>
            </div>

            <div className="auth-divider auth-muted mt-12 text-sm font-semibold uppercase tracking-[0.36em]">
              Or connect via node
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button type="button" className="auth-chip flex items-center justify-center gap-3 rounded-[24px] px-5 py-5 text-xl font-semibold">
                <WalletCards size={22} />
                Web3 Wallet
              </button>
              <button type="button" className="auth-chip flex items-center justify-center gap-3 rounded-[24px] px-5 py-5 text-xl font-semibold">
                <Fingerprint size={22} />
                Biometrics
              </button>
            </div>

            <p className="auth-muted mt-12 text-lg">
              New to the protocol?{" "}
              <Link to="/register" className="font-semibold text-[#e0a7ff] transition hover:text-[#f0c2ff]">
                Create an Identity
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
