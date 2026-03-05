import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Progress, Skeleton } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Pencil, Layers, Upload, ArrowDownToLine } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  useGetFlyerQuery,
  usePublishFlyerMutation,
  useUnpublishFlyerMutation,
  // useDeleteFlyerMutation, // commented out with Delete button
} from "../../redux/services/flyersService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { UPLOADS_URL } from "../../constants/api";

function productImageSrc(p: any): string | null {
  const img = p?.image ?? p?.thumbnail;
  if (!img) return null;
  if (typeof img === "string" && (img.startsWith("http") || img.startsWith("//"))) return img;
  return `${UPLOADS_URL}${img}`;
}

function imageUrlSrc(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${UPLOADS_URL}${url}`;
}

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

function formatValidityDates(start: string | undefined, end: string | undefined): string {
  if (!start && !end) return "—";
  try {
    const s = start ? new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const e = end ? new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    return `${s} – ${e}`;
  } catch {
    return "—";
  }
}

function parseSlotKey(slotKey: string | undefined): { row: number; col: number } | null {
  if (!slotKey || typeof slotKey !== "string") return null;
  const m = slotKey.trim().match(/slot_(\d+)_(\d+)/i);
  if (!m) return null;
  const row = parseInt(m[1], 10);
  const col = parseInt(m[2], 10);
  if (Number.isNaN(row) || Number.isNaN(col)) return null;
  return { row, col };
}

function normalizeSlotForDisplay(slot: any, index: number, columns: number): any {
  const tpl = slot.template_slot_id ?? slot.templateSlotId ?? {};
  const pos = tpl.position ?? slot.position;
  const slotKey = slot.slot_key ?? slot.slotKey ?? tpl.slot_key ?? tpl.slotKey;
  let gridColumn = slot.gridColumn ?? slot.grid_column;
  let gridRow = slot.gridRow ?? slot.grid_row;
  if (gridColumn == null || gridRow == null) {
    if (typeof pos === "number") {
      gridColumn = (pos % columns) + 1;
      gridRow = Math.floor(pos / columns) + 1;
    } else if (pos && typeof pos === "object") {
      const row = pos.row ?? pos.gridRow ?? pos.grid_row;
      const col = pos.col ?? pos.column ?? pos.gridColumn ?? pos.grid_column;
      if (row != null && col != null) {
        gridRow = Number(row) + 1;
        gridColumn = Number(col) + 1;
      } else {
        const fromKey = parseSlotKey(slotKey);
        if (fromKey) {
          gridRow = fromKey.row + 1;
          gridColumn = fromKey.col + 1;
        } else {
          gridColumn = (index % columns) + 1;
          gridRow = Math.floor(index / columns) + 1;
        }
      }
    } else {
      const fromKey = parseSlotKey(slotKey);
      if (fromKey) {
        gridRow = fromKey.row + 1;
        gridColumn = fromKey.col + 1;
      } else {
        gridColumn = (index % columns) + 1;
        gridRow = Math.floor(index / columns) + 1;
      }
    }
  }
  const product = slot.product ?? (slot.product_id && typeof slot.product_id === "object" ? slot.product_id : null);
  return {
    ...slot,
    slot_type: slot.slot_type ?? slot.slotType ?? tpl.slot_type ?? "product",
    slot_key: slot.slot_key ?? slot.slotKey ?? tpl.slot_key ?? `slot_${index}`,
    gridColumn: gridColumn ?? (index % columns) + 1,
    gridRow: gridRow ?? Math.floor(index / columns) + 1,
    product,
  };
}

export default function FlyerDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: flyerData, isLoading, isError, refetch } = useGetFlyerQuery(id!, { skip: !id });
  const [publishFlyer, { isLoading: publishing }] = usePublishFlyerMutation();
  const [unpublishFlyer, { isLoading: unpublishing }] = useUnpublishFlyerMutation();
  // const [deleteFlyer, { isLoading: deleting }] = useDeleteFlyerMutation();

  const flyer = flyerData?.data ?? flyerData;
  const template = flyer?.flyer_template_id ?? flyer?.template ?? flyer?.layout ?? {};
  const layoutConfig = template?.layout_config ?? template?.layoutConfig ?? {};
  const columns = layoutConfig?.columns ?? 4;
  const rows = layoutConfig?.rows ?? 5;
  const gap = layoutConfig?.gap ?? 8;
  const rawSlotAssignments: any[] = flyer?.slot_assignments ?? flyer?.slotAssignments ?? flyer?.slots ?? [];
  const slotAssignments = rawSlotAssignments
    .map((s, i) => normalizeSlotForDisplay(s, i, columns))
    .sort((a, b) => {
      const rowA = Number(a.gridRow ?? a.grid_row ?? 0);
      const rowB = Number(b.gridRow ?? b.grid_row ?? 0);
      if (rowA !== rowB) return rowA - rowB;
      const colA = Number(a.gridColumn ?? a.grid_column ?? 0);
      const colB = Number(b.gridColumn ?? b.grid_column ?? 0);
      return colA - colB;
    });
  const templateName = template?.name ?? template?.title ?? "—";
  const status = flyer?.status ?? "draft";
  // const isDraft = String(status).toLowerCase() === "draft";
  const isPublished = String(status).toLowerCase() === "published";

  const getProductFromSlot = (s: any) =>
    s.product ?? (s.product_id && typeof s.product_id === "object" ? s.product_id : null);
  const slotsFilled = slotAssignments.filter((s) => {
    const t = (s.slot_type ?? s.slotType ?? "").toLowerCase();
    if (t === "product") return !!getProductFromSlot(s) || !!(s.product_id ?? s.productId);
    if (t === "banner" || t === "hero") return !!(s.image_url ?? s.imageUrl);
    return false;
  }).length;
  const slotsTotal = slotAssignments.length || 1;
  const progressPercent = slotsTotal ? Math.round((slotsFilled / slotsTotal) * 100) : 0;

  const handlePublish = async () => {
    if (!id) return;
    try {
      await publishFlyer(id).unwrap();
      SuccessPopup("Flyer published.");
      refetch();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? "Failed to publish.");
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;
    try {
      await unpublishFlyer(id).unwrap();
      SuccessPopup("Flyer unpublished.");
      refetch();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? "Failed to unpublish.");
    }
  };

  // const handleDelete = () => {
  //   Modal.confirm({
  //     title: "Delete flyer?",
  //     content: "This flyer will be permanently deleted.",
  //     okText: "Delete",
  //     okType: "danger",
  //     cancelText: "Cancel",
  //     onOk: async () => {
  //       try {
  //         await deleteFlyer(id!).unwrap();
  //         SuccessPopup("Flyer deleted.");
  //         navigate("/flyers");
  //       } catch (e: any) {
  //         ErrorPopup(e?.data?.message ?? "Failed to delete.");
  //       }
  //     },
  //   });
  // };

  const isProductSlot = (s: any) => (s.slot_type ?? s.slotType ?? "").toLowerCase() === "product";
  const isBannerOrHero = (s: any) => {
    const t = (s.slot_type ?? s.slotType ?? "").toLowerCase();
    return t === "banner" || t === "hero";
  };

  if (isLoading || !id) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/flyers")} className="!p-0 !text-black dark:!text-white" />
          <h1 className="text-2xl font-semibold">Flyer Details</h1>
        </div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </>
    );
  }

  if (isError || !flyer) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/flyers")} className="!p-0 !text-black dark:!text-white" />
          <h1 className="text-2xl font-semibold">Flyer Details</h1>
        </div>
        <p className="text-red-500 py-4">Failed to load flyer.</p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/flyers")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold">Flyer Details</h1>
      </div>

      {/* Header section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{flyer.title ?? flyer.name ?? "Untitled"}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge color={getFlyerStatusColor(status)}>{status}</Badge>
              {(flyer.zip_code ?? flyer.region) && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{flyer.zip_code ?? flyer.region}</span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatValidityDates(flyer.startDate ?? flyer.start_date, flyer.endDate ?? flyer.end_date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Template: {templateName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="default" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/flyers/${id}/edit`)}>
              Edit Details
            </Button>
            <Button type="primary" icon={<Layers className="h-4 w-4" />} onClick={() => navigate(`/flyers/${id}/build`)} className="web-btn">
              Open Builder
            </Button>
            {isPublished ? (
              <Button icon={<ArrowDownToLine className="h-4 w-4" />} loading={unpublishing} onClick={handleUnpublish}>
                Unpublish
              </Button>
            ) : (
              <Button type="primary" icon={<Upload className="h-4 w-4" />} loading={publishing} onClick={handlePublish} className="web-btn">
                Publish
              </Button>
            )}
            {/* Delete flyer — commented out for now
            {isDraft && (
              <Button danger icon={<Trash2 className="h-4 w-4" />} loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            )}
            */}
          </div>
        </div>
      </div>

      {/* Slots completion progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slots completion</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {slotsFilled} of {slotsTotal} slots filled
          </span>
        </div>
        <Progress percent={progressPercent} showInfo={false} className="mb-0" />
      </div>

      {/* Visual flyer grid (read-only) */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flyer preview</h3>
        <div
          className="mx-auto rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-gray-900/30"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(64px, 1fr))`,
            gap: `${gap}px`,
            padding: `${gap}px`,
            maxWidth: 720,
          }}
        >
          {slotAssignments.map((slot: any) => {
            const gc = slot.gridColumn ?? slot.grid_column ?? "auto";
            const gr = slot.gridRow ?? slot.grid_row ?? "auto";
            const product = slot.product;
            const filledProduct = isProductSlot(slot) && (slot.product_id ?? slot.productId ?? product?._id);
            const filledImage = isBannerOrHero(slot) && (slot.image_url ?? slot.imageUrl);
            const imgSrc = imageUrlSrc(slot.image_url ?? slot.imageUrl);

            return (
              <div
                key={slot._id ?? slot.id ?? slot.slot_key ?? ""}
                className="relative rounded-lg overflow-hidden flex flex-col items-center justify-center text-center min-h-[64px]"
                style={{ gridColumn: gc, gridRow: gr }}
              >
                {isProductSlot(slot) && (
                  <>
                    {filledProduct ? (
                      <>
                        {productImageSrc(product) && (
                          <img
                            src={productImageSrc(product)!}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs">
                        Empty
                      </div>
                    )}
                  </>
                )}
                {isBannerOrHero(slot) && (
                  <>
                    {filledImage && imgSrc ? (
                      <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs">
                        Empty
                      </div>
                    )}
                  </>
                )}
                {!isProductSlot(slot) && !isBannerOrHero(slot) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs">
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot summary table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slot summary</h3>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Slot key</TableCell>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Type</TableCell>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Product / Image</TableCell>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Override price</TableCell>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Badge</TableCell>
                <TableCell isHeader className="px-4 py-3 text-gray-500">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {slotAssignments.map((slot: any) => {
                const t = (slot.slot_type ?? slot.slotType ?? "").toLowerCase();
                const isProduct = t === "product";
                const isBannerHero = t === "banner" || t === "hero";
                const product = getProductFromSlot(slot);
                const filledProduct = isProduct && (slot.product_id ?? slot.productId ?? product?._id);
                const filledImage = isBannerHero && (slot.image_url ?? slot.imageUrl);
                const filled = filledProduct || filledImage;
                const nameOrUrl = isProduct && product
                  ? (product.productName ?? product.name ?? product.product_name ?? "—")
                  : isBannerHero && filledImage
                    ? (slot.image_url ?? slot.imageUrl ?? "—")
                    : "—";
                return (
                  <TableRow key={slot._id ?? slot.id ?? slot.slot_key}>
                    <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {slot.slot_key ?? slot.slotKey ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{slot.slot_type ?? slot.slotType ?? "—"}</TableCell>
                    <TableCell className="px-4 py-3">
                      {isProduct && productImageSrc(product) ? (
                        <div className="flex items-center gap-2">
                          <img src={productImageSrc(product)!} alt="" className="w-10 h-10 object-cover rounded" />
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{nameOrUrl}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[240px] block">{nameOrUrl}</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {(slot.override_price ?? slot.overridePrice) != null
                        ? `$${Number(slot.override_price ?? slot.overridePrice).toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {slot.badge_label ?? slot.badgeLabel ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {filled ? (
                        <Badge color="success">Filled</Badge>
                      ) : (
                        <Badge color="light">Empty</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
