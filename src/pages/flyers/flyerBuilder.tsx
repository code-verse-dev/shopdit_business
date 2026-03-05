import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Skeleton,
  Form,
} from "antd";
import { Plus, ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetFlyerQuery,
  usePatchFlyerSlotMutation,
  usePublishFlyerMutation,
} from "../../redux/services/flyersService";
import {
  useGetBusinessProductsQuery,
  useAddProductMutation,
} from "../../redux/services/productService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import Badge from "../../components/ui/badge/Badge";
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

/** Backend slot assignment id only (never name/slot_key or synthetic placeholder id). */
function getSlotAssignmentId(slot: any): string | null {
  if (!slot) return null;
  const raw =
    slot.id ?? slot._id ?? slot.slot_assignment_id ?? slot.slotAssignmentId ?? slot.assignmentId;
  if (raw == null) return null;
  const s =
    typeof raw === "string"
      ? raw.trim()
      : typeof raw === "object" && raw?.toString
        ? String(raw.toString())
        : String(raw);
  if (!s || s.startsWith("placeholder-") || s.startsWith("tpl-")) return null;
  return s;
}

/** Parse slot_key (e.g. "slot_0_0" or "slot_1_2") to row, col. Returns null if not parseable. */
function parseSlotKey(slotKey: string | undefined): { row: number; col: number } | null {
  if (!slotKey || typeof slotKey !== "string") return null;
  const m = slotKey.trim().match(/slot_(\d+)_(\d+)/i);
  if (!m) return null;
  const row = parseInt(m[1], 10);
  const col = parseInt(m[2], 10);
  if (Number.isNaN(row) || Number.isNaN(col)) return null;
  return { row, col };
}

/** Normalize API slot assignment (template_slot_id, populated product_id) for UI. */
function normalizeSlotAssignment(
  assignment: any,
  index: number,
  columns: number
): any {
  const tpl = assignment.template_slot_id ?? assignment.templateSlotId ?? {};
  const pos = tpl.position ?? assignment.position;
  const slotKey = assignment.slot_key ?? assignment.slotKey ?? tpl.slot_key ?? tpl.slotKey;
  let gridColumn = assignment.gridColumn ?? assignment.grid_column;
  let gridRow = assignment.gridRow ?? assignment.grid_row;
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
  const product =
    assignment.product ??
    (assignment.product_id && typeof assignment.product_id === "object" ? assignment.product_id : null);
  const rawId = assignment.id ?? assignment._id ?? assignment.slot_assignment_id ?? assignment.slotAssignmentId;
  const idStr = rawId != null ? (typeof rawId === "string" ? rawId : String(rawId?.toString?.() ?? rawId)) : undefined;
  return {
    ...assignment,
    id: idStr ?? assignment.id ?? assignment._id,
    _id: idStr ?? assignment._id ?? assignment.id,
    slot_type: assignment.slot_type ?? assignment.slotType ?? tpl.slot_type ?? tpl.slotType ?? "product",
    slotType: assignment.slot_type ?? assignment.slotType ?? tpl.slot_type ?? "product",
    slot_key: assignment.slot_key ?? assignment.slotKey ?? tpl.slot_key ?? tpl.slotKey ?? `slot_${index}`,
    slotKey: assignment.slot_key ?? assignment.slotKey ?? tpl.slot_key ?? `slot_${index}`,
    gridColumn,
    grid_row: gridRow,
    gridRow,
    grid_column: gridColumn,
    product,
  };
}

