/**
 * Create Flyer — two-step wizard at /flyers/create
 *
 * Step 1: Pick a template
 *   - Fetches active templates from GET /api/business/flyer-templates
 *   - User selects one (required); live grid preview shows layout_config + slot types
 *   - Next → Step 2
 *
 * Step 2: Flyer details
 *   - Form: Title (required), Description, Start date (required), End date (required), Region/Store
 *   - Validation: end date must be after start date
 *   - "Save as Draft" → POST /api/business/flyers with title, dates, zip_code, status: "draft",
 *     and flyer_template_id (selected template _id), then redirect to /flyers/:id/build
 */
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Skeleton,
  Steps,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import {
  useGetFlyerTemplatesQuery,
  useCreateFlyerMutation,
} from "../../redux/services/flyersService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { UPLOADS_URL } from "../../constants/api";

const STEP_PICK_TEMPLATE = 0;
const STEP_FLYER_DETAILS = 1;

type SlotType = "product" | "banner" | "hero";

const SLOT_TYPE_COLORS: Record<SlotType, string> = {
  product: "bg-blue-500/80 text-white",
  banner: "bg-orange-500/80 text-white",
  hero: "bg-purple-500/80 text-white",
};

function getSlotColor(type: string): string {
  const t = (type ?? "product").toLowerCase();
  return SLOT_TYPE_COLORS[t as SlotType] ?? "bg-gray-400/80 text-white";
}

function templateThumbnailSrc(template: any): string | null {
  const img = template.thumbnail_url ?? template.thumbnail ?? template.image ?? template.thumbnailUrl;
  if (!img) return null;
  if (typeof img === "string" && (img.startsWith("http") || img.startsWith("//"))) return img;
  return `${UPLOADS_URL}${img}`;
}

