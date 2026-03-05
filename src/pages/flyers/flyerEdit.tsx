import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Skeleton } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetFlyerQuery, useUpdateFlyerMutation } from "../../redux/services/flyersService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";

export default function FlyerEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  const { data: flyerData, isLoading, isError } = useGetFlyerQuery(id!, { skip: !id });
  const [updateFlyer, { isLoading: updating }] = useUpdateFlyerMutation();

  const flyer = flyerData?.data ?? flyerData;

  useEffect(() => {
    if (!flyer) return;
    form.setFieldsValue({
      title: flyer.title ?? flyer.name ?? "",
      description: flyer.description ?? "",
      startDate: flyer.startDate ?? flyer.start_date ? dayjs(flyer.startDate ?? flyer.start_date) : undefined,
      endDate: flyer.endDate ?? flyer.end_date ? dayjs(flyer.endDate ?? flyer.end_date) : undefined,
      zip_code: flyer.zip_code ?? flyer.region ?? flyer.store ?? "",
    });
  }, [flyer, form]);

  const onFinish = async (values: Record<string, any>) => {
    if (!id) return;
    const start_date = values.startDate ? dayjs(values.startDate).startOf("day").toISOString() : undefined;
    const end_date = values.endDate ? dayjs(values.endDate).startOf("day").toISOString() : undefined;
    try {
      await updateFlyer({
        flyerId: id,
        title: values.title?.trim() || undefined,
        description: values.description ?? undefined,
        start_date,
        end_date,
        zip_code: values.zip_code?.trim() ?? undefined,
      }).unwrap();
      SuccessPopup("Flyer updated.");
      navigate(`/flyers/${id}`);
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to update flyer.");
    }
  };

  if (isLoading || !id) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/flyers/${id}`)}
            className="!p-0 !text-black dark:!text-white"
          />
          <h1 className="text-2xl font-semibold">Edit Flyer Details</h1>
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </>
    );
  }

  if (isError || !flyer) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/flyers")} className="!p-0 !text-black dark:!text-white" />
          <h1 className="text-2xl font-semibold">Edit Flyer Details</h1>
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
          onClick={() => navigate(`/flyers/${id}`)}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold">Edit Flyer Details</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metadata</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update title, dates, and zipcode.</p>
        </div>
        <div className="max-w-2xl p-6">
          <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
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
              <Button type="primary" htmlType="submit" loading={updating} className="web-btn">
                Save changes
              </Button>
              <Button type="default" onClick={() => navigate(`/flyers/${id}`)}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
