import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { loanApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const initialOffer = {
  name: "",
  interest_rate: "",
  reliability_factor: "",
  processing_fee: "",
  max_tenure_months: "",
};

export default function LoanProviderPanelPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(initialOffer);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const [offerRes, appRes] = await Promise.all([
      loanApi.providerDashboard(),
      loanApi.applications(),
    ]);
    setOffers(offerRes.data.results || offerRes.data);
    setApplications(appRes.data.results || appRes.data);
  };

  useEffect(() => {
    load().catch(() => {
      setOffers([]);
      setApplications([]);
    });
  }, []);

  const submitOffer = async (event) => {
    event.preventDefault();
    await loanApi.createProviderOffer({
      ...form,
      interest_rate: Number(form.interest_rate),
      reliability_factor: Number(form.reliability_factor),
      processing_fee: Number(form.processing_fee),
      max_tenure_months: Number(form.max_tenure_months),
    });
    setForm(initialOffer);
    load();
  };

  const updateStatus = async (id, nextStatus) => {
    setBusyId(id);
    try {
      await loanApi.updateApplicationStatus(id, { status: nextStatus });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (user?.role !== "loan_provider" && user?.role !== "admin") {
    return (
      <SectionCard
        title="Provider access only"
        subtitle="Register or login as a loan provider to publish offers and review borrower requests"
      >
        <p className="text-sm text-slate-500 dark:text-slate-300">
          This panel is available only for accounts with the <strong>loan provider</strong> role.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Create loan offer" subtitle="Dedicated panel for registered loan providers">
        <form onSubmit={submitOffer} className="grid gap-3">
          {[
            ["name", "Provider name", "text"],
            ["interest_rate", "Interest rate %", "number"],
            ["reliability_factor", "Reliability 1-100", "number"],
            ["processing_fee", "Processing fee", "number"],
            ["max_tenure_months", "Max tenure months", "number"],
          ].map(([key, label, type]) => (
            <input
              key={key}
              type={type}
              placeholder={label}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              className="field-control"
              required
            />
          ))}
          <button type="submit" className="primary-action px-4 py-3 font-semibold">
            Publish offer
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Applicants" subtitle="Users who applied to your loan offers">
        <div className="grid gap-3">
          {applications.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/70 bg-white/45 p-4 dark:border-slate-700/80 dark:bg-slate-800/60"
            >
              <div className="font-semibold text-slate-900 dark:text-white">{item.provider_name}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Applicant: {item.applicant_username || "User"} · {item.applicant_email}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-300">
                {formatCurrency(item.amount_requested)} · {item.tenure_months} months · {item.status}
              </div>
              {item.note ? (
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Note: {item.note}
                </div>
              ) : null}
              {item.salary_slip_image_url ? (
                <div className="mt-2 text-sm">
                  <a 
                    href={item.salary_slip_image_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-medium text-brand hover:underline"
                  >
                    View Salary Slip
                  </a>
                </div>
              ) : null}
              {item.status === "pending" ? (
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => updateStatus(item.id, "approved")}
                    className="primary-action px-4 py-2 text-sm font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => updateStatus(item.id, "rejected")}
                    className="secondary-action px-4 py-2 text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {applications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">No applicants yet.</p>
          ) : null}
        </div>
        <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          Active offers: {offers.length}
        </div>
      </SectionCard>
    </div>
  );
}