function TemplateGridPreview({
  layoutConfig,
  slots,
}: {
  layoutConfig: { columns?: number; rows?: number; gap?: number };
  slots?: Array<{ slot_key?: string; type?: string }>;
}) {
  const cols = layoutConfig?.columns ?? 4;
  const rows = layoutConfig?.rows ?? 5;
  const gap = layoutConfig?.gap ?? 4;
  const slotList = slots ?? [];
  const cellCount = cols * rows;

  return (
    <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Layout preview</p>
      <div
        className="inline-grid w-full max-w-md border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gap: `${gap}px`,
          padding: `${gap}px`,
        }}
      >
        {Array.from({ length: cellCount }, (_, i) => {
          const slot = slotList[i];
          const key = slot?.slot_key ?? `slot_${i}`;
          const type = slot?.type ?? "product";
          return (
            <div
              key={i}
              className={`min-h-[36px] flex items-center justify-center text-xs font-medium rounded ${getSlotColor(type)}`}
            >
              {key}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateFlyer() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessProfileId = user?.activeProfile ?? user?.businessProfiles?.[0]?._id;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: templatesData, isLoading: templatesLoading, isError: templatesError } = useGetFlyerTemplatesQuery();
  const [createFlyer, { isLoading: creating }] = useCreateFlyerMutation();

  const templates = useMemo(() => {
    const raw = templatesData?.data ?? templatesData?.docs ?? templatesData;
    if (Array.isArray(raw)) return raw;
    if (raw?.docs) return raw.docs;
    return [];
  }, [templatesData]);

  const onNext = () => {
    if (selectedTemplate) setCurrentStep(STEP_FLYER_DETAILS);
  };

  const onBack = () => setCurrentStep(STEP_PICK_TEMPLATE);

  const onFinishDetails = async (values: Record<string, any>) => {
    const templateId = selectedTemplate?._id ?? selectedTemplate?.id;
    if (!templateId) {
      ErrorPopup("Please go back and select a template first.");
      return;
    }
    if (!businessProfileId) {
      ErrorPopup("No business profile selected.");
      return;
    }
    const start_date = values.startDate ? dayjs(values.startDate).startOf("day").toISOString() : "";
    const end_date = values.endDate ? dayjs(values.endDate).startOf("day").toISOString() : "";
    try {
      const res = await createFlyer({
        flyer_template_id: templateId,
        businessProfile_id: businessProfileId,
        title: values.title?.trim() || "Untitled Flyer",
        start_date,
        end_date,
        description: values.description?.trim() || undefined,
        zip_code: values.zip_code?.trim() || undefined,
      }).unwrap();
      const id = res?.data?.id ?? res?.data?._id ?? res?.id ?? res?._id;
      SuccessPopup("Flyer saved as draft.");
      if (id) navigate(`/flyers/${id}/build`);
      else navigate("/flyers");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create flyer.");
    }
  };

  const layoutConfig = selectedTemplate?.layout_config ?? selectedTemplate?.layoutConfig ?? {};
  const slots = selectedTemplate?.slots ?? [];

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => (currentStep === 0 ? navigate("/flyers") : onBack())}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold">Create Flyer</h1>
      </div>

      <div className="mb-8 w-full max-w-md">
        <Steps
          current={currentStep}
          className="mb-0"
          size="small"
          items={[
            { title: "Pick a template" },
            { title: "Flyer details" },
          ]}
        />
      </div>

      {currentStep === STEP_PICK_TEMPLATE && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1 — Pick a template</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a layout for your flyer.</p>
          </div>
          <div className="p-6">
            {!businessProfileId ? (
              <p className="text-gray-500 dark:text-gray-400">Select a business profile to create a flyer.</p>
            ) : templatesLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : templatesError ? (
              <p className="text-red-500">Failed to load templates.</p>
            ) : templates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No active templates available.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((tpl: any, index: number) => {
                    const tplId = tpl._id ?? tpl.id;
                    const selectedId = selectedTemplate?._id ?? selectedTemplate?.id;
                    const isSelected = selectedId != null && selectedId === tplId;
                    const thumb = templateThumbnailSrc(tpl);
                    const config = tpl.layout_config ?? tpl.layoutConfig ?? {};
                    const cols = config.columns ?? 0;
                    const rows = config.rows ?? 0;
                    const slotCount = tpl.slotCount ?? tpl.slot_count ?? (Array.isArray(tpl.slots) ? tpl.slots.length : 0);
                    return (
                      <button
                        type="button"
                        key={tplId ?? `tpl-${index}`}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={tpl.name ?? tpl.title ?? ""}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        ) : (
                          <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 mb-3">
                            No image
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {tpl.name ?? tpl.title ?? "Untitled"}
                        </h3>
                        {tpl.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{tpl.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>{slotCount} slots</span>
                          {(cols || rows) > 0 && (
                            <span>{cols} columns × {rows} rows</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTemplate && (
                  <TemplateGridPreview layoutConfig={layoutConfig} slots={slots} />
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    type="primary"
                    className="web-btn"
                    disabled={!selectedTemplate}
                    onClick={onNext}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {currentStep === STEP_FLYER_DETAILS && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2 — Flyer details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set title, dates, and zipcode.</p>
          </div>
          <div className="max-w-2xl p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinishDetails}
              className="space-y-4"
            >
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input placeholder="Flyer title" className="web-input" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Description" className="web-input" />
              </Form.Item>
              <Form.Item
                name="startDate"
                label="Start date"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker className="web-input w-full" />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="End date"
                rules={[
                  { required: true, message: "End date is required" },
                  () => ({
                    validator(_, value) {
                      const start = form.getFieldValue("startDate");
                      if (!value || !start) return Promise.resolve();
                      if (dayjs(value).isAfter(dayjs(start))) return Promise.resolve();
                      return Promise.reject(new Error("End date must be after start date"));
                    },
                  }),
                ]}
              >
                <DatePicker className="web-input w-full" />
              </Form.Item>
              <Form.Item name="zip_code" label="Zipcode">
                <Input placeholder="e.g. 12345" className="web-input" />
              </Form.Item>
              <div className="flex gap-3 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creating}
                  className="web-btn"
                >
                  Save as Draft
                </Button>
                <Button type="default" className="web-btn" onClick={onBack}>
                  Back
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
