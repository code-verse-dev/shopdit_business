import { useMemo, type ReactNode } from "react";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import { useSelector } from "react-redux";
import {
  useCreateConnectOnboardingLinkMutation,
  useFetchActiveSubscriptionQuery,
  useFetchConnectAccountStatusQuery,
} from "../../redux/services/subscriptionService";
import { useGetPlansQuery } from "../../redux/services/planService";
import { useGetBusinessProfilesQuery } from "../../redux/services/businessService";
import { useNavigate } from "react-router";
import { Button, Spin } from "antd";
import {
  ArrowRightOutlined,
  BankOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  LockOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Building2 } from "lucide-react";
import {
  displayPlanKind,
  type PlanForPayment,
} from "../../components/subscription/subscriptionPlanUtils";
import { ErrorPopup } from "../../components/popup/Popup";
import { getAppBaseUrl } from "../../utils/appBaseUrl";
import { isConnectPayoutReady, parseConnectAccountStatus } from "../connect/connectStatus";

const PLAN_FEATURES_MONTHLY = [
  "Full dashboard access",
  "List products & services",
  "Manage events & jobs",
  "Customer order management",
  "Loyalty & rewards tools",
  "Cancel anytime",
];

const PLAN_FEATURES_YEARLY = [...PLAN_FEATURES_MONTHLY, "Priority support"];

export default function Home() {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth?.token);
  const businessId = useSelector((state: any) => state.auth?.user?._id);

  const {
    isError: subscriptionError,
    error: subscriptionErr,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useFetchActiveSubscriptionQuery(undefined, { skip: !token });
  const {
    data: connectStatusData,
    isLoading: connectLoading,
    isFetching: connectFetching,
    refetch: refetchConnectStatus,
  } = useFetchConnectAccountStatusQuery(undefined, { skip: !token });

  const { data: profilesData, isLoading: profilesLoading } =
    useGetBusinessProfilesQuery(
      { businessId: businessId!, page: 1, limit: 10 },
      { skip: !businessId }
    );

  const profilesFromApi = profilesData?.data?.docs ?? [];
  const hasProfiles = profilesFromApi.length > 0;

  const noSubscription =
    !subscriptionLoading && subscriptionError && (subscriptionErr as any)?.status === 404;
  const hasSubscription = !subscriptionLoading && !subscriptionError;
  const connectReady = isConnectPayoutReady(parseConnectAccountStatus(connectStatusData));
  const setupComplete = hasSubscription && connectReady;

  const loadingDashboard =
    subscriptionLoading || connectLoading || (setupComplete && profilesLoading);

  return (
    <>
      <PageMeta
        title="Shopdit | Business"
        description="This is React.js Ecommerce Dashboard page for Shopdit - React.js Tailwind CSS Admin Dashboard Template"
      />
      <h1 className="text-2xl font-bold py-2">Dashboard</h1>

      {loadingDashboard ? (
        <DashboardLoadingState />
      ) : !setupComplete ? (
        <BusinessSetupWizard
          subscriptionMissing={Boolean(noSubscription)}
          connectReady={connectReady}
          isCheckingConnect={connectFetching}
          onRefreshConnect={async () => {
            await refetchConnectStatus();
            await refetchSubscription();
          }}
        />
      ) : hasSubscription && !hasProfiles ? (
        <CreateBusinessProfilePrompt onNavigate={() => navigate("/business-profile")} />
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-12">
            <EcommerceMetrics />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <StatisticsChart />
          </div>
          <div className="col-span-12 space-y-6 xl:col-span-6">
            <MonthlySalesChart />
          </div>
        </div>
      )}
    </>
  );
}

function DashboardLoadingState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] p-12 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard…</p>
    </div>
  );
}

type SetupMachineState =
  | "CHECK_STATUS"
  | "SUBSCRIPTION_PAYMENT"
  | "CONNECT_ONBOARDING"
  | "COMPLETE";

