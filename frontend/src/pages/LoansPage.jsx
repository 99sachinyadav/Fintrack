import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { loanApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  principal: "",
  annual_rate: "",
  tenure_months: "",
};

export default function LoansPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [providerOffers, setProviderOffers] = useState([]);
  const [advice, setAdvice] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    provider: "",
    amount_requested: "",
    tenure_months: "",
    note: "",
  });
  const [form, setForm] = useState(initialForm);
  const [emiResult, setEmiResult] = useState(null);

  useEffect(() => {
    async function loadLoans() {
      const [providerResponse, recommendationResponse, adviceResponse] = await Promise.all([
        loanApi.providers(),
        loanApi.recommendations(),
        loanApi.advice(),
      ]);
      setProviders(providerResponse.data.results || providerResponse.data);
      setRecommendations(recommendationResponse.data);
      setAdvice(adviceResponse.data);

      const applicationResponse = await loanApi.applications();
      setApplications(applicationResponse.data.results || applicationResponse.data);

      if (user?.role === "loan_provider" || user?.role === "admin") {
        const providerDashboardResponse = await loanApi.providerDashboard();
        setProviderOffers(providerDashboardResponse.data.results || providerDashboardResponse.data);
      } else {
        setProviderOffers([]);
      }
    }

    loadLoans().catch(() => {
      setProviders([]);
      setRecommendations([]);
      setApplications([]);
      setProviderOffers([]);
      setAdvice(null);
    });
  }, [user?.role]);

  const calculate = async (event) => {
    event.preventDefault();
    const response = await loanApi.emi({
      principal: Number(form.principal),
      annual_rate: Number(form.annual_rate),
      tenure_months: Number(form.tenure_months),
    });
    setEmiResult(response.data);
  };

  const applyLoan = async (event) => {
    event.preventDefault();
    await loanApi.apply({
      ...applicationForm,
      amount_requested: Number(applicationForm.amount_requested),
      tenure_months: Number(applicationForm.tenure_months),
    });
    setApplicationForm({ provider: "", amount_requested: "", tenure_months: "", note: "" });
    const response = await loanApi.applications();
    setApplications(response.data.results || response.data);
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="EMI calculator" subtitle="Use the standard EMI formula for instant repayment planning">
          <form onSubmit={calculate} className="grid gap-4">
            {[
              ["principal", "Principal"],
              ["annual_rate", "Annual interest rate"],
              ["tenure_months", "Tenure in months"],
            ].map(([name, label]) => (
              <input
                key={name}
                name={name}
                type="number"
                placeholder={label}
                value={form[name]}
                onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                className="field-control"
                required
              />
            ))}
            <button type="submit" className="primary-action px-4 py-3 font-semibold">
              Calculate EMI
            </button>
          </form>
          {emiResult ? (
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-slate-950 dark:bg-white/5 dark:text-white">
              <div className="text-sm text-slate-500 dark:text-slate-300">Monthly EMI</div>
              <div className="mt-2 text-3xl font-semibold">{formatCurrency(emiResult.emi)}</div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Loan recommendations" subtitle="Ranked by EMI safety and dynamic trust score">
          {advice ? (
            <div
              className={`mb-4 rounded-2xl border p-4 ${
                advice.should_take_loan
                  ? "border-emerald-300/40 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                  : "border-amber-300/40 bg-amber-50 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
              }`}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em]">
                Health-based advice
              </div>
              <div className="mt-2 text-base font-semibold">
                {advice.should_take_loan
                  ? "Advised: You can consider taking a loan"
                  : "Advised: Avoid taking a loan right now"}
              </div>
              <div className="mt-2 text-sm opacity-90">{advice.reason}</div>
            </div>
          ) : null}

          <div className="grid gap-4">
            {recommendations.map((item, index) => (
              <div
                key={`${item.provider.id}-${item.tenure_months}-${index}`}
                className="rounded-[24px] border border-slate-200/70 bg-white/45 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-950 dark:text-white">
                      {item.provider.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">
                      {item.provider.interest_rate}% interest · reliability {item.provider.reliability_factor}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
                    Trust {item.trust_score}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="Eligible amount" value={formatCurrency(item.eligible_amount)} />
                  <Metric label="Monthly EMI" value={formatCurrency(item.emi)} />
                  <Metric label="Tenure" value={`${item.tenure_months} months`} />
                </div>
              </div>
            ))}
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                No recommendations yet. Seed providers and complete your profile income details.
              </p>
            ) : null}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Provider trust board" subtitle="Interest efficiency blended with reliability factor">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-[24px] border border-slate-200/70 bg-white/45 p-5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-lg font-semibold text-slate-950 dark:text-white">{provider.name}</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-500 dark:text-slate-300">
                <div>Interest rate: {provider.interest_rate}%</div>
                <div>Reliability factor: {provider.reliability_factor}</div>
                <div>Max tenure: {provider.max_tenure_months} months</div>
                <div>Processing fee: {formatCurrency(provider.processing_fee)}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Apply for a loan" subtitle="Submit applications based on recommendation confidence">
          <form onSubmit={applyLoan} className="grid gap-4">
            <select
              value={applicationForm.provider}
              onChange={(event) => setApplicationForm({ ...applicationForm, provider: event.target.value })}
              className="field-control"
              required
            >
              <option value="">Select provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Requested amount"
              className="field-control"
              value={applicationForm.amount_requested}
              onChange={(event) => setApplicationForm({ ...applicationForm, amount_requested: event.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Tenure (months)"
              className="field-control"
              value={applicationForm.tenure_months}
              onChange={(event) => setApplicationForm({ ...applicationForm, tenure_months: event.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Note (optional)"
              className="field-control"
              value={applicationForm.note}
              onChange={(event) => setApplicationForm({ ...applicationForm, note: event.target.value })}
            />
            <button type="submit" className="primary-action px-4 py-3 font-semibold">
              Apply
            </button>
          </form>
          {advice && !advice.should_take_loan ? (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-300">
              Your current health score suggests waiting before borrowing. You can still submit a request, but the app is advising caution.
            </p>
          ) : null}
        </SectionCard>

        <SectionCard title="Applications / provider panel" subtitle="Users can track status, providers can review applicants">
          <div className="grid gap-3">
            {applications.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/70 bg-white/45 p-4 dark:border-slate-700/80 dark:bg-slate-800/60"
              >
                <div className="font-semibold text-slate-900 dark:text-white">{item.provider_name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  {formatCurrency(item.amount_requested)} · {item.tenure_months} months · {item.status}
                </div>
                {item.status === "approved" ? (
                  <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
                    Approved by provider. Your loan status has been updated.
                  </div>
                ) : null}
                {item.status === "rejected" ? (
                  <div className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                    Rejected by provider.
                  </div>
                ) : null}
              </div>
            ))}
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No loan applications yet.</p>
            ) : null}
            {(user?.role === "loan_provider" || user?.role === "admin") && providerOffers.length > 0 ? (
              <div className="pt-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                Provider dashboard offers: {providerOffers.length}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100/80 p-4 text-slate-950 dark:bg-white/5 dark:text-white">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
