import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Image, message } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  PaperClipOutlined,
  PictureOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { BsStars } from "react-icons/bs";
import {
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlinePhoto,
} from "react-icons/hi2";
import { UPLOADS_URL } from "../../constants/api";
import {
  aiErrorMessage,
  formatTokenCount,
  paginatedDocs,
  useCreateAiConversationMutation,
  useGenerateAiImageMutation,
  useGetAiConversationQuery,
  useGetAiConversationsQuery,
  useGetAiWalletQuery,
  useSendAiMessageMutation,
  type AiFile,
  type AiMessage,
} from "../../redux/services/aiService";
import StudioBuyTokens from "./StudioBuyTokens";

const PROMPTS = [
  {
    title: "Shop flyer",
    body: "Weekend specials that sound like your counter, not a template.",
    draft: "Write a Saturday flyer for my shop: headline, three specials, hours, and a closing line.",
    icon: HiOutlineDocumentText,
  },
  {
    title: "Hiring post",
    body: "A job listing people will actually finish reading.",
    draft: "Draft a barista job post: role, three must-haves, vibe of the shop, and how to apply.",
    icon: HiOutlineBriefcase,
  },
  {
    title: "Visual concept",
    body: "A print-ready image idea beside the copy.",
    draft: "Generate a storefront graphic: warm evening light, chalkboard specials, local crowd.",
    icon: HiOutlinePhoto,
    image: true,
  },
];

function ticketAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * 19) % 360;
  return `hsl(${hash} 72% 62%)`;
}

function attachmentName(file: AiFile | string) {
  if (typeof file === "string") return file;
  return file.originalName || file.filename || "file";
}

function attachmentKind(file: AiFile | string): "document" | "image" {
  if (typeof file === "string") return "document";
  return file.kind === "image" ? "image" : "document";
}

function attachmentSrc(file: AiFile | string) {
  if (typeof file === "string") return file ? UPLOADS_URL + file : "";
  return file.filename ? UPLOADS_URL + file.filename : "";
}

type BriefAttachment = {
  name: string;
  kind: "document" | "image";
  src?: string;
  previewUrl?: string;
};

function PreviewableImage({
  src,
  alt,
  variant,
}: {
  src: string;
  alt: string;
  variant: "thumb" | "dock" | "print";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      rootClassName={`studio-preview-${variant}`}
      preview={{ mask: "Preview" }}
    />
  );
}

