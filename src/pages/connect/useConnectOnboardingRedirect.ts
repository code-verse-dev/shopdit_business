import { useCreateConnectOnboardingLinkMutation } from "../../redux/services/subscriptionService";
import { getAppBaseUrl } from "../../utils/appBaseUrl";

export function useConnectOnboardingRedirect() {
  const [createLink, { isLoading }] = useCreateConnectOnboardingLinkMutation();

  const startOnboarding = async () => {
    const base = getAppBaseUrl();
    const result = await createLink({
      refreshUrl: `${base}/connect/refresh`,
      returnUrl: `${base}/connect/return`,
    }).unwrap();
    const url = result?.data?.url ?? result?.url;
    if (!url || typeof url !== "string") {
      throw new Error("No onboarding URL returned from the server.");
    }
    window.location.href = url;
  };

  return { startOnboarding, isStarting: isLoading };
}
