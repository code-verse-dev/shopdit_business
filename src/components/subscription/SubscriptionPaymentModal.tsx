import { useMemo, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "antd";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import {
  useFetchPaymentConfigQuery,
  useCreateSubscriptionPaymentIntentMutation,
  useLazyFetchActiveSubscriptionQuery,
  useSaveSubscriptionPaymentStripeMutation,
} from "../../redux/services/subscriptionService";
import { ImageUrl } from "../../utils/Functions";
import { ErrorPopup, SuccessPopup } from "../popup/Popup";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

export type PlanForPayment = {
  _id: string;
  name?: string;
  planName?: string;
  title?: string;
  price?: number;
  amount?: number;
  interval?: string;
};

const envStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": {
        color: "#9CA3AF",
      },
    },
    invalid: {
      color: "#EF4444",
    },
  },
};

/** Map plan interval to API cycle. */
function planIntervalToCycle(interval: string | undefined): "monthly" | "yearly" {
  const v = (interval ?? "").toLowerCase();
  if (v === "year" || v === "yearly") return "yearly";
  return "monthly";
}

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  plan: PlanForPayment;
  onSuccess?: () => void;
  /** Optional: override cycle; otherwise derived from plan.interval */
  cycle?: "monthly" | "yearly";
}

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  amount,
  plan,
  onSuccess,
  cycle: cycleProp,
}: SubscriptionPaymentModalProps) {
  const { data: paymentConfig, isLoading: loadingPaymentConfig } = useFetchPaymentConfigQuery();
  const [createPaymentIntent] = useCreateSubscriptionPaymentIntentMutation();
  const [savePayment, { isLoading: saving }] = useSaveSubscriptionPaymentStripeMutation();
  const [fetchActiveSubscription, { isFetching: refreshingSubscription }] =
    useLazyFetchActiveSubscriptionQuery();
  const cycle = cycleProp ?? planIntervalToCycle(plan.interval);
  const [errorMessage, setErrorMessage] = useState("");
  const isPaying = saving || refreshingSubscription;
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

  const handlePaymentSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="max-w-md w-full mx-4">
      <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <div className="flex items-stretch gap-4 mb-6">
          <div className="flex flex-col justify-center">
            <img
              src={ImageUrl("logo/logo.svg")}
              alt="Shopdit"
              className="h-14 w-auto dark:hidden flex-shrink-0"
            />
            <img
              src={ImageUrl("logo/logo.svg")}
              alt="Shopdit"
              className="h-14 w-auto hidden dark:block flex-shrink-0"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Subscription checkout
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {plan.name ?? plan.planName ?? plan.title ?? "Plan"}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              ${Number(amount).toFixed(2)} · Pay securely with Stripe
            </p>
          </div>
        </div>

        <div className="space-y-4 subscription-payment-form">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {!loadingPaymentConfig && !stripeEnabled && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              Stripe publishable key was not returned by <code>/payment/config</code>.
            </div>
          )}

          {stripeEnabled && !loadingPaymentConfig && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                amount={amount}
                planId={plan._id}
                cycle={cycle}
                disabled={isPaying}
                createPaymentIntent={createPaymentIntent}
                savePayment={savePayment}
                fetchActiveSubscription={fetchActiveSubscription}
                onError={setErrorMessage}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}

          {loadingPaymentConfig && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              Loading payment configuration...
            </div>
          )}

          <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
            <Lock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            Card details are handled by Stripe Elements and never sent to our API.
          </p>
        </div>
      </div>
    </Modal>
  );
}

type StripeCardFormProps = {
  amount: number;
  planId: string;
  cycle: "monthly" | "yearly";
  disabled: boolean;
  createPaymentIntent: (args: {
    planId: string;
    cycle: "monthly" | "yearly";
    currency?: string;
  }) => any;
  savePayment: (args: { paymentIntentId: string }) => any;
  fetchActiveSubscription: () => any;
  onError: (message: string) => void;
  onSuccess: () => void;
};

function StripeCardForm({
  amount,
  planId,
  cycle,
  disabled,
  createPaymentIntent,
  savePayment,
  fetchActiveSubscription,
  onError,
  onSuccess,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      onError("Card form is not ready. Please try again.");
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
        payment_method: { card },
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
      SuccessPopup("Subscription activated successfully.");
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.message ??
        "Failed to process subscription payment.";
      onError(msg);
      ErrorPopup(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          Card details
        </label>
        <div className="h-11 w-full rounded-lg border px-3 py-3 bg-transparent text-gray-800 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      <Button
        type="primary"
        htmlType="submit"
        className="w-full h-11 web-btn"
        loading={isSubmitting || disabled}
        disabled={!stripe || isSubmitting || disabled}
      >
        {isSubmitting || disabled ? "Processing…" : `Pay $${Number(amount).toFixed(2)}`}
      </Button>
    </form>
  );
}
