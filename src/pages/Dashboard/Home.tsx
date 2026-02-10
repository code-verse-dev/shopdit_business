import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import { useSelector } from "react-redux";
import {
  useFetchActiveSubscriptionQuery,
  useBuySubscriptionMutation,
} from "../../redux/services/subscriptionService";
import { useGetPlansQuery } from "../../redux/services/planService";
import { useGetBusinessProfilesQuery } from "../../redux/services/businessService";
import { useNavigate } from "react-router";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { Button } from "antd";
import { Building2, CreditCard } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth?.token);
  const businessId = useSelector((state: any) => state.auth?.user?._id);

  const {
    isError: subscriptionError,
    error: subscriptionErr,
    isLoading: subscriptionLoading,
  } = useFetchActiveSubscriptionQuery(undefined, { skip: !token });

  const { data: profilesData, isLoading: profilesLoading } =
    useGetBusinessProfilesQuery(
      { businessId: businessId!, page: 1, limit: 10 },
      { skip: !businessId }
    );

  const profilesFromApi = profilesData?.data?.docs ?? [];
  const hasProfiles = profilesFromApi.length > 0;

  const noSubscription =
    !subscriptionLoading &&
    (subscriptionError && (subscriptionErr as any)?.status === 404);
  const hasSubscription = !subscriptionLoading && !noSubscription;

  const loadingDashboard =
    subscriptionLoading || (hasSubscription && profilesLoading);

  return (
    <>
      <PageMeta
        title="Shopdit | Business"
        description="This is React.js Ecommerce Dashboard page for Shopdit - React.js Tailwind CSS Admin Dashboard Template"
      />
      <h1 className="text-2xl font-bold py-2">Dashboard</h1>

      {loadingDashboard ? (
        <DashboardLoadingState />
      ) : noSubscription ? (
        <SubscriptionPlansOnly />
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
function SubscriptionPlansOnly() {
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery(
    undefined,
    { skip: false }
  );
  const [buySubscription, { isLoading: buying }] =
    useBuySubscriptionMutation();

  const plans = plansData?.data ?? plansData ?? [];

  const handleBuy = async (planId: string) => {
    try {
      await buySubscription({ planId }).unwrap();
      SuccessPopup("Subscription activated.");
    } catch (err: any) {
      ErrorPopup(err?.data?.message || "Failed to subscribe.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="h-8 w-8 text-primary-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscribe to unlock products, coupons & more
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Events are available without a plan. Subscribe to use products, orders, and business profiles.
          </p>
        </div>
      </div>
      {plansLoading ? (
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
                loading={buying}
                onClick={() => handleBuy(plan._id)}
              >
                Buy plan
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No plans available at the moment.</p>
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
