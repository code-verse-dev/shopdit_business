import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { Button } from "antd";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLazyFetchConnectAccountStatusQuery } from "../../redux/services/subscriptionService";
import { isConnectPayoutReady, parseConnectAccountStatus } from "./connectStatus";
import { useConnectOnboardingRedirect } from "./useConnectOnboardingRedirect";
import { ErrorPopup } from "../../components/popup/Popup";

const POLL_MS = 2000;
const MAX_POLLS = 30;

export default function ConnectReturn() {
  const navigate = useNavigate();
  const [fetchStatus] = useLazyFetchConnectAccountStatusQuery();
  const { startOnboarding, isStarting } = useConnectOnboardingRedirect();
  const [ready, setReady] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollCount = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const pollOnce = async () => {
      if (cancelled) return;
      pollCount += 1;
      try {
        const raw = await fetchStatus().unwrap();
        if (cancelled) return;
        setLastError(null);
        const status = parseConnectAccountStatus(raw);
        if (isConnectPayoutReady(status)) {
          setReady(true);
          setStopped(true);
          if (intervalId) clearInterval(intervalId);
          return;
        }
        if (pollCount >= MAX_POLLS) {
          setStopped(true);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (e: any) {
        if (cancelled) return;
        setLastError(e?.data?.message ?? e?.message ?? "Could not load Connect status.");
        setStopped(true);
        if (intervalId) clearInterval(intervalId);
      }
    };

    void pollOnce();
    intervalId = setInterval(() => void pollOnce(), POLL_MS);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchStatus]);

  const handleContinueSetup = async () => {
    try {
      await startOnboarding();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? e?.message ?? "Could not restart Stripe Connect.");
    }
  };

  return (
    <>
      <PageMeta
        title="Shopdit | Stripe Connect"
        description="Confirming your Stripe Connect onboarding status."
      />
      <div className="max-w-lg mx-auto text-center py-8">
        {ready ? (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Stripe setup complete
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your account can accept charges and receive payouts.
            </p>
            <Button type="primary" className="mt-6 web-btn" onClick={() => navigate("/")}>
              Continue to dashboard
            </Button>
          </>
        ) : (
          <>
            {!stopped ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto" />
            ) : null}
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {!stopped ? "Checking your Stripe account…" : "Stripe setup status"}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {!stopped
                ? "We are confirming your onboarding with Stripe. This can take a few seconds."
                : stopped && !lastError
                ? "If charges or payouts are not enabled yet, open Stripe setup again to finish any required steps."
                : null}
            </p>
            {lastError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{lastError}</p>}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button type="primary" className="web-btn" loading={isStarting} onClick={handleContinueSetup}>
                Complete Stripe setup
              </Button>
              <Button onClick={() => navigate("/")}>Back to setup wizard</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
