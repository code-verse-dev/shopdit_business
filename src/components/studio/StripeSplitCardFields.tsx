import { CardCvcElement, CardExpiryElement, CardNumberElement } from "@stripe/react-stripe-js";

const elementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      lineHeight: "24px",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

const fieldWrapClass =
  "min-h-[48px] rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-colors focus-within:border-[#F6075A] focus-within:ring-2 focus-within:ring-[#F6075A]/10";

export function StripeSplitCardFields() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Card number
        </span>
        <div className={fieldWrapClass}>
          <CardNumberElement options={elementOptions} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Expiry
          </span>
          <div className={fieldWrapClass}>
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            CVC
          </span>
          <div className={fieldWrapClass}>
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
