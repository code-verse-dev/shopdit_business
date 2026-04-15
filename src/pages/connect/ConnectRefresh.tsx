import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { Button } from "antd";
import { RefreshCw } from "lucide-react";
import { ErrorPopup } from "../../components/popup/Popup";
import { useConnectOnboardingRedirect } from "./useConnectOnboardingRedirect";

/**
 * Stripe redirects here when the onboarding link must be refreshed.
 */
export default function ConnectRefresh() {
  const navigate = useNavigate();
  const { startOnboarding, isStarting } = useConnectOnboardingRedirect();

  const handleContinue = async () => {
    try {
      await startOnboarding();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? e?.message ?? "Could not continue Stripe Connect.");
    }
  };

  return (
    <>
      <PageMeta
        title="Shopdit | Stripe Connect"
        description="Resume Stripe Connect onboarding."
      />
      <div className="max-w-lg mx-auto text-center py-10 px-4">
        <RefreshCw className="h-12 w-12 text-primary-500 mx-auto" />
        <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Continue Stripe setup
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your onboarding session was refreshed or expired. Open Stripe again to finish any remaining
          steps.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button type="primary" className="web-btn" loading={isStarting} onClick={handleContinue}>
            Continue to Stripe
          </Button>
          <Button onClick={() => navigate("/")}>Back to setup wizard</Button>
        </div>
      </div>
    </>
  );
}
