import { useState } from "react";
import SectionCard from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { authApi, notificationApi } from "../services/api";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    income: user?.income || "",
    savings: user?.savings || "",
    liabilities: user?.liabilities || "",
    monthly_loan_obligation: user?.monthly_loan_obligation || "",
    risk_appetite: user?.risk_appetite || "medium",
  });
  const [message, setMessage] = useState("");

  const saveProfile = async (event) => {
    event.preventDefault();
    const response = await authApi.updateProfile(form);
    setUser(response.data);
    setMessage("Profile updated.");
  };

  const triggerNotification = async (kind) => {
    const mapping = {
      monthly: notificationApi.monthly,
      profit: notificationApi.profitLoss,
      loan: notificationApi.loanWarning,
    };
    const response = await mapping[kind]();
    setMessage(response.data.message || "Notification queued.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard title="Profile and financial posture" subtitle="Update income, savings, liabilities, and risk appetite">
        <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
          {[
            ["username", "Username", "text"],
            ["income", "Income", "number"],
            ["savings", "Savings", "number"],
            ["liabilities", "Liabilities", "number"],
            ["monthly_loan_obligation", "Monthly EMI", "number"],
          ].map(([name, label, type]) => (
            <input
              key={name}
              name={name}
              type={type}
              placeholder={label}
              value={form[name]}
              onChange={(event) => setForm({ ...form, [name]: event.target.value })}
              className="field-control"
            />
          ))}
          <select
            name="risk_appetite"
            value={form.risk_appetite}
            onChange={(event) => setForm({ ...form, risk_appetite: event.target.value })}
            className="field-control"
          >
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
          </select>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-brand dark:text-ink">
              Save profile
            </button>
          </div>
        </form>
        {message ? <p className="mt-4 text-sm text-brand">{message}</p> : null}
      </SectionCard>

      <SectionCard title="Email notifications" subtitle="Trigger Resend-powered summaries and alerts">
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => triggerNotification("monthly")}
            className="secondary-action px-4 py-3 text-left"
          >
            Send monthly expense summary
          </button>
          <button
            type="button"
            onClick={() => triggerNotification("profit")}
            className="secondary-action px-4 py-3 text-left"
          >
            Send profit/loss report
          </button>
          <button
            type="button"
            onClick={() => triggerNotification("loan")}
            className="secondary-action px-4 py-3 text-left"
          >
            Send loan warning
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
