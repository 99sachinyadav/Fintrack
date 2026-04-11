import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AtSign, Lock, Eye, EyeOff, Key } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="auth-shell flex min-h-screen w-full font-sans text-slate-100 selection:bg-cyan-500/30">
      
      {/* Left Panel */}
      <div className="auth-panel hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="auth-orb" />

        <div className="relative z-10 w-full max-w-lg mt-8">
          <div className="text-[#00daf3] font-bold uppercase tracking-wider text-sm mb-24">
            FINTRACK
          </div>
          
          <h1 className="text-6xl font-bold tracking-[-0.03em] text-white leading-tight">
            Master the <br />
            <span className="text-[#00daf3]">Digital Void.</span>
          </h1>

          <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-md">
            Access high-frequency financial intelligence through our obsidian-grade security architecture. Engineered for the modern digital FinTrack user.
          </p>

          <div className="mt-16 flex items-center gap-16">
            <div>
              <div className="text-[28px] font-bold text-[#00daf3] mb-1">256-bit</div>
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Encryption</div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-[#22c55e] mb-1">0.02ms</div>
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Latency</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 mb-4">
          © 2026 FinTrack AI Technologies. Engineered for the Digital Void.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-[rgba(10,13,19,0.78)] relative">
        <div className="w-full max-w-md mx-auto relative z-10">
          <h2 className="text-4xl font-bold text-white mb-3">Secure Access</h2>
          <p className="text-slate-400 text-[15px] mb-12">Enter your credentials to enter the vault.</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            
            {/* Identity Node */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Identity Node
              </label>
              <div className="relative flex items-center">
                <AtSign className="absolute left-4 text-slate-500" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="email@fin-track.io"
                  value={form.email}
                  onChange={onChange}
                  className="w-full bg-[#1c1c1e] text-white rounded-xl pl-12 pr-4 py-4 border-none outline-none focus:ring-1 focus:ring-[#00daf3] transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Access Key */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Access Key
                </label>
                <button type="button" className="text-xs font-semibold text-[#00daf3] hover:text-cyan-300 transition-colors">
                  Forgot Access?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-slate-500" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={onChange}
                  className={`w-full bg-[#1c1c1e] text-white rounded-xl pl-12 pr-12 py-4 border-none outline-none focus:ring-1 focus:ring-[#00daf3] transition-all placeholder:text-slate-600 font-medium ${!showPassword ? 'tracking-[0.2em]' : ''}`}
                />
                
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-sm font-medium mt-1">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full bg-[#00bad1] hover:bg-[#00daf3] text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {submitting ? "Initializing..." : "Initialize Session"}
            </button>
            
          </form>

          {/* Connect Via */}
          <div className="relative flex py-10 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold uppercase tracking-widest text-[#737373]">
              Or connect via
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <button type="button" className="flex items-center justify-center gap-3 bg-[#242426] hover:bg-[#2c2c2e] text-sm font-semibold text-slate-200 py-3.5 rounded-xl transition-colors">
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 bg-[#242426] hover:bg-[#2c2c2e] text-sm font-semibold text-slate-200 py-3.5 rounded-xl transition-colors">
              <Key size={18} className="text-[#00daf3]" />
              API Key
            </button>
          </div>

          <div className="mt-12 text-center text-sm font-medium">
            <span className="text-[#a1a1aa]">New to the void? </span>
            <Link to="/register" className="text-[#00daf3] hover:text-cyan-300 transition-colors">Create Account</Link>
          </div>

        </div>

        {/* Footer right panel purely for aesthetic mirroring of the bottom text in the left panel */}
        <div className="absolute bottom-10 right-12 lg:right-[15%] hidden md:flex items-center gap-6 text-xs font-semibold text-[#a1a1aa]">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
        </div>
      </div>
    </div>
  );
}