function SetupProgress({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const circle = (step: 1 | 2 | 3, Icon: ReactNode, label: string) => {
    const done = step < activeStep;
    const current = step === activeStep;
    const circleClass = done
      ? "w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center"
      : current
        ? "w-10 h-10 rounded-full bg-violet-600/10 border-2 border-violet-600 text-violet-600 flex items-center justify-center"
        : "w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-400 flex items-center justify-center";
    const labelClass =
      done || current
        ? "text-xs font-medium mt-2 text-violet-600 hidden sm:block text-center max-w-[88px]"
        : "text-xs font-medium mt-2 text-gray-400 hidden sm:block text-center max-w-[88px]";
    return (
      <div className="flex flex-col items-center shrink-0">
        <div className={circleClass}>{done ? <CheckOutlined className="text-sm" /> : Icon}</div>
        <span className={labelClass}>{label}</span>
      </div>
    );
  };

  const line = (afterStep: 1 | 2) => {
    const completed = activeStep > afterStep;
    return (
      <div
        className={`flex-1 h-0.5 mx-2 mb-5 sm:mb-5 min-w-[1.5rem] ${completed ? "bg-violet-600" : "bg-gray-200"}`}
      />
    );
  };

  return (
    <div className="flex items-center justify-center mb-10 max-w-xl mx-auto px-2">
      {circle(1, <CreditCardOutlined />, "Choose Plan")}
      {line(1)}
      {circle(2, <BankOutlined />, "Activate Payouts")}
      {line(2)}
      {circle(3, <RocketOutlined />, "Go to Dashboard")}
    </div>
  );
}

function BusinessSetupWizard({
  subscriptionMissing,
  connectReady,
  isCheckingConnect,
  onRefreshConnect,
}: {
  subscriptionMissing: boolean;
  connectReady: boolean;
  isCheckingConnect: boolean;
  onRefreshConnect: () => Promise<void>;
}) {
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery(undefined, { skip: false });
  const [createOnboardingLink, { isLoading: openingConnect }] =
    useCreateConnectOnboardingLinkMutation();
  const navigate = useNavigate();

  const plans = plansData?.data ?? plansData ?? [];

  const setupState: SetupMachineState = isCheckingConnect
    ? "CHECK_STATUS"
    : subscriptionMissing
      ? "SUBSCRIPTION_PAYMENT"
      : !connectReady
        ? "CONNECT_ONBOARDING"
        : "COMPLETE";

  const activeStep: 1 | 2 | 3 =
    setupState === "COMPLETE"
      ? 3
      : setupState === "SUBSCRIPTION_PAYMENT"
        ? 1
        : setupState === "CONNECT_ONBOARDING"
          ? 2
          : setupState === "CHECK_STATUS"
            ? subscriptionMissing
              ? 1
              : 2
            : 1;

  const { monthlyPlan, yearlyPlan } = useMemo(() => {
    const list = Array.isArray(plans) ? (plans as PlanForPayment[]) : [];
    let monthly: PlanForPayment | null = null;
    let yearly: PlanForPayment | null = null;
    for (const p of list) {
      const kind = displayPlanKind(p);
      if (kind === "Yearly" && !yearly) yearly = p;
      else if (kind === "Monthly" && !monthly) monthly = p;
    }
    return { monthlyPlan: monthly, yearlyPlan: yearly };
  }, [plans]);

  const monthlyPrice = monthlyPlan ? Number(monthlyPlan.price ?? monthlyPlan.amount ?? 0) : 0;
  const yearlyPrice = yearlyPlan ? Number(yearlyPlan.price ?? yearlyPlan.amount ?? 0) : 0;
  const annualVsMonthly = monthlyPrice > 0 ? monthlyPrice * 12 : 0;
  const savingsVsMonthly =
    annualVsMonthly > 0 && yearlyPrice > 0 ? Math.max(0, Math.round(annualVsMonthly - yearlyPrice)) : null;
  const savingsPct =
    annualVsMonthly > 0 && yearlyPrice > 0
      ? Math.max(0, Math.round((1 - yearlyPrice / annualVsMonthly) * 100))
      : null;

  const handleBuyPlan = (plan: PlanForPayment) => {
    navigate("/subscription/pay", { state: { plan } });
  };

  const handleStartConnect = async () => {
    try {
      const base = getAppBaseUrl();
      const result = await createOnboardingLink({
        refreshUrl: `${base}/connect/refresh`,
        returnUrl: `${base}/connect/return`,
      }).unwrap();
      const url = result?.data?.url ?? result?.url;
      if (!url || typeof url !== "string") {
        throw new Error("No onboarding URL returned from server.");
      }
      window.location.href = url;
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? err?.message ?? "Could not start Stripe setup.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <SetupProgress activeStep={activeStep} />

      {subscriptionMissing ? (
        plansLoading ? (
          <p className="text-gray-500 text-sm text-center">Loading plans…</p>
        ) : monthlyPlan || yearlyPlan ? (
          <>
            <div className="text-center mb-10">
              <span className="bg-violet-600/10 text-violet-600 rounded-full text-xs uppercase tracking-widest px-3 py-1 inline-block mb-3 font-medium">
                Get started
              </span>
              <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
                Choose your plan
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                Start with a subscription to unlock your business dashboard and reach thousands of
                local customers.
              </p>
            </div>

            <div
              className={`grid gap-6 max-w-2xl mx-auto ${
                monthlyPlan && yearlyPlan ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md"
              }`}
            >
              {yearlyPlan && (
                <div
                  className={`order-1 md:order-2 relative overflow-hidden bg-violet-600 rounded-2xl p-6 md:p-8 shadow-lg shadow-violet-600/25 ${
                    monthlyPlan && yearlyPlan ? "" : "md:max-w-none"
                  }`}
                  key={yearlyPlan._id}
                >
                  <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1">
                    Best Value
                  </span>
                  <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -left-8 -bottom-8 w-32 h-32 rounded-full border border-white/10" />

                  <h3 className="font-bold text-lg text-white">Yearly</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {savingsPct != null
                      ? `Best value. Save ${savingsPct}% compared to monthly.`
                      : "Best value compared to monthly."}
                  </p>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-xl font-bold text-white/70 mb-1">$</span>
                    <span className="text-5xl font-black text-white tracking-tight">
                      {Math.round(yearlyPrice)}
                    </span>
                    <span className="text-sm text-white/70 mb-2">/year</span>
                  </div>
                  {savingsVsMonthly != null && savingsVsMonthly > 0 ? (
                    <span className="bg-white/20 text-white text-xs font-semibold rounded-full px-3 py-1 inline-block mt-2">
                      Save ${savingsVsMonthly} vs monthly
                    </span>
                  ) : null}

                  <div className="border-t border-white/20 my-5" />
                  <ul className="space-y-3">
                    {PLAN_FEATURES_YEARLY.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircleOutlined className="text-sm text-white/80 shrink-0" />
                        <span className="text-sm text-white/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="default"
                    className="mt-6 w-full !h-auto !rounded-xl !py-3 !font-bold !text-sm !bg-white !text-violet-600 hover:!bg-white/90 !border-0 !shadow-md"
                    onClick={() => handleBuyPlan(yearlyPlan)}
                  >
                    Get Started Yearly
                  </Button>
                </div>
              )}

              {monthlyPlan && (
                <div
                  className="order-2 md:order-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm transition-all duration-300 hover:border-violet-600/50 hover:shadow-md"
                  key={monthlyPlan._id}
                >
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Monthly</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Perfect for getting started. Cancel anytime.
                  </p>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-500 mb-1">$</span>
                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                      {Math.round(monthlyPrice)}
                    </span>
                    <span className="text-sm text-gray-400 mb-2">/month</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/10 my-5" />
                  <ul className="space-y-3">
                    {PLAN_FEATURES_MONTHLY.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircleOutlined className="text-sm text-violet-600 shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="default"
                    className="mt-6 w-full !h-auto !rounded-xl !py-3 !font-bold !text-sm !border-2 !border-violet-600 !text-violet-600 hover:!bg-violet-600 hover:!text-white bg-transparent"
                    onClick={() => handleBuyPlan(monthlyPlan)}
                  >
                    Get Started Monthly
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <LockOutlined className="text-gray-300 text-sm" />
                <span className="text-xs text-gray-400">Secured by Stripe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SafetyCertificateOutlined className="text-gray-300 text-sm" />
                <span className="text-xs text-gray-400">SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCardOutlined className="text-gray-300 text-sm" />
                <span className="text-xs text-gray-400">Cancel anytime</span>
              </div>
            </div>
          </>
        ) : Array.isArray(plans) && plans.length > 0 ? (
          <div className="text-center mb-10">
            <span className="bg-violet-600/10 text-violet-600 rounded-full text-xs uppercase tracking-widest px-3 py-1 inline-block mb-3 font-medium">
              Get started
            </span>
            <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
              Choose your plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
              {(plans as PlanForPayment[]).map((plan) => (
                <div
                  key={plan._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm text-left"
                >
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {displayPlanKind(plan)}
                  </h3>
                  <p className="text-3xl font-black text-violet-600 mt-2">
                    ${Number(plan.price ?? plan.amount ?? 0).toFixed(0)}
                    <span className="text-sm font-normal text-gray-400">/{plan.interval ?? "mo"}</span>
                  </p>
                  <Button
                    type="primary"
                    className="mt-6 w-full !bg-violet-600 hover:!bg-violet-700 !border-0"
                    onClick={() => handleBuyPlan(plan)}
                  >
                    Get started
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">No plans available at the moment.</p>
        )
      ) : !connectReady ? (
        <>
          <div className="text-center mb-8">
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-4">
              <CheckCircleOutlined className="text-green-500" />
              <span className="text-sm text-green-600 font-semibold">Subscription Active</span>
            </div>
            <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
              One more step to go
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Set up Stripe payouts to receive payments from customers directly to your bank
              account.
            </p>
          </div>

          <div className="max-w-xl mx-4 sm:mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600/5 to-violet-600/10 px-6 py-5 border-b border-gray-100 dark:border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
                <BankOutlined className="text-violet-600 text-xl" />
              </div>
              <div>
                <p className="font-bold text-base text-gray-900 dark:text-white">Connect Stripe Account</p>
                <p className="text-sm text-gray-400 mt-0.5">Enable payouts from customer orders</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                What this enables:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                    <DollarCircleOutlined className="text-violet-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Receive Payments Directly
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Customer payments go straight to your connected bank account.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                    <ThunderboltOutlined className="text-violet-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Instant Payout Processing
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Get paid quickly with Stripe&apos;s secure transfer system.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                    <BarChartOutlined className="text-violet-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Track Your Earnings
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Monitor all transactions in your Stripe dashboard.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 dark:border-white/10 flex flex-col gap-3">
              <Button
                type="primary"
                className="w-full !h-auto !rounded-xl !py-3 !font-bold !text-sm !bg-violet-600 hover:!bg-violet-700 !shadow-md !shadow-violet-600/25 !border-0 flex items-center justify-center gap-2"
                loading={openingConnect}
                disabled={openingConnect}
                icon={!openingConnect ? <ArrowRightOutlined /> : undefined}
                onClick={handleStartConnect}
              >
                Complete Stripe Setup
              </Button>
              <Button
                type="default"
                className="w-full !h-auto !rounded-xl !py-2.5 !font-medium !text-sm !border-gray-200 hover:!border-violet-600 hover:!text-violet-600 flex items-center justify-center gap-2"
                disabled={openingConnect || isCheckingConnect}
                onClick={() => void onRefreshConnect()}
              >
                {isCheckingConnect ? (
                  <>
                    <Spin size="small" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <SyncOutlined />
                    I have returned, verify now
                  </>
                )}
              </Button>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <LockOutlined className="text-gray-300 text-xs" />
                <span className="text-xs text-gray-400">
                  You&apos;ll be redirected to Stripe&apos;s secure onboarding
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50/80 dark:bg-green-900/20 dark:border-green-800 p-8 text-center max-w-xl mx-auto">
          <CheckCircleOutlined className="text-4xl text-green-500" />
          <p className="mt-4 font-semibold text-lg text-gray-900 dark:text-white">Setup complete</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Subscription and Stripe Connect payouts are both active.
          </p>
        </div>
      )}

    </div>
  );
}

function CreateBusinessProfilePrompt({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-8 text-center">
      <Building2 className="mx-auto h-14 w-14 text-primary-500" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        Create your business profile
      </h2>
      <p className="mt-2 max-w-md mx-auto text-gray-500 dark:text-gray-400">
        You’re subscribed. Add a business profile to start managing events, products, and orders.
      </p>
      <Button type="primary" size="large" className="mt-6 web-btn" onClick={onNavigate}>
        Go to Business Profile
      </Button>
    </div>
  );
}
