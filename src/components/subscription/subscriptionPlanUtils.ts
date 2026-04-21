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
export function planIntervalToCycle(interval: string | undefined): "monthly" | "yearly" {
  const v = (interval ?? "").toLowerCase();
  if (v === "year" || v === "yearly") return "yearly";
  return "monthly";
}

/** Display-only: raw plan keys → friendly titles (API keys unchanged). */
export function displayPlanKind(plan: PlanForPayment): "Monthly" | "Yearly" {
  const raw = [plan.name, plan.planName, plan.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (raw.includes("shopdit_yearly") || raw.includes("yearly")) return "Yearly";
  if (raw.includes("shopdit_monthly") || raw.includes("monthly")) return "Monthly";
  return planIntervalToCycle(plan.interval) === "yearly" ? "Yearly" : "Monthly";
}

export function modalPlanHeading(plan: PlanForPayment): string {
  return displayPlanKind(plan) === "Yearly" ? "Yearly Plan" : "Monthly Plan";
}

/**
 * API billing cycle for a plan — matches how {@link displayPlanKind} resolves yearly vs monthly
 * (plan name keys like shopdit_yearly, then interval). Use this for UI period labels and
 * create-subscription-payment-intent, not raw interval alone.
 */
export function planToCycle(plan: PlanForPayment): "monthly" | "yearly" {
  return displayPlanKind(plan) === "Yearly" ? "yearly" : "monthly";
}
