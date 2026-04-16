import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button, Spin } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import PageMeta from "../../components/common/PageMeta";
import {
  displayPlanKind,
  modalPlanHeading,
  planToCycle,
  type PlanForPayment,
} from "../../components/subscription/subscriptionPlanUtils";
import { ImageUrl } from "../../utils/Functions";
import {
  useCreateSubscriptionPaymentIntentMutation,
  useFetchPaymentConfigQuery,
  useLazyFetchActiveSubscriptionQuery,
  useSaveSubscriptionPaymentStripeMutation,
} from "../../redux/services/subscriptionService";
import { ErrorPopup, SuccessPopup } from "../../components/popup/Popup";

const envStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

const stripeFieldBase = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      fontFamily: "Outfit, system-ui, sans-serif",
      letterSpacing: "0.02em",
      "::placeholder": { color: "#9CA3AF" },
    },
    invalid: { color: "#EF4444" },
  },
};

const fieldWrapClass =
  "rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-all duration-150 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/15 dark:border-gray-700 dark:bg-gray-900/80";

export default function SubscriptionPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = (location.state as { plan?: PlanForPayment } | null)?.plan;

  useEffect(() => {
    if (!plan?._id) {
      navigate("/", { replace: true });
    }
  }, [plan, navigate]);

  const { data: paymentConfig, isLoading: loadingPaymentConfig } = useFetchPaymentConfigQuery();
  const stripePublishableKey = useMemo(() => {
    const payload = paymentConfig?.data ?? paymentConfig ?? {};
    const apiKey =
      payload?.publishableKey ??
      payload?.stripePublishableKey ??
      payload?.stripePublishable_key ??
      payload?.publicKey;
    return apiKey || envStripeKey || "";
  }, [paymentConfig]);
  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    return stripePublishableKey ? loadStripe(stripePublishableKey) : null;
  }, [stripePublishableKey]);
  const stripeEnabled = Boolean(stripePromise);

  if (!plan) return null;

  const amount = Number(plan.price ?? plan.amount ?? 0);
  const cycle = planToCycle(plan);
  const heading = modalPlanHeading(plan);
  const kind = displayPlanKind(plan);
  const isYearly = cycle === "yearly";

  const includedBase = ["Full dashboard", "Product listings", "Order management"];
  const included = isYearly ? [...includedBase, "Priority support"] : includedBase;

  return (
    <>
      <PageMeta
        title="Shopdit | Complete subscription"
        description="Secure subscription checkout with Stripe."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-700 dark:text-gray-400 dark:hover:text-violet-300 mb-8 transition-colors"
        >
          <ArrowLeftOutlined />
          Back to plans
        </button>

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-violet-50/80 to-white p-6 shadow-sm dark:from-violet-950/30 dark:to-gray-900 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={ImageUrl("logo/logo.svg")}
                  alt=""
                  className="h-10 w-10 rounded-xl object-contain bg-white shadow-sm dark:bg-white/10"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Checkout
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">{heading}</p>
                </div>
              </div>
              <div className="flex items-end gap-1 border-t border-violet-100/80 pt-5 dark:border-white/10">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total</span>
                <span className="ml-auto text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  ${amount.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 mb-1">{isYearly ? "/ year" : "/ month"}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {kind} subscription · Billed in USD · Secure payment
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Included
              </p>
              <ul className="space-y-2.5">
                {included.map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckOutlined className="text-violet-600 text-xs shrink-0 dark:text-violet-400" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Payment details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-8">
                Enter your card information below. Your data is encrypted and processed by Stripe.
              </p>

              {!loadingPaymentConfig && !stripeEnabled && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                  Stripe could not be initialized. Check <code>/payment/config</code> or your
                  environment.
                </div>
              )}

              {loadingPaymentConfig && (
                <div className="flex items-center justify-center gap-2 py-12 text-gray-500 text-sm">
                  <Spin size="small" />
                  Loading secure payment…
                </div>
              )}

              {stripeEnabled && !loadingPaymentConfig && (
                <Elements stripe={stripePromise}>
                  <SubscriptionPayForm
                    planId={plan._id}
                    cycle={cycle}
                    amount={amount}
                    onSuccess={() => {
                      SuccessPopup("Subscription activated successfully.");
                      navigate("/", { replace: true });
                    }}
                  />
                </Elements>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <LockOutlined className="text-violet-400" />
                  Secured by Stripe
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <SafetyCertificateOutlined className="text-violet-400" />
                  256-bit SSL
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function SubscriptionPayForm({
  planId,
  cycle,
  amount,
  onSuccess,
}: {
  planId: string;
  cycle: "monthly" | "yearly";
  amount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntent] = useCreateSubscriptionPaymentIntentMutation();
  const [savePayment, { isLoading: saving }] = useSaveSubscriptionPaymentStripeMutation();
  const [fetchActiveSubscription, { isFetching: refreshingSubscription }] =
    useLazyFetchActiveSubscriptionQuery();

  const [cardholderName, setCardholderName] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = isSubmitting || saving || refreshingSubscription;
  const payLabel = `Pay $${amount.toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setErrorMessage("Card fields are not ready. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const intentRes = await createPaymentIntent({ planId, cycle }).unwrap();
      const clientSecret = intentRes?.data?.clientSecret ?? intentRes?.clientSecret;
      const initialPaymentIntentId =
        intentRes?.data?.paymentIntentId ?? intentRes?.paymentIntentId;
      if (!clientSecret || typeof clientSecret !== "string") {
        throw new Error("Missing client secret from payment intent response.");
      }

      const confirmation = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName.trim() || undefined,
            address: billingZip.trim()
              ? { postal_code: billingZip.trim() }
              : undefined,
          },
        },
      });

      if (confirmation.error) {
        throw new Error(confirmation.error.message ?? "Card confirmation failed.");
      }

      const confirmedPaymentIntentId =
        confirmation.paymentIntent?.id ?? initialPaymentIntentId;
      if (!confirmedPaymentIntentId) {
        throw new Error("PaymentIntent id is missing after confirmation.");
      }

      if (confirmation.paymentIntent?.status !== "succeeded") {
        throw new Error("Payment was not completed. Please try again.");
      }

      await savePayment({ paymentIntentId: confirmedPaymentIntentId }).unwrap();
      try {
        await fetchActiveSubscription().unwrap();
      } catch {
        // Save endpoint already commits subscription; refresh can transiently fail.
      }
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.data?.message ?? err?.message ?? "Failed to process subscription payment.";
      setErrorMessage(msg);
      ErrorPopup(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Name on card
        </label>
        <input
          type="text"
          autoComplete="cc-name"
          placeholder="As shown on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Card number
        </label>
        <div className={fieldWrapClass}>
          <CardNumberElement options={stripeFieldBase} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Expiry
          </label>
          <div className={fieldWrapClass}>
            <CardExpiryElement options={stripeFieldBase} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            CVC
          </label>
          <div className={fieldWrapClass}>
            <CardCvcElement options={stripeFieldBase} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Billing ZIP / Postal code
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Optional"
          value={billingZip}
          onChange={(e) => setBillingZip(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        loading={busy}
        disabled={!stripe || busy}
        icon={!busy ? <LockOutlined /> : undefined}
        className="w-full !h-auto !rounded-xl !py-3.5 !font-bold !text-sm !bg-violet-600 hover:!bg-violet-700 !border-0 !shadow-lg !shadow-violet-600/25"
      >
        {busy ? "Processing…" : payLabel}
      </Button>
    </form>
  );
}
