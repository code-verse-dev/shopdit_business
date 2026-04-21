/** Normalize connect-account-status API payload (wrapped or flat). */
export function parseConnectAccountStatus(raw: unknown) {
  const payload = (raw as any)?.data ?? raw ?? {};
  return {
    hasConnectAccount: Boolean(payload.hasConnectAccount),
    chargesEnabled: Boolean(payload.chargesEnabled),
    payoutsEnabled: Boolean(payload.payoutsEnabled),
    detailsSubmitted: Boolean(payload.detailsSubmitted),
    currentlyDue: payload.currentlyDue as unknown[] | undefined,
    pastDue: payload.pastDue as unknown[] | undefined,
    disabledReason: payload.disabledReason as string | null | undefined,
    linkType: payload.linkType as string | undefined,
  };
}

export function isConnectPayoutReady(status: ReturnType<typeof parseConnectAccountStatus>) {
  return status.chargesEnabled && status.payoutsEnabled;
}
