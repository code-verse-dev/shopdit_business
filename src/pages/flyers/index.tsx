import Badge from "../../components/ui/badge/Badge";
import { Button, Input, Pagination, Select, Skeleton, Modal } from "antd";
import { Layers, Pencil, Trash2, Upload, ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import {
  useGetFlyersQuery,
  useDeleteFlyerMutation,
  usePublishFlyerMutation,
  useUnpublishFlyerMutation,
} from "../../redux/services/flyersService";
import usePagination from "../../utils/usePagination";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

function getFlyerStatusColor(
  status: string
): "success" | "warning" | "error" | "primary" | "info" | "light" | "dark" {
  switch (String(status).toLowerCase()) {
    case "published":
      return "success";
    case "draft":
      return "light";
    case "expired":
      return "error";
    case "archived":
      return "warning";
    default:
      return "primary";
  }
}

function formatDate(val: string | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function Flyers() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessProfileId =
    user?.activeProfile ?? user?.businessProfiles?.[0]?._id;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(9);

  const { data, isLoading, isFetching, isError, refetch } = useGetFlyersQuery(
    {
      page: pageNumber,
      limit,
      status: statusFilter || undefined,
      search: search.trim() || undefined,
      businessProfileId: businessProfileId ?? undefined,
    },
    { skip: !businessProfileId }
  );

  const [deleteFlyer, { isLoading: isDeleting }] = useDeleteFlyerMutation();
  const [publishFlyer, { isLoading: isPublishing }] = usePublishFlyerMutation();
  const [unpublishFlyer, { isLoading: isUnpublishing }] =
    useUnpublishFlyerMutation();

  useEffect(() => {
    const total = data?.data?.totalDocs ?? data?.totalDocs ?? 0;
    updateTotalDocs(total);
  }, [data?.data?.totalDocs, data?.totalDocs, updateTotalDocs]);

  const docs = data?.data?.docs ?? data?.data ?? data?.docs ?? data ?? [];
  const list = Array.isArray(docs) ? docs : [];
  const res = data?.data ?? data ?? {};
  const stats = res.stats ?? res.statusCounts ?? res.counts ?? null;
  const totalFlyers = res.totalDocs ?? res.total ?? data?.totalDocs ?? data?.total ?? 0;

  // Helper to get count from stats array, e.g. [{ status: 'published', count: 2 }, ...]
  const getCountFromArray = (status: string) => {
    const arr = Array.isArray(stats) ? stats : Array.isArray(res.statusCounts) ? res.statusCounts : null;
    if (!arr) return undefined;
    const entry = arr.find((s: any) => String(s?.status ?? s?.name ?? "").toLowerCase() === status);
    return entry?.count ?? entry?.total ?? undefined;
  };

  const publishedCount =
    stats?.published ?? stats?.publishedCount ?? res.published ?? res.publishedCount ?? getCountFromArray("published") ?? 0;
  const draftCount =
    stats?.draft ?? stats?.draftCount ?? res.draft ?? res.draftCount ?? getCountFromArray("draft") ?? 0;
  const expiredCount =
    stats?.expired ?? stats?.expiredCount ?? res.expired ?? res.expiredCount ?? getCountFromArray("expired") ?? 0;

  const handleDelete = useCallback(
    (flyer: any) => {
      const rawId = flyer._id ?? flyer.id;
      const flyerId =
        rawId == null
          ? null
          : typeof rawId === "string"
          ? rawId
          : String((rawId as any)?.toString?.() ?? rawId);
      if (!flyerId || flyerId === "[object Object]") return;
      Modal.confirm({
        title: "Delete flyer?",
        content: `"${
          flyer.title ?? flyer.name ?? "This flyer"
        }" will be permanently deleted. Only draft flyers can be deleted.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteFlyer(flyerId).unwrap();
            SuccessPopup("Flyer deleted.");
            refetch();
          } catch (e: any) {
            ErrorPopup(e?.data?.message ?? "Failed to delete flyer.");
            throw e;
          }
        },
      });
    },
    [deleteFlyer, refetch]
  );

  const handlePublish = useCallback(
    async (_e: React.MouseEvent | null, flyer: any) => {
      _e?.stopPropagation?.();
      const flyerId = flyer._id ?? flyer.id;
      if (!flyerId) return;
      try {
        await publishFlyer(typeof flyerId === "string" ? flyerId : String(flyerId)).unwrap();
        SuccessPopup("Flyer published.");
        refetch();
      } catch (err: any) {
        ErrorPopup(err?.data?.message ?? "Failed to publish flyer.");
      }
    },
    [publishFlyer, refetch]
  );

  const handleUnpublish = useCallback(
    async (_e: React.MouseEvent | null, flyer: any) => {
      _e?.stopPropagation?.();
      const flyerId = flyer._id ?? flyer.id;
      if (!flyerId) return;
      try {
        await unpublishFlyer(typeof flyerId === "string" ? flyerId : String(flyerId)).unwrap();
        SuccessPopup("Flyer unpublished.");
        refetch();
      } catch (err: any) {
        ErrorPopup(err?.data?.message ?? "Failed to unpublish flyer.");
      }
    },
    [unpublishFlyer, refetch]
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">My Flyers</h1>
        <Button className="web-btn" onClick={() => navigate("/flyers/create")}>
          Create Flyer
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Flyers
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mt-0.5">
            {totalFlyers}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
          <p className="text-xl font-semibold text-success-600 dark:text-success-500 mt-0.5">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-0.5">
            {draftCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
          <p className="text-xl font-semibold text-error-600 dark:text-error-500 mt-0.5">
            {expiredCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100 dark:border-white/[0.05]">
          <Input.Search
            placeholder="Search by title"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() => refetch()}
            className="max-w-xs"
          />
          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            className="w-[140px]"
            allowClear
          />
        </div>

        {!businessProfileId ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Select a business profile to manage flyers.
            </p>
          </div>
        ) : isLoading || isFetching ? (
          <div className="p-6 space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-red-500">Failed to load flyers.</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Layers className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No flyers yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Create a flyer to get started.
            </p>
            <Button
              className="web-btn mt-4"
              onClick={() => navigate("/flyers/create")}
            >
              Create Flyer
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.map((flyer: any) => {
                const status = flyer.status ?? flyer.state ?? "draft";
                const isDraft = String(status).toLowerCase() === "draft";
                const isPublished =
                  String(status).toLowerCase() === "published";
                return (
                  <div
                    key={flyer.id ?? flyer._id}
                    className="rounded-xl border border-gray-200 dark:border-white/[0.08] p-4 hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/flyers/${flyer._id ?? flyer.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/flyers/${flyer._id ?? flyer.id}`);
                        }
                      }}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                          {flyer.title ?? flyer.name ?? "Untitled"}
                        </h3>
                        <Badge color={getFlyerStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Template:{" "}
                        {flyer.template_name ??
                          flyer.templateName ??
                          flyer.template ??
                          "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatDate(flyer.start_date ?? flyer.startDate)} →{" "}
                        {formatDate(flyer.end_date ?? flyer.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                        {flyer.zip_code ?? flyer.region ?? flyer.store ?? flyer.regionLabel ?? "—"}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-white/[0.05]">
                      <Button
                        type="text"
                        size="small"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => navigate(`/flyers/${flyer._id ?? flyer.id}`)}
                        className="!p-1 text-gray-600 dark:text-gray-400"
                        title="Edit"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={
                          isPublished ? (
                            <ArrowDownToLine className="h-4 w-4" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )
                        }
                        loading={isPublished ? isUnpublishing : isPublishing}
                        onClick={() => {
                          if (isPublished) handleUnpublish(null, flyer);
                          else handlePublish(null, flyer);
                        }}
                        className="!p-1 text-gray-600 dark:text-gray-400"
                        title={isPublished ? "Unpublish" : "Publish"}
                      />
                      {/* Delete flyer — commented out for now
                      {isDraft && (
                        <Button
                          type="text"
                          size="small"
                          danger
                          loading={isDeleting}
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDelete(flyer)}
                          className="!p-1"
                          title="Delete"
                        />
                      )}
                      */}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center p-4 border-t border-gray-100 dark:border-white/[0.05]">
              <Pagination
                current={pageNumber}
                total={totalDocs}
                pageSize={limit}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