export default function FlyerBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: any) => state.auth);

  const { data: flyerData, isLoading: flyerLoading, isError: flyerError, refetch } = useGetFlyerQuery(id!, { skip: !id });
  const [patchSlot, { isLoading: patching }] = usePatchFlyerSlotMutation();
  const [publishFlyer, { isLoading: publishing }] = usePublishFlyerMutation();

  const flyer = flyerData?.data ?? flyerData;
  const businessProfileId =
    user?.activeProfile ??
    user?.businessProfiles?.[0]?._id ??
    flyer?.businessProfile_id ??
    flyer?.businessProfileId;
  const template = flyer?.flyer_template_id ?? flyer?.template ?? flyer?.layout ?? {};
  const layoutConfig = template?.layout_config ?? template?.layoutConfig ?? {};
  const columns = layoutConfig?.columns ?? 4;
  const rows = layoutConfig?.rows ?? 5;
  const gap = layoutConfig?.gap ?? 8;
  const rawSlots: any[] = flyer?.slot_assignments ?? flyer?.slotAssignments ?? flyer?.slots ?? [];
  const slotAssignments = useMemo(() => {
    const normalized = rawSlots.map((s, i) => normalizeSlotAssignment(s, i, columns));
    return normalized.sort((a, b) => {
      const rowA = Number(a.gridRow ?? a.grid_row ?? 0);
      const rowB = Number(b.gridRow ?? b.grid_row ?? 0);
      if (rowA !== rowB) return rowA - rowB;
      const colA = Number(a.gridColumn ?? a.grid_column ?? 0);
      const colB = Number(b.gridColumn ?? b.grid_column ?? 0);
      return colA - colB;
    });
  }, [rawSlots, columns]);

  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    if (!selectedSlot) return;
    const slotId = selectedSlot._id ?? selectedSlot.id;
    const found = slotAssignments.find((s) => (s._id ?? s.id) === slotId);
    if (found && found !== selectedSlot) setSelectedSlot(found);
  }, [slotAssignments, selectedSlot?._id ?? selectedSlot?.id]);
  const [productSearch, setProductSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [createProductForm] = Form.useForm();
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);

  const { data: productsData } = useGetBusinessProductsQuery(
    {
      businessProfileId: businessProfileId ?? "",
      page: 1,
      limit: 50,
      search: productSearch.trim() || undefined,
    },
    { skip: !businessProfileId || !id }
  );
  const [addProduct, { isLoading: addingProduct }] = useAddProductMutation();

  const products = productsData?.data?.docs ?? productsData?.docs ?? productsData?.data ?? [];
  const productList = Array.isArray(products) ? products : [];

  const productSlotsFilled = slotAssignments.filter(
    (s) => (s.slot_type ?? s.slotType ?? "").toLowerCase() === "product" && (s.product_id ?? s.productId ?? s.product)
  ).length;
  const productSlotsTotal = slotAssignments.filter(
    (s) => (s.slot_type ?? s.slotType ?? "").toLowerCase() === "product"
  ).length;

  const handleSaveProductSlot = useCallback(async () => {
    if (!id || !selectedSlot) return;
    const assignmentId = getSlotAssignmentId(selectedSlot);
    if (!assignmentId) {
      ErrorPopup("Slot not loaded. Refresh the page and try again.");
      return;
    }
    const raw = selectedSlot._productId ?? selectedSlot.product_id ?? selectedSlot.product?._id ?? selectedSlot.product?.id;
    const productIdStr =
      raw == null
        ? null
        : typeof raw === "string"
          ? raw
          : typeof raw === "object" && raw !== null
            ? (raw as any)._id ?? (raw as any).id ?? (typeof (raw as any).toString === "function" ? (raw as any).toString() : String(raw))
            : String(raw);
    const safeProductId =
      productIdStr != null
        ? (typeof productIdStr === "string" ? productIdStr : String((productIdStr as any)?.toString?.() ?? productIdStr))
        : null;
    const productIdForApi = safeProductId && safeProductId !== "[object Object]" ? safeProductId : null;
    try {
      await patchSlot({
        flyerId: id,
        slotAssignmentId: assignmentId,
        body: {
          product_id: productIdForApi,
          override_price: selectedSlot._overridePrice ?? selectedSlot.override_price,
          badge_label: selectedSlot._badgeLabel ?? selectedSlot.badge_label,
          custom_note: selectedSlot._customNote ?? selectedSlot.custom_note,
        },
      }).unwrap();
      SuccessPopup("Slot saved.");
      refetch();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? "Failed to save slot.");
    }
  }, [id, selectedSlot, patchSlot, refetch]);

  const handleClearProductSlot = useCallback(async () => {
    if (!id || !selectedSlot) return;
    const assignmentId = getSlotAssignmentId(selectedSlot);
    if (!assignmentId) {
      ErrorPopup("Slot not loaded. Refresh the page and try again.");
      return;
    }
    try {
      await patchSlot({
        flyerId: id,
        slotAssignmentId: assignmentId,
        body: { product_id: null },
      }).unwrap();
      SuccessPopup("Slot cleared.");
      setSelectedSlot(null);
      refetch();
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? "Failed to clear slot.");
    }
  }, [id, selectedSlot, patchSlot, refetch]);

  const handleAssignProduct = useCallback((product: any) => {
    if (!selectedSlot) return;
    const pid = product?._id ?? product?.id;
    setSelectedSlot({
      ...selectedSlot,
      product_id: pid,
      product,
      _productId: pid,
    });
  }, [selectedSlot]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !id || !selectedSlot) return;
      const assignmentId = getSlotAssignmentId(selectedSlot);
      if (!assignmentId) {
        ErrorPopup("Slot not loaded. Refresh the page and try again.");
        return;
      }
      const formData = new FormData();
      formData.append("image", file);
      try {
        await patchSlot({
          flyerId: id,
          slotAssignmentId: assignmentId,
          body: formData,
        }).unwrap();
        SuccessPopup("Image uploaded.");
        refetch();
        e.target.value = "";
      } catch (err: any) {
        ErrorPopup(err?.data?.message ?? "Upload failed.");
      }
    },
    [id, selectedSlot, patchSlot, refetch]
  );

  const handleCreateProductAndAssign = useCallback(async () => {
    const values = await createProductForm.validateFields().catch(() => null);
    if (!values || !businessProfileId || !selectedSlot) return;
    const formData = new FormData();
    formData.append("productName", values.productName ?? "");
    formData.append("description", values.description ?? "");
    formData.append("price", String(values.price ?? 0));
    formData.append("businessProfile", businessProfileId);
    if (newProductImageFile) formData.append("image", newProductImageFile);
    try {
      const res = await addProduct(formData).unwrap();
      const product = res?.data ?? res;
      const productId = product?._id ?? product?.id;
      const assignmentId = getSlotAssignmentId(selectedSlot);
      if (productId) handleAssignProduct(product || { _id: productId });
      if (productId && assignmentId) {
        const idStr = typeof productId === "string" ? productId : String((productId as any)?.toString?.() ?? (productId as any)?._id ?? (productId as any)?.id ?? productId);
        if (idStr && idStr !== "[object Object]") {
          await patchSlot({
            flyerId: id!,
            slotAssignmentId: assignmentId,
            body: { product_id: idStr },
          }).unwrap();
        }
        SuccessPopup("Product created and assigned. Set badge/price below and click Save Slot to save.");
        setShowCreateProduct(false);
        createProductForm.resetFields();
        setNewProductImageFile(null);
        refetch();
      } else if (productId) {
        SuccessPopup("Product created. Refresh the page to load slots, then assign it to this slot.");
        setShowCreateProduct(false);
        createProductForm.resetFields();
        setNewProductImageFile(null);
      }
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create product.");
    }
  }, [businessProfileId, selectedSlot, addProduct, patchSlot, id, refetch, createProductForm, newProductImageFile]);

  const handlePublish = useCallback(async () => {
    if (!id) return;
    try {
      await publishFlyer(id).unwrap();
      SuccessPopup("Flyer published.");
      navigate("/flyers");
    } catch (e: any) {
      ErrorPopup(e?.data?.message ?? "Failed to publish.");
    }
  }, [id, publishFlyer, navigate]);

  if (flyerLoading || !id) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/flyers")} className="!p-0 !text-black dark:!text-white" />
          <h1 className="text-2xl font-semibold">Flyer Builder</h1>
        </div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </>
    );
  }

  if (flyerError || !flyer) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/flyers")} className="!p-0 !text-black dark:!text-white" />
          <h1 className="text-2xl font-semibold">Flyer Builder</h1>
        </div>
        <p className="text-red-500 py-4">Failed to load flyer.</p>
      </>
    );
  }

  const isProductSlot = (s: any) => (s.slot_type ?? s.slotType ?? "").toLowerCase() === "product";
  const isBannerOrHero = (s: any) => {
    const t = (s.slot_type ?? s.slotType ?? "").toLowerCase();
    return t === "banner" || t === "hero";
  };

  const selectedSlotId = String(selectedSlot?._id ?? selectedSlot?.id ?? "");
  const isPlaceholderSlot = selectedSlot && (selectedSlotId.startsWith("placeholder-") || selectedSlotId.startsWith("tpl-"));

  // When API returns no slot_assignments, build a fallback grid from template.slots or columns×rows so the left panel is never blank
  const templateSlots = template?.slots ?? [];
  const slotsToRender =
    slotAssignments.length > 0
      ? slotAssignments
      : templateSlots.length > 0
        ? templateSlots.map((s: any, i: number) => ({
            _id: s._id ?? s.id ?? `tpl-${i}`,
            id: s.id ?? s._id ?? `tpl-${i}`,
            slot_key: s.slot_key ?? s.slotKey ?? `slot_${i}`,
            slot_type: s.type ?? s.slot_type ?? s.slotType ?? "product",
            gridColumn: s.gridColumn ?? s.grid_column ?? (i % columns) + 1,
            gridRow: s.gridRow ?? s.grid_row ?? Math.floor(i / columns) + 1,
          }))
        : Array.from({ length: columns * rows }, (_, i) => ({
            _id: `placeholder-${i}`,
            id: `placeholder-${i}`,
            slot_key: `slot_${i}`,
            slot_type: "product",
            gridColumn: (i % columns) + 1,
            gridRow: Math.floor(i / columns) + 1,
          }));

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/flyers")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold">Flyer Builder</h1>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left panel — Visual grid (60%) */}
        <div className="flex-1 lg:w-[60%] overflow-auto">
          <div
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 min-h-[320px]"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(60px, 1fr))`,
              gap: `${gap}px`,
            }}
          >
            {slotsToRender.map((slot: any) => {
              const gc = slot.gridColumn ?? slot.grid_column ?? "auto";
              const gr = slot.gridRow ?? slot.grid_row ?? "auto";
              const key = slot._id ?? slot.id ?? slot.slot_key ?? "";
              const selected = selectedSlot?._id === slot._id || selectedSlot?.id === slot.id;
              const dataSlot = selected && selectedSlot ? selectedSlot : slot;
              const product = dataSlot.product;
              const filledProduct = isProductSlot(slot) && (dataSlot.product_id ?? dataSlot.productId ?? product?._id);
              const filledImage = isBannerOrHero(slot) && (dataSlot.image_url ?? dataSlot.imageUrl);
              const imgSrc = imageUrlSrc(dataSlot.image_url ?? UPLOADS_URL + dataSlot.imageUrl);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 transition-all overflow-hidden min-h-[64px] ${
                    selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400"
                  } ${filledImage ? "p-0" : "p-2"} ${filledProduct ? "p-0" : ""}`}
                  style={{
                    gridColumn: gc,
                    gridRow: gr,
                    minHeight: 48,
                  }}
                >
                  {isProductSlot(slot) && (
                    <>
                      {filledProduct ? (
                        <>
                          {productImageSrc(product) ? (
                            <img
                              src={productImageSrc(product)!}
                              alt=""
                              className="w-full h-full object-cover absolute inset-0"
                            />
                          ) : null}
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Add Product</span>
                        </>
                      )}
                    </>
                  )}
                  {isBannerOrHero(slot) && (
                    <>
                      {filledImage && imgSrc ? (
                        <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Upload Image</span>
                        </>
                      )}
                    </>
                  )}
                  {!isProductSlot(slot) && !isBannerOrHero(slot) && (
                    <>
                      <Plus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">{slot.slot_key ?? "Slot"}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel — Slot assignment (40%) */}
        <div className="w-full lg:w-[40%] lg:max-w-md flex-shrink-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 flex flex-col">
          {!selectedSlot ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Select a slot to edit</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {selectedSlot.slot_key ?? selectedSlot.slotKey ?? "Slot"}
                </span>
                <Badge color={isProductSlot(selectedSlot) ? "primary" : "warning"}>
                  {selectedSlot.slot_type ?? selectedSlot.slotType ?? "—"}
                </Badge>
              </div>
              {isPlaceholderSlot && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded mb-4">
                  Template preview. If Save doesn’t work, refresh the page to load slots from the server, then try again.
                </p>
              )}

              {isProductSlot(selectedSlot) && (
                <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Search products</label>
                    <Input.Search
                      placeholder="Search by name"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      allowClear
                      className="mb-2"
                    />
                    <div className="border border-gray-200 dark:border-white/10 rounded-lg max-h-48 overflow-y-auto">
                      {productList.map((p: any, idx: number) => (
                        <button
                          key={p._id ?? p.id ?? `p-${idx}`}
                          type="button"
                          onClick={() => handleAssignProduct(p)}
                          className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0"
                        >
                          {productImageSrc(p) ? (
                            <img src={productImageSrc(p)!} alt="" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {p.productName ?? p.name ?? "—"}
                            </div>
                            <div className="text-xs text-gray-500">${Number(p.price ?? 0).toFixed(2)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="dashed" block onClick={() => setShowCreateProduct(true)} className="mb-2">
                    Create New Product
                  </Button>
                  {showCreateProduct && (
                    <div className="border border-gray-200 dark:border-white/10 rounded-lg p-3 mb-2">
                      <Form form={createProductForm} layout="vertical" onFinish={handleCreateProductAndAssign}>
                        <Form.Item name="productName" label="Name" rules={[{ required: true }]}>
                          <Input placeholder="Product name" />
                        </Form.Item>
                        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                          <InputNumber min={0} className="w-full" placeholder="0" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                          <Input.TextArea rows={2} placeholder="Optional" />
                        </Form.Item>
                        <Form.Item label="Image">
                          <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                            onChange={(e) => setNewProductImageFile(e.target.files?.[0] ?? null)}
                          />
                        </Form.Item>
                        <div className="flex gap-2">
                          <Button type="primary" htmlType="submit" loading={addingProduct} size="small">
                            Create & Assign
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setShowCreateProduct(false);
                              createProductForm.resetFields();
                              setNewProductImageFile(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )}

                  {(selectedSlot.product_id ?? selectedSlot.productId ?? selectedSlot.product) && (
                    <div className="space-y-2 border-t border-gray-100 dark:border-white/5 pt-4">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Override price (optional)</label>
                      <InputNumber
                        min={0}
                        className="w-full"
                        placeholder="Use product price"
                        title="Leave empty to use product price"
                        value={selectedSlot._overridePrice ?? selectedSlot.override_price}
                        onChange={(v) => setSelectedSlot({ ...selectedSlot, _overridePrice: v ?? undefined })}
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-400">Badge label (e.g. 20% OFF)</label>
                      <Input
                        placeholder="Optional"
                        value={selectedSlot._badgeLabel ?? selectedSlot.badge_label ?? ""}
                        onChange={(e) => setSelectedSlot({ ...selectedSlot, _badgeLabel: e.target.value })}
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-400">Custom note</label>
                      <Input
                        placeholder="Optional"
                        value={selectedSlot._customNote ?? selectedSlot.custom_note ?? ""}
                        onChange={(e) => setSelectedSlot({ ...selectedSlot, _customNote: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-4">
                    <Button type="primary" onClick={handleSaveProductSlot} loading={patching} className="web-btn">
                      Save Slot
                    </Button>
                    <Button danger onClick={handleClearProductSlot} loading={patching}>
                      Clear Slot
                    </Button>
                  </div>
                </div>
              )}

              {isBannerOrHero(selectedSlot) && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Image</label>
                    {(selectedSlot.image_url ?? selectedSlot.imageUrl) && (
                      <img
                        src={imageUrlSrc(selectedSlot.image_url ?? selectedSlot.imageUrl)!}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {productSlotsFilled} of {productSlotsTotal} product slots filled
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 mt-6 flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-lg">
        <Button type="default" disabled className="web-btn">
          Save Draft
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setPreviewOpen(true)}>Preview Flyer</Button>
          <Button type="primary" className="web-btn" loading={publishing} onClick={handlePublish}>
            Publish Flyer
          </Button>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        title="Preview Flyer"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width="90%"
        styles={{ body: { maxHeight: "80vh", overflow: "auto" } }}
      >
        <div
          className="mx-auto rounded-xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.03]"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(60px, 1fr))`,
            gap: `${gap}px`,
            maxWidth: 600,
          }}
        >
          {slotAssignments.map((slot: any) => {
            const gc = slot.gridColumn ?? slot.grid_column ?? "auto";
            const gr = slot.gridRow ?? slot.grid_row ?? "auto";
            const product = slot.product ?? slot;
            const filledProduct = isProductSlot(slot) && (slot.product_id ?? slot.productId ?? product?._id);
            const filledImage = isBannerOrHero(slot) && (slot.image_url ?? slot.imageUrl);
            const imgSrc = imageUrlSrc(slot.image_url ?? slot.imageUrl);

              return (
                <div
                  key={slot._id ?? slot.id ?? slot.slot_key}
                  className="relative rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center text-center min-h-[48px]"
                  style={{ gridColumn: gc, gridRow: gr }}
                >
                {isProductSlot(slot) && filledProduct && (
                  <>
                    {productImageSrc(product) && (
                      <img src={productImageSrc(product)!} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </>
                )}
                {isProductSlot(slot) && !filledProduct && <span className="text-xs text-gray-400">—</span>}
                {isBannerOrHero(slot) && filledImage && imgSrc && (
                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                )}
                {isBannerOrHero(slot) && !filledImage && <span className="text-xs text-gray-400">—</span>}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
