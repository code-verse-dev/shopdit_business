import { Button } from "antd";
import { CheckOutlined, CloseOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRef, useState, type FormEvent } from "react";
import { BsStars } from "react-icons/bs";
import { StripeSplitCardFields } from "../../components/studio/StripeSplitCardFields";
import {
  aiErrorMessage,
  formatTokenCount,
  isPopularPackage,
  packagePerks,
  stripePublishableKey,
  useCreateAiPurchaseIntentMutation,
  useGetAiPackagesQuery,
  useLazyGetAiPaymentConfigQuery,
  useSaveAiPurchaseMutation,
  type AiPackage,
} from "../../redux/services/aiService";

function PackPayForm({
  clientSecret,
  paymentIntentId,
  currency,
  packTitle,
  amount,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  paymentIntentId: string;
  currency?: string;
  packTitle: string;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [savePurchase] = useSaveAiPurchaseMutation();
  const [submitting, setSubmitting] = useState(false);
  const finalizeSentRef = useRef(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || finalizeSentRef.current || submitting) return;
    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumberEl },
      });
      if (error) {
        onError(error.message || "Payment failed. Please try again.");
        return;
      }

      const pid = paymentIntent?.id ?? paymentIntentId;
      if (finalizeSentRef.current) return;
      finalizeSentRef.current = true;

      try {
        const result = await savePurchase({
          paymentIntentId: pid,
          currency,
        }).unwrap();
        if (result.status === false) {
          finalizeSentRef.current = false;
          onError(result.message || "Could not credit tokens.");
          return;
        }
        onSuccess();
      } catch (err: unknown) {
        finalizeSentRef.current = false;
        onError(aiErrorMessage(err, "Could not credit tokens."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 rounded-2xl border border-gray-100 bg-[#f8f8fb] p-4">
        <StripeSplitCardFields />
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Card details are processed by Stripe. We never receive your full card number.
      </p>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <SafetyCertificateOutlined /> Secured payment
      </div>
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        className="web-btn !h-auto !min-w-0 !rounded-full !py-3.5 !font-bold"
        loading={submitting}
        disabled={submitting || !stripe}
      >
        {submitting ? "Processing…" : `Pay $${amount.toFixed(2)} · ${packTitle}`}
      </Button>
    </form>
  );
}

export default function StudioBuyTokens({
  open,
  onClose,
  onPurchased,
  activePackageId,
  activePackageTitle,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased: (tokens: number, title: string) => void;
  activePackageId?: string | null;
  activePackageTitle?: string;
}) {
  const { data } = useGetAiPackagesQuery();
  const packages = data?.data ?? [];
  const [fetchPaymentConfig] = useLazyGetAiPaymentConfigQuery();
  const [createIntent] = useCreateAiPurchaseIntentMutation();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{
    pack: AiPackage;
    clientSecret: string;
    paymentIntentId: string;
    publishableKey: string;
    currency: string;
  } | null>(null);

  const startCheckout = async (pack: AiPackage) => {
    setPayError(null);
    setStartingId(pack._id);
    try {
      const cfg = await fetchPaymentConfig().unwrap();
      const pk = stripePublishableKey(cfg);
      if (!pk) {
        setPayError("Payments are not configured yet.");
        return;
      }
      const intent = await createIntent({ packageId: pack._id }).unwrap();
      const d = intent.data;
      if (!d?.clientSecret || !d?.paymentIntentId) {
        setPayError(intent.message || "Could not start checkout.");
        return;
      }
      setCheckout({
        pack,
        clientSecret: d.clientSecret,
        paymentIntentId: d.paymentIntentId,
        publishableKey: pk,
        currency: d.currency,
      });
    } catch (err: unknown) {
      setPayError(aiErrorMessage(err, "Could not start checkout."));
    } finally {
      setStartingId(null);
    }
  };

  const closeModal = () => {
    setCheckout(null);
    setPayError(null);
    onClose();
  };

  return (
    <div
      className={`studio-modal-backdrop fixed inset-0 z-[10050] flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center ${
        open ? "is-open" : ""
      }`}
      onClick={closeModal}
      role="presentation"
      aria-hidden={!open}
    >
      <div
        className="studio-modal-panel relative max-h-[90vh] w-full max-w-[920px] overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F6075A] text-white">
              <BsStars />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {checkout
                  ? `Pay for ${checkout.pack.title}`
                  : activePackageTitle
                    ? "Your Studio plan"
                    : "Choose a token pack"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {checkout
                  ? `${formatTokenCount(checkout.pack.tokenAmount)} tokens credit this business wallet as soon as payment clears.`
                  : activePackageTitle
                    ? `${activePackageTitle} is your current pack. Buy again anytime — new tokens add to the same wallet.`
                    : "Tokens never expire. Use them for flyer copy, listings, captions, and image concepts."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>

        {payError ? (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{payError}</p>
        ) : null}

        {checkout ? (
          <div>
            <button
              type="button"
              className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900"
              onClick={() => {
                setCheckout(null);
                setPayError(null);
              }}
            >
              ← Back to packs
            </button>
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#f8f8fb] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{checkout.pack.title}</p>
                <p className="text-xs text-gray-500">
                  {formatTokenCount(checkout.pack.tokenAmount)} tokens
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900">${checkout.pack.price.toFixed(2)}</p>
            </div>
            <Elements
              key={checkout.clientSecret}
              stripe={loadStripe(checkout.publishableKey)}
              options={{ clientSecret: checkout.clientSecret }}
            >
              <PackPayForm
                clientSecret={checkout.clientSecret}
                paymentIntentId={checkout.paymentIntentId}
                currency={checkout.currency}
                packTitle={checkout.pack.title}
                amount={checkout.pack.price}
                onSuccess={() => {
                  const tokens = checkout.pack.tokenAmount;
                  const title = checkout.pack.title;
                  setCheckout(null);
                  onPurchased(tokens, title);
                }}
                onError={setPayError}
              />
            </Elements>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid items-stretch gap-4 pt-3 sm:grid-cols-3">
              {packages.map((pack) => {
                const active = Boolean(activePackageId && pack._id === activePackageId);
                const popular = !active && isPopularPackage(pack, packages);
                const perks = packagePerks(pack);
                return (
                  <div
                    key={pack._id}
                    className={`relative flex h-full flex-col rounded-2xl border p-5 pt-6 transition-all duration-300 hover:-translate-y-1 ${
                      active
                        ? "border-[#F6075A] bg-gradient-to-b from-[#F6075A]/8 to-white shadow-[0_12px_28px_-16px_rgba(246,7,90,0.55)] ring-2 ring-[#F6075A]/20"
                        : popular
                          ? "border-[#F6075A] bg-gradient-to-b from-[#F6075A]/8 to-white shadow-[0_12px_28px_-16px_rgba(246,7,90,0.55)]"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {active ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F6075A] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Your plan
                      </span>
                    ) : popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F6075A] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Most chosen
                      </span>
                    ) : null}
                    <p className="text-sm font-semibold text-gray-900">{pack.title}</p>
                    {pack.description ? (
                      <p className="mt-1 min-h-[40px] text-xs leading-relaxed text-gray-500">
                        {pack.description}
                      </p>
                    ) : null}
                    <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                      ${pack.price.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#F6075A]">
                      {formatTokenCount(pack.tokenAmount)} tokens
                    </p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2 text-xs leading-snug text-gray-600"
                        >
                          <CheckOutlined className="mt-0.5 text-[10px] text-[#F6075A]" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => startCheckout(pack)}
                      disabled={startingId === pack._id}
                      className={`mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
                        active || popular
                          ? "bg-[#F6075A] text-white hover:brightness-110"
                          : "bg-gray-900 text-white hover:bg-black"
                      }`}
                    >
                      {startingId === pack._id ? "Starting…" : active ? "Buy again" : "Buy pack"}
                    </button>
                  </div>
                );
              })}
            </div>
            {packages.length === 0 ? (
              <p className="text-sm text-gray-500">No packs are available yet.</p>
            ) : null}
            <p className="mt-12 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
              Tokens stay in this business wallet until you spend them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
