import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SectionCard from "../components/SectionCard";
import { paymentApi } from "../services/api";

function formatApiError(error) {
  const data = error.response?.data;
  if (!data) return error.message || "Request failed.";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => (typeof item === "string" ? item : item?.msg || JSON.stringify(item))).join(" ");
  }
  if (data.errors) {
    try {
      return Object.entries(data.errors)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
        .join(" | ");
    } catch {
      return "Unable to create payment.";
    }
  }
  return "Unable to create payment.";
}

export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Smart Finance Advisor Payment");
  const [flow, setFlow] = useState("incoming");
  const [payerEmail, setPayerEmail] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    const sessionId = searchParams.get("session_id");

    if (status === "cancel") {
      setMessage("Payment was canceled.");
      return;
    }
    if (status !== "success" || !sessionId) return;

    let cancelled = false;
    async function confirmSession() {
      setLoading(true);
      try {
        await paymentApi.confirmSession({ session_id: sessionId });
        if (!cancelled) {
          window.location.href = "/";
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(formatApiError(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    confirmSession();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const createCheckout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await paymentApi.checkoutSession({
        amount: Number(amount),
        description,
        flow,
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      setMessage(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const createPaymentLink = async () => {
    setLoading(true);
    setMessage("");
    setPaymentLink("");
    try {
      const response = await paymentApi.paymentLink({
        amount: Number(amount),
        description,
        flow,
        payer_email: flow === "incoming" ? payerEmail : undefined,
      });
      setPaymentLink(response.data.payment_link_url);
      if (flow === "incoming" && payerEmail) {
        setMessage(`Payment link generated and emailed to ${payerEmail}!`);
      }
    } catch (error) {
      setMessage(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Stripe payment actions" subtitle="All transactions are captured via verified Stripe webhooks">
        <div className="grid gap-4">
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="field-control"
            placeholder="Amount in USD"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field-control"
            placeholder="Payment description"
            required
          />
          <select value={flow} onChange={(event) => setFlow(event.target.value)} className="field-control">
            <option value="incoming">Incoming (Income received)</option>
            <option value="outgoing">Outgoing (Expense paid)</option>
          </select>
          {flow === "incoming" && (
            <input
              type="email"
              value={payerEmail}
              onChange={(event) => setPayerEmail(event.target.value)}
              className="field-control"
              placeholder="Payer's Email (Optional - sends QR direct)"
            />
          )}
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Use <strong>Incoming</strong> when you are receiving money and want it to appear in the dashboard&apos;s income card.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={createCheckout} className="primary-action px-4 py-3 font-semibold" disabled={loading}>
              Launch Checkout
            </button>
            <button type="button" onClick={createPaymentLink} className="secondary-action px-4 py-3 font-semibold" disabled={loading}>
              Generate Payment Link
            </button>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Payment link and QR" subtitle="Share link directly or scan using Stripe hosted checkout">
        {paymentLink ? (
          <div className="space-y-3">
            <a href={paymentLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand underline">
              {paymentLink}
            </a>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentLink)}`}
              alt="Payment QR"
              className="h-[220px] w-[220px] rounded-2xl border border-slate-200/70 dark:border-slate-700/80"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">Generate a payment link to show a QR preview.</p>
        )}
        {message ? <p className="mt-4 text-sm text-rose-400">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
