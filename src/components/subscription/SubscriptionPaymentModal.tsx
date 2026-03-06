import { useState, useCallback } from "react";
import { Modal } from "../ui/modal";
import { Button } from "antd";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useBuySubscriptionMutation } from "../../redux/services/subscriptionService";
import { ImageUrl } from "../../utils/Functions";

/** Luhn (mod 10) check. Input: digits only string. */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

/** Validate expiry MMYY: month 01-12, not expired. */
function validateExpiry(expDate: string): { valid: boolean; message?: string } {
  const digits = expDate.replace(/\D/g, "");
  if (digits.length !== 4) return { valid: false, message: "Enter MM/YY (4 digits)" };
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10);
  if (month < 1 || month > 12) return { valid: false, message: "Invalid month (01–12)" };
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: "Card has expired" };
  }
  return { valid: true };
}

/** Format card number for display: 4-4-4-4. */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** Format expiry for display: MM/YY. */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export type PlanForPayment = {
  _id: string;
  name?: string;
  planName?: string;
  title?: string;
  price?: number;
  amount?: number;
  interval?: string;
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
  onSuccess: () => void;
  amount: number;
  plan: PlanForPayment;
  /** Optional: override cycle; otherwise derived from plan.interval */
  cycle?: "monthly" | "yearly";
}

const MIN_ADDRESS_LENGTH = 5;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  plan,
  cycle: cycleProp,
}: SubscriptionPaymentModalProps) {
  const [buySubscription, { isLoading: paying }] = useBuySubscriptionMutation();
  const cycle = cycleProp ?? planIntervalToCycle(plan.interval);

  const [cardNumberDisplay, setCardNumberDisplay] = useState("");
  const [expiryDisplay, setExpiryDisplay] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setCardNumberDisplay("");
    setExpiryDisplay("");
    setCvv("");
    setAddress("");
    setZip("");
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const runValidations = useCallback((): boolean => {
    const digitsOnly = cardNumberDisplay.replace(/\D/g, "");
    const newErrors: Record<string, string> = {};

    if (digitsOnly.length < 13 || digitsOnly.length > 19) {
      newErrors.cardNumber = "Card number must be 13–19 digits";
    } else if (!luhnCheck(digitsOnly)) {
      newErrors.cardNumber = "Invalid card number";
    }

    const expValidation = validateExpiry(expiryDisplay.replace(/\D/g, ""));
    if (!expValidation.valid) {
      newErrors.expiry = expValidation.message ?? "Invalid expiry";
    }

    const cvvDigits = cvv.replace(/\D/g, "");
    if (cvvDigits.length !== 3 && cvvDigits.length !== 4) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    if (!address.trim()) {
      newErrors.address = "Billing address is required";
    } else if (address.trim().length < MIN_ADDRESS_LENGTH) {
      newErrors.address = `Address must be at least ${MIN_ADDRESS_LENGTH} characters`;
    }

    if (!zip.trim()) {
      newErrors.zip = "ZIP code is required";
    } else if (!ZIP_REGEX.test(zip.trim())) {
      newErrors.zip = "Enter valid ZIP (e.g. 12345 or 12345-6789)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumberDisplay, expiryDisplay, cvv, address, zip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runValidations()) return;

    const cardNumber = cardNumberDisplay.replace(/\D/g, "");
    const expDate = expiryDisplay.replace(/\D/g, ""); // MMYY, no slash
    const cvvDigits = cvv.replace(/\D/g, "");

    const payload = {
      planId: plan._id,
      cycle,
      cardNumber,
      expDate,
      cvv: cvvDigits,
      address: address.trim(),
      zip: zip.trim(),
    };

    try {
      const result = await buySubscription(payload).unwrap();
      const ok = result?.status === true || result?.success === true;
      if (ok) {
        resetForm();
        onSuccess();
        handleClose();
      } else {
        setErrors({ submit: (result as any)?.message ?? "Payment failed" });
      }
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? "Payment failed";
      const gatewayMsg = err?.data?.data?.message ?? err?.data?.data?.gatewayMessage;
      const displayMsg = gatewayMsg ? `${msg}: ${gatewayMsg}` : msg;
      setErrors({ submit: displayMsg });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton className="max-w-md w-full mx-4">
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
              Payment
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {plan.name ?? plan.planName ?? plan.title ?? "Plan"}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              ${Number(amount).toFixed(2)} · Pay with card
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 subscription-payment-form">
          {errors.submit && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Card number
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumberDisplay}
              onChange={(e) => setCardNumberDisplay(formatCardNumber(e.target.value))}
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${
                errors.cardNumber ? "border-red-500 dark:border-red-500" : ""
              }`}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={expiryDisplay}
                onChange={(e) => setExpiryDisplay(formatExpiry(e.target.value))}
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${
                  errors.expiry ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              {errors.expiry && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="•••"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${
                  errors.cvv ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Billing address
            </label>
            <input
              type="text"
              autoComplete="street-address"
              placeholder="123 Main St, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${
                errors.address ? "border-red-500 dark:border-red-500" : ""
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ZIP code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="12345"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${
                errors.zip ? "border-red-500 dark:border-red-500" : ""
              }`}
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.zip}</p>
            )}
          </div>

          <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
            <Lock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            Card details are not stored. Your payment is secure.
          </p>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-11 web-btn"
            loading={paying}
            disabled={paying}
          >
            {paying ? "Processing…" : `Pay $${Number(amount).toFixed(2)}`}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
