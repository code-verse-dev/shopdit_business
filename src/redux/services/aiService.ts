import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";

export type AiApiResponse<T> = {
  status?: boolean;
  message?: string;
  data: T;
};

export type AiPackage = {
  _id: string;
  title: string;
  description?: string;
  tokenAmount: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
};

export type AiLastPurchase = {
  packageId?: string | null;
  packageTitle?: string;
  tokens?: number;
  createdAt?: string;
};

export type AiWallet = {
  _id?: string;
  ownerType?: string;
  ownerId?: string;
  availableTokens: number;
  lifetimePurchased: number;
  lifetimeGranted: number;
  lifetimeSpent: number;
  lastPurchase?: AiLastPurchase | null;
};

export type AiConversation = {
  _id: string;
  title: string;
  model?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AiFile = {
  _id?: string;
  originalName?: string;
  filename?: string;
  mime?: string;
  kind?: "document" | "image";
  size?: number;
};

export type AiMessage = {
  _id: string;
  role: "user" | "assistant" | "system";
  content?: string;
  attachments?: AiFile[] | string[];
  imageUrls?: string[];
  tokensCharged?: number;
  createdAt?: string;
};

export type Paginated<T> = {
  docs?: T[];
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
  totalDocs?: number;
  totalPages?: number;
};

export function paginatedDocs<T>(value: Paginated<T> | T[] | undefined | null): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return Array.isArray(value.docs) ? value.docs : [];
}

export function formatTokenCount(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return Math.round(n).toLocaleString();
}

export function packagePerks(pack: AiPackage): string[] {
  const title = String(pack.title || "").toLowerCase();
  if (title.includes("starter")) {
    return ["Chat + documents", "A few image concepts", "Never expires"];
  }
  if (title.includes("creator")) {
    return ["Chat + documents", "Image generation", "Never expires"];
  }
  if (title.includes("studio")) {
    return ["Heavy image use", "Bulk drafts", "Never expires"];
  }
  return ["Chat + documents", "Image generation", "Never expires"];
}

export function isPopularPackage(pack: AiPackage, all: AiPackage[]) {
  if (all.length < 2) return false;
  const sorted = [...all].sort((a, b) => a.price - b.price);
  const mid = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length / 2))];
  return mid?._id === pack._id;
}

export function aiErrorMessage(err: unknown, fallback = "Something went wrong") {
  const ex = err as {
    status?: number;
    data?: { message?: string; error?: string };
    message?: string;
  };
  return ex?.data?.message || ex?.data?.error || ex?.message || fallback;
}

export function stripePublishableKey(config: unknown): string {
  const payload =
    (config as { data?: Record<string, string> })?.data ??
    (config as Record<string, string>) ??
    {};
  return (
    payload.publishableKey ||
    payload.stripePublishableKey ||
    payload.stripePublishable_key ||
    payload.publicKey ||
    ""
  );
}

export const aiService = createApi({
  reducerPath: "aiService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth?: { token?: string | null } }).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["AiWallet", "AiConversations", "AiConversation"],
  endpoints: (builder) => ({
    getAiPackages: builder.query<AiApiResponse<AiPackage[]>, void>({
      query: () => "/ai/packages",
    }),
    getAiPaymentConfig: builder.query<unknown, void>({
      query: () => "/payment/config",
    }),
    getAiWallet: builder.query<AiApiResponse<AiWallet>, void>({
      query: () => "/ai/wallet",
      providesTags: ["AiWallet"],
    }),
    getAiConversations: builder.query<
      AiApiResponse<Paginated<AiConversation>>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const page = arg?.page || 1;
        const limit = arg?.limit || 50;
        return `/ai/conversations?page=${page}&limit=${limit}`;
      },
      providesTags: ["AiConversations"],
    }),
    getAiConversation: builder.query<
      AiApiResponse<{
        conversation: AiConversation;
        messages: Paginated<AiMessage>;
        files: AiFile[];
      }>,
      string
    >({
      query: (id) => `/ai/conversations/${id}?page=1&limit=100`,
      providesTags: (_res, _err, id) => [{ type: "AiConversation", id }],
    }),
    createAiConversation: builder.mutation<
      AiApiResponse<AiConversation>,
      { title?: string } | void
    >({
      query: (body) => ({
        url: "/ai/conversations",
        method: "POST",
        body: body && typeof body === "object" ? body : {},
      }),
      invalidatesTags: ["AiConversations"],
    }),
    sendAiMessage: builder.mutation<
      AiApiResponse<{
        conversation: AiConversation;
        userMessage: AiMessage;
        assistantMessage: AiMessage;
        tokensCharged: number;
        wallet: AiWallet;
      }>,
      { conversationId: string; content?: string; files?: File[] }
    >({
      query: ({ conversationId, content, files }) => {
        if (files?.length) {
          const form = new FormData();
          if (content) form.append("content", content);
          files.forEach((file) => form.append("files", file));
          return {
            url: `/ai/conversations/${conversationId}/messages`,
            method: "POST",
            body: form,
          };
        }
        return {
          url: `/ai/conversations/${conversationId}/messages`,
          method: "POST",
          body: { content: content || "" },
        };
      },
      invalidatesTags: (_res, _err, arg) => [
        "AiWallet",
        "AiConversations",
        { type: "AiConversation", id: arg.conversationId },
      ],
    }),
    generateAiImage: builder.mutation<
      AiApiResponse<{
        conversation: AiConversation;
        userMessage: AiMessage;
        assistantMessage: AiMessage;
        image: string;
        tokensCharged: number;
        wallet: AiWallet;
      }>,
      { conversationId: string; prompt: string; size?: string }
    >({
      query: ({ conversationId, prompt, size }) => ({
        url: `/ai/conversations/${conversationId}/images`,
        method: "POST",
        body: { prompt, size: size || "1024x1024" },
      }),
      invalidatesTags: (_res, _err, arg) => [
        "AiWallet",
        "AiConversations",
        { type: "AiConversation", id: arg.conversationId },
      ],
    }),
    createAiPurchaseIntent: builder.mutation<
      AiApiResponse<{
        clientSecret: string;
        paymentIntentId: string;
        amount: number;
        currency: string;
        packageId: string;
        tokenAmount: number;
      }>,
      { packageId: string; currency?: string }
    >({
      query: (body) => ({
        url: "/ai/purchase/create-payment-intent",
        method: "POST",
        body,
      }),
    }),
    saveAiPurchase: builder.mutation<
      AiApiResponse<{
        wallet: AiWallet;
        tokensCredited: number;
        package: AiPackage | null;
        idempotent?: boolean;
      }>,
      { paymentIntentId: string; currency?: string }
    >({
      query: (body) => ({
        url: "/ai/purchase/save-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AiWallet"],
    }),
  }),
});

export const {
  useGetAiPackagesQuery,
  useLazyGetAiPaymentConfigQuery,
  useGetAiWalletQuery,
  useGetAiConversationsQuery,
  useGetAiConversationQuery,
  useCreateAiConversationMutation,
  useSendAiMessageMutation,
  useGenerateAiImageMutation,
  useCreateAiPurchaseIntentMutation,
  useSaveAiPurchaseMutation,
} = aiService;
