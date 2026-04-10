import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { loanApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  principal: "",
  annual_rate: "",
  tenure_months: "",
};

export default function LoansPage() {
  const [providers, setProviders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [emiResult, setEmiResult] = useState(null);

  useEffect(() => {
    async function loadLoans() {
      const [providerResponse, recommendationResponse] = await Promise.all([
        loanApi.providers(),
        loanApi.recommendations(),
      ]);
      setProviders(providerResponse.data.results || providerResponse.data);
      setRecommendations(recommendationResponse.data);
    }
    loadLoans().catch(() => {
      setProviders([]);
      setRecommendations([]);
    });
  }, []);

  const calculate = async (event) => {
    event.preventDefault();
    const response = await loanApi.emi(form);
    setEmiResult(response.data);
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
                className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5"
              />
            ))}
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-brand dark:text-ink">
              Calculate EMI
            </button>
          </form>
          {emiResult ? (
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <div className="text-sm text-slate-500 dark:text-slate-300">Monthly EMI</div>
              <div className="mt-2 text-3xl font-semibold">{formatCurrency(emiResult.emi)}</div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Loan recommendations" subtitle="Ranked by EMI safety and dynamic trust score">
          <div className="grid gap-4">
            {recommendations.map((item, index) => (
              <div key={`${item.provider.id}-${item.tenure_months}-${index}`} className="rounded-[24px] border border-slate-200/70 p-5 dark:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold">{item.provider.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">
                      {item.provider.interest_rate}% interest · reliability {item.provider.reliability_factor}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-brand dark:text-ink">
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
            <div key={provider.id} className="rounded-[24px] border border-slate-200/70 p-5 dark:border-white/10">
              <div className="text-lg font-semibold">{provider.name}</div>
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
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
