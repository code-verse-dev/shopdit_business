import { useState } from "react";
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
import { Button } from "antd";
import { Building2, CheckCircle2, CreditCard, Loader2, Plug } from "lucide-react";
import SubscriptionPaymentModal from "../../components/subscription/SubscriptionPaymentModal";
import type { PlanForPayment } from "../../components/subscription/SubscriptionPaymentModal";
import { ErrorPopup } from "../../components/popup/Popup";
import { getAppBaseUrl } from "../../utils/appBaseUrl";
import { isConnectPayoutReady, parseConnectAccountStatus } from "../connect/connectStatus";

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

  const noSubscription = !subscriptionLoading && subscriptionError && (subscriptionErr as any)?.status === 404;
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
          onSubscriptionDone={async () => {
            await refetchSubscription();
            await refetchConnectStatus();
          }}
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

/** Shown when user has no subscription: plans only (no business profile CTA until they subscribe). */
function BusinessSetupWizard({
  subscriptionMissing,
  connectReady,
  isCheckingConnect,
  onSubscriptionDone,
  onRefreshConnect,
}: {
  subscriptionMissing: boolean;
  connectReady: boolean;
  isCheckingConnect: boolean;
  onSubscriptionDone: () => Promise<void>;
  onRefreshConnect: () => Promise<void>;
}) {
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery(
    undefined,
    { skip: false }
  );
  const [createOnboardingLink, { isLoading: openingConnect }] =
    useCreateConnectOnboardingLinkMutation();
  const [selectedPlan, setSelectedPlan] = useState<PlanForPayment | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const plans = plansData?.data ?? plansData ?? [];
  const setupState = isCheckingConnect
    ? "CHECK_STATUS"
    : subscriptionMissing
    ? "SUBSCRIPTION_PAYMENT"
    : !connectReady
    ? "CONNECT_ONBOARDING"
    : "COMPLETE";

  const handleBuyPlan = (plan: PlanForPayment) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
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
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="h-8 w-8 text-primary-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Business setup wizard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete subscription and Stripe Connect payouts in one continuous flow.
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        Current state: <span className="font-semibold">{setupState}</span>
      </p>

      {subscriptionMissing ? (
        plansLoading ? (
          <p className="text-gray-500 text-sm">Loading plans…</p>
        ) : Array.isArray(plans) && plans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {plans.map((plan: any) => (
              <div
                key={plan._id}
                className="rounded-lg border border-gray-200 dark:border-white/10 p-4 flex flex-col"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {plan.name ?? plan.planName ?? plan.title ?? "Plan"}
                </h3>
                <p className="text-2xl font-bold text-primary-500 mt-1">
                  ${plan.price ?? plan.amount ?? 0}
                  <span className="text-sm font-normal text-gray-500">
                    /{plan.interval ?? "month"}
                  </span>
                </p>
                <Button
                  type="primary"
                  className="mt-4 web-btn"
                  onClick={() => handleBuyPlan(plan)}
                >
                  Pay and continue
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No plans available at the moment.</p>
        )
      ) : !connectReady ? (
        <div className="rounded-lg border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-start gap-3">
            <Plug className="h-5 w-5 mt-0.5 text-primary-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Subscription active. Continue Stripe setup for payouts.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your subscription is done, but payouts are not enabled yet. Continue onboarding to
                complete setup.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="primary"
                  className="web-btn"
                  loading={openingConnect}
                  disabled={openingConnect}
                  onClick={handleStartConnect}
                >
                  Complete Stripe setup
                </Button>
                <Button disabled={openingConnect || isCheckingConnect} onClick={onRefreshConnect}>
                  {isCheckingConnect ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "I have returned, verify now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Setup complete
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Subscription and Stripe Connect payouts are both active.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedPlan && (
        <SubscriptionPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => void onSubscriptionDone()}
          amount={Number(selectedPlan.price ?? selectedPlan.amount ?? 0)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}

/** Shown when user has a subscription but no business profiles: prompt to create one on business profile page. */
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
      <Button
        type="primary"
        size="large"
        className="mt-6 web-btn"
        onClick={onNavigate}
      >
        Go to Business Profile
      </Button>
    </div>
  );
}