function BriefMedia({
  content,
  attachments = [],
}: {
  content?: string;
  attachments?: BriefAttachment[];
}) {
  const images = attachments.filter((a) => a.kind === "image" && (a.previewUrl || a.src));
  const docs = attachments.filter((a) => a.kind !== "image");
  return (
    <>
      {images.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          <Image.PreviewGroup>
            {images.map((a, i) => (
              <PreviewableImage
                key={`${a.name}-${i}`}
                src={a.previewUrl || a.src || ""}
                alt={a.name}
                variant="thumb"
              />
            ))}
          </Image.PreviewGroup>
        </div>
      ) : null}
      {content ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      ) : null}
      {docs.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {docs.map((a, i) => (
            <span
              key={`${a.name}-${i}`}
              className="rounded-full bg-white/12 px-2.5 py-0.5 text-[11px] text-white/85"
            >
              Ref · {a.name}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}

function InkMeter({ remaining, spentPct }: { remaining: number; spentPct: number }) {
  const left = Math.max(0, Math.min(100, 100 - spentPct));
  return (
    <span className="relative flex h-11 w-11 items-center justify-center">
      <svg viewBox="0 0 36 36" className="studio-ink-ring absolute inset-0">
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(22,13,28,0.08)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="#f6075a"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${left} 100`}
          pathLength="100"
        />
      </svg>
      <span className="text-[10px] font-bold tracking-tight text-[#160d1c]">
        {formatTokenCount(remaining)}
      </span>
    </span>
  );
}

export default function ShopDitStudio() {
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [imageMode, setImageMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<{
    content: string;
    attachments: BriefAttachment[];
  } | null>(null);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [pendingPreviews, setPendingPreviews] = useState<
    { file: File; url: string; isImage: boolean }[]
  >([]);
  const promptedRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: walletRes } = useGetAiWalletQuery();
  const wallet = walletRes?.data;
  const { data: listRes, isLoading: listLoading } = useGetAiConversationsQuery();
  const conversations = paginatedDocs(listRes?.data);

  const { data: threadRes, isFetching: threadLoading } = useGetAiConversationQuery(
    activeId ?? "",
    { skip: !activeId }
  );
  const active = threadRes?.data?.conversation;
  const messages = paginatedDocs(threadRes?.data?.messages);

  const [createConversation] = useCreateAiConversationMutation();
  const [sendMessage] = useSendAiMessageMutation();
  const [generateImage] = useGenerateAiImageMutation();

  useEffect(() => {
    if (searchParams.get("buy") !== "1") return;
    setPackagesOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("buy");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (promptedRef.current || !wallet) return;
    const unused =
      (wallet.availableTokens || 0) <= 0 &&
      (wallet.lifetimePurchased || 0) <= 0 &&
      (wallet.lifetimeGranted || 0) <= 0;
    if (!unused) return;
    promptedRef.current = true;
    setPackagesOpen(true);
  }, [wallet]);

  useEffect(() => {
    if (!activeId && conversations[0]?._id) {
      setActiveId(conversations[0]._id);
    }
  }, [activeId, conversations]);

  useEffect(() => {
    const next = pendingFiles.map((file) => ({
      file,
      isImage: file.type.startsWith("image/"),
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    setPendingPreviews(next);
    return () => {
      next.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [pendingFiles]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending, pendingUser, activeId]);

  const spentPct = useMemo(() => {
    if (!wallet) return 0;
    const pool = Math.max(1, wallet.lifetimePurchased + wallet.lifetimeGranted);
    return Math.min(100, Math.round((wallet.lifetimeSpent / pool) * 100));
  }, [wallet]);

  const startNewChat = async () => {
    try {
      const res = await createConversation({ title: "New chat" }).unwrap();
      const id = res.data?._id;
      if (id) setActiveId(id);
      setDraft("");
      setPendingFiles([]);
      setImageMode(false);
    } catch (err: unknown) {
      messageApi.error(aiErrorMessage(err, "Could not start a chat."));
    }
  };

  const ensureConversation = async () => {
    if (activeId) return activeId;
    const res = await createConversation({ title: "New chat" }).unwrap();
    const id = res.data?._id;
    if (!id) throw new Error("Could not start a chat.");
    setActiveId(id);
    return id;
  };

  const applyPrompt = (item: (typeof PROMPTS)[number]) => {
    setDraft(item.draft);
    setImageMode(Boolean(item.image));
  };

  const copyProof = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
    } catch {
      messageApi.error("Could not copy.");
    }
  };

  const send = async () => {
    const text = draft.trim();
    if ((!text && !pendingFiles.length) || sending) return;

    const estimate = imageMode ? 4000 : 80;
    if (wallet && wallet.availableTokens < estimate) {
      setPackagesOpen(true);
      messageApi.warning("Not enough tokens — pick a pack to continue.");
      return;
    }

    const files = pendingFiles;
    const attachments: BriefAttachment[] = files.map((f) => ({
      name: f.name,
      kind: f.type.startsWith("image/") ? "image" : "document",
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setPendingUser({
      content: text || (imageMode ? "Generate an image" : "See attached files."),
      attachments,
    });
    setDraft("");
    setPendingFiles([]);
    setSending(true);

    try {
      const conversationId = await ensureConversation();
      if (imageMode) {
        if (!text) throw new Error("Describe the image to generate.");
        await generateImage({ conversationId, prompt: text, files }).unwrap();
      } else {
        await sendMessage({ conversationId, content: text, files }).unwrap();
      }
      setImageMode(false);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 402) {
        setPackagesOpen(true);
        messageApi.warning("Not enough tokens — pick a pack to continue.");
      } else {
        messageApi.error(aiErrorMessage(err, "Studio could not complete that turn."));
      }
    } finally {
      attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
      setPendingUser(null);
      setSending(false);
    }
  };

  const showEmpty = !activeId || (messages.length === 0 && !pendingUser && !threadLoading);
  const activeIndex = conversations.findIndex((c) => c._id === activeId);

  return (
    <div className="studio-shell studio-canvas relative -m-4 flex h-[calc(100dvh-64px)] min-h-[520px] flex-col overflow-hidden md:-m-6 lg:h-[calc(100dvh-76px)]">
      {contextHolder}

      <div className="studio-orb pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-[#fcd34d]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-10 h-40 w-40 rounded-full bg-[#f6075a]/10 blur-3xl" />

      <header className="relative z-10 shrink-0 px-4 pt-4 md:px-7 md:pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6075a]">
              On press
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-[#160d1c] md:text-2xl">
              {active?.title ?? "Make something"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPackagesOpen(true)}
            className="flex items-center gap-2 rounded-full border border-black/8 bg-white/75 py-1 pl-1 pr-3 shadow-sm backdrop-blur"
          >
            <InkMeter remaining={wallet?.availableTokens ?? 0} spentPct={spentPct} />
            <span className="hidden text-left sm:block">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-black/40">
                Ink left
              </span>
              <span className="text-xs font-semibold text-[#160d1c]">Top up</span>
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="studio-queue flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 pr-2">
            {listLoading && conversations.length === 0 ? (
              <p className="px-1 text-xs text-black/35">Pulling jobs…</p>
            ) : null}
            {conversations.map((c, index) => {
              const selected = c._id === activeId;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setActiveId(c._id)}
                  style={{ ["--ticket-accent" as string]: ticketAccent(c._id) }}
                  className={`studio-queue-ticket min-w-[132px] max-w-[180px] rounded-xl px-2.5 py-1.5 text-left transition-all duration-300 ${
                    selected
                      ? "bg-white shadow-[0_10px_24px_-16px_rgba(22,13,28,0.45)] ring-1 ring-black/5"
                      : "bg-white/45 hover:bg-white/80"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`shrink-0 text-[10px] font-semibold ${
                        selected ? "text-[#f6075a]" : "text-black/35"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[13px] font-medium text-[#160d1c]">
                      {c.title?.trim() || "New chat"}
                    </span>
                  </span>
                </button>
              );
            })}
            {!listLoading && conversations.length === 0 ? (
              <p className="px-1 text-xs text-black/35">No briefs yet — pin one to start.</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={startNewChat}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-dashed border-[#160d1c]/20 bg-white/70 px-3 text-sm font-semibold text-[#160d1c] transition-all duration-300 hover:-translate-y-px hover:border-[#f6075a] hover:text-[#f6075a]"
          >
            <PlusOutlined />
            <span className="hidden sm:inline">New brief</span>
          </button>
        </div>
        {activeIndex >= 0 ? (
          <p className="mt-2 text-[11px] text-black/35">
            {conversations.length} open · currently job {String(activeIndex + 1).padStart(2, "0")}
          </p>
        ) : null}
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4 md:px-8">
        <div key={activeId ?? "empty"} className="studio-thread-in mx-auto max-w-3xl space-y-6 pb-4">
          {showEmpty ? (
            <div className="pt-8 text-center md:pt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f6075a]">
                ShopDit Studio
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#160d1c] md:text-5xl">
                The press is waiting.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/50">
                Switch jobs along the strip above. Briefs come back as proofs you can copy
                into a flyer, listing, or post.
              </p>
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                {PROMPTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => applyPrompt(item)}
                      className="group rounded-3xl border border-black/8 bg-white/70 p-4 text-left shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#f6075a]/40 hover:shadow-[0_18px_40px_-24px_rgba(246,7,90,0.55)]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#160d1c] text-white transition-transform duration-300 group-hover:scale-105">
                        <Icon className="text-lg" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-[#160d1c]">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/45">{item.body}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {messages.map((msg: AiMessage) =>
            msg.role === "user" ? (
              <div key={msg._id} className="studio-msg-user flex justify-end">
                <div className="studio-brief max-w-[min(100%,34rem)] rounded-3xl rounded-tr-md px-5 py-4 text-white">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f9a8d4]">
                    Brief
                  </p>
                  <BriefMedia
                    content={msg.content}
                    attachments={(msg.attachments ?? []).map((a) => ({
                      name: attachmentName(a),
                      kind: attachmentKind(a),
                      src: attachmentKind(a) === "image" ? attachmentSrc(a) : undefined,
                    }))}
                  />
                </div>
              </div>
            ) : (
              <div key={msg._id} className="studio-msg-ai">
                <article className="studio-proof max-w-[min(100%,40rem)] rounded-3xl border border-black/6 px-5 py-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6075a]">
                      <BsStars /> Proof
                    </p>
                    <div className="flex items-center gap-2">
                      {msg.tokensCharged ? (
                        <span className="rounded-full bg-[#160d1c]/6 px-2 py-0.5 text-[10px] font-medium text-black/45">
                          −{formatTokenCount(msg.tokensCharged)} ink
                        </span>
                      ) : null}
                      {msg.content ? (
                        <button
                          type="button"
                          onClick={() => copyProof(msg._id, msg.content || "")}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-black/35 transition-colors hover:bg-black/5 hover:text-[#160d1c]"
                          aria-label="Copy proof"
                        >
                          {copiedId === msg._id ? <CheckOutlined /> : <CopyOutlined />}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {msg.content ? (
                    <p className="text-[15px] leading-7 whitespace-pre-wrap text-[#241820]">
                      {msg.content}
                    </p>
                  ) : null}
                  {msg.imageUrls?.length ? (
                    <Image.PreviewGroup>
                      {msg.imageUrls.map((filename) => (
                        <figure
                          key={filename}
                          className="studio-print studio-img-in mt-4 overflow-hidden rounded-2xl p-2"
                        >
                          <PreviewableImage
                            src={UPLOADS_URL + filename}
                            alt="Studio print"
                            variant="print"
                          />
                          <figcaption className="px-1 pt-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/35">
                            Studio print
                          </figcaption>
                        </figure>
                      ))}
                    </Image.PreviewGroup>
                  ) : null}
                </article>
              </div>
            )
          )}

          {pendingUser ? (
            <div className="studio-msg-user flex justify-end">
              <div className="studio-brief max-w-[min(100%,34rem)] rounded-3xl rounded-tr-md px-5 py-4 text-white">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f9a8d4]">
                  Brief
                </p>
                <BriefMedia
                  content={pendingUser.content}
                  attachments={pendingUser.attachments}
                />
              </div>
            </div>
          ) : null}

          {sending && (
            <div className="studio-msg-ai">
              <article className="studio-proof max-w-sm rounded-3xl border border-black/6 px-5 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6075a]">
                  On press
                </p>
                <p className="mt-2 text-sm text-black/50">Typesetting your proof…</p>
                <div className="mt-4 space-y-2">
                  <div className="studio-typeset-bar" />
                  <div className="h-2 w-2/3 rounded-full bg-black/8" />
                  <div className="h-2 w-1/2 rounded-full bg-black/6" />
                </div>
              </article>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-10 px-4 pb-4 md:px-8 md:pb-5">
        <div className={`studio-dock mx-auto max-w-3xl rounded-[28px] p-3 ${imageMode ? "is-image" : ""}`}>
          <div className="mb-2 flex gap-1">
            <button
              type="button"
              onClick={() => setImageMode(false)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                !imageMode ? "bg-[#160d1c] text-white" : "text-black/40 hover:text-[#160d1c]"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setImageMode(true)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                imageMode ? "bg-[#f6075a] text-white" : "text-black/40 hover:text-[#160d1c]"
              }`}
            >
              Image
            </button>
          </div>
          {pendingPreviews.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              <Image.PreviewGroup>
                {pendingPreviews
                  .filter((item) => item.isImage)
                  .map((item) => (
                    <span
                      key={item.file.name + item.file.size}
                      className="relative inline-block"
                    >
                      <PreviewableImage
                        src={item.url}
                        alt={item.file.name}
                        variant="dock"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((list) => list.filter((x) => x !== item.file))
                        }
                        className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#160d1c] text-white"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <CloseOutlined className="text-[9px]" />
                      </button>
                    </span>
                  ))}
              </Image.PreviewGroup>
              {pendingPreviews
                .filter((item) => !item.isImage)
                .map((item) => (
                  <span
                    key={item.file.name + item.file.size}
                    className="studio-chip-in inline-flex items-center gap-1 rounded-full bg-[#160d1c]/6 px-2.5 py-1 text-xs text-[#160d1c]"
                  >
                    {item.file.name}
                    <button
                      type="button"
                      onClick={() =>
                        setPendingFiles((list) => list.filter((x) => x !== item.file))
                      }
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <CloseOutlined className="text-[10px]" />
                    </button>
                  </span>
                ))}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={imageMode ? "image/*" : ".pdf,.doc,.docx,.txt,image/*"}
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).slice(0, 5);
              setPendingFiles((prev) => [...prev, ...files].slice(0, 5));
              e.target.value = "";
            }}
          />
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-black/40 transition-colors hover:bg-black/5 hover:text-[#160d1c]"
              aria-label="Attach files"
            >
              <PaperClipOutlined />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={
                imageMode
                  ? "Describe the print: lighting, setting, mood…"
                  : "Drop a brief — flyer, job post, listing…"
              }
              className="max-h-36 min-h-[52px] flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 text-[#160d1c] outline-none placeholder:text-black/30"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6075a] text-white shadow-[0_10px_24px_-10px_rgba(246,7,90,0.9)] transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Send"
            >
              {imageMode ? <PictureOutlined /> : <SendOutlined />}
            </button>
          </div>
        </div>
      </div>

      <StudioBuyTokens
        open={packagesOpen}
        onClose={() => setPackagesOpen(false)}
        activePackageId={wallet?.lastPurchase?.packageId}
        activePackageTitle={wallet?.lastPurchase?.packageTitle}
        onPurchased={(tokens, title) => {
          setPackagesOpen(false);
          messageApi.success(`${title} added · ${formatTokenCount(tokens)} tokens`);
        }}
      />
    </div>
  );
}
