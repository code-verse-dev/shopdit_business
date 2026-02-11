import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Select, TimePicker } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAddEventMutation } from "../../redux/services/eventService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { useState } from "react";

const AddEvent = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [addEvent, { isLoading }] = useAddEventMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onFinish = async (values: Record<string, any>) => {
    const addressLineOne = values.addressLineOne ?? "";
    const addressLineTwo = values.addressLineTwo ?? "";
    const zipCode = values.zipCode ?? "";
    const locationAddress = values.locationAddress ?? "";
    const addressString = [addressLineOne, addressLineTwo, zipCode].filter(Boolean).join(", ") || locationAddress;

    const location = {
      type: "Point" as const,
      coordinates: [0, 0] as [number, number],
      address: addressString || locationAddress,
    };

    const formData = new FormData();
    formData.append("eventName", values.eventName);
    formData.append("description", values.description ?? "");
    formData.append("location", JSON.stringify(location));
    const dateValue = values.date ? dayjs(values.date).startOf("day").toISOString() : "";
    const timeValue = values.date && values.time
      ? dayjs(values.date)
          .hour(dayjs(values.time).hour())
          .minute(dayjs(values.time).minute())
          .second(0)
          .millisecond(0)
          .toISOString()
      : values.time
        ? dayjs(values.time).toISOString()
        : "";
    formData.append("date", dateValue);
    formData.append("time", timeValue);
    formData.append("ticketPrice", String(values.ticketPrice ?? 0));
    formData.append("status", values.status ?? "UPCOMING");
    formData.append("business", user!._id);
    if (imageFile) formData.append("image", imageFile);

    try {
      await addEvent(formData).unwrap();
      SuccessPopup("Event created.");
      navigate("/events");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create event.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold capitalize">Add Event</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full p-4 md:w-2/4">
          <h2 className="text-xl font-semibold dark:text-white">
            Event Details
          </h2>
          <Form
            layout="vertical"
            onFinish={onFinish}
            className="mt-6 space-y-4"
          >
            <Form.Item
              name="eventName"
              label="Event Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Event name" className="web-input" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Description"
                className="web-input"
              />
            </Form.Item>

            <Form.Item name="addressLineOne" label="Address line 1">
              <Input placeholder="Street, building, venue" className="web-input" />
            </Form.Item>
            <Form.Item name="addressLineTwo" label="Address line 2">
              <Input placeholder="Floor, unit, etc." className="web-input" />
            </Form.Item>
            <Form.Item name="zipCode" label="Zip code">
              <Input placeholder="e.g. 12345" className="web-input" />
            </Form.Item>
            <Form.Item name="locationAddress" label="Location (address string)" help="e.g. City, venue for map display">
              <Input placeholder="e.g. Nashville, TN" className="web-input" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Required" }]}
              >
                <DatePicker className="web-input w-full" />
              </Form.Item>
              <Form.Item name="time" label="Time">
                <TimePicker className="web-input w-full" format="h:mm A" use12Hours />
              </Form.Item>
            </div>
            <Form.Item
              name="ticketPrice"
              label="Ticket Price ($)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                className="web-input w-full"
                placeholder="0"
              />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="upcoming">
              <Select
                className="web-input"
                options={[
                  { value: "UPCOMING", label: "Upcoming" },
                  { value: "ONGOING", label: "Ongoing" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Event Image">
              <Input
                type="file"
                accept="image/*"
                className="web-input"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] ?? null)
                }
              />
            </Form.Item>
            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="web-btn"
              >
                Save
              </Button>
              <Button className="web-btn" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddEvent;
