import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAddCouponMutation } from "../../redux/services/couponService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { useState } from "react";

const AddCoupon = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [addCoupon, { isLoading }] = useAddCouponMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onFinish = async (values: Record<string, any>) => {
    const businessProfile =
      user?.activeProfile ?? user?.businessProfiles?.[0]?._id;
    if (!businessProfile) {
      ErrorPopup("No business profile selected.");
      return;
    }

    const addressLineOne = values.addressLineOne ?? "";
    const addressLineTwo = values.addressLineTwo ?? "";
    const zipCode = values.zipCode ?? "";
    const locationAddress = values.locationAddress ?? "";
    const addressString =
      [addressLineOne, addressLineTwo, zipCode].filter(Boolean).join(", ") ||
      locationAddress;

    const location = {
      type: "Point" as const,
      coordinates: [0, 0] as [number, number],
      address: addressString || locationAddress,
    };

    const formData = new FormData();
    formData.append("couponName", values.couponName);
    formData.append("description", values.description ?? "");
    formData.append("price", String(values.price ?? 0));
    formData.append("discountedPrice", String(values.discountedPrice ?? 0));
    formData.append(
      "startDate",
      values.startDate ? dayjs(values.startDate).toISOString() : ""
    );
    formData.append(
      "endDate",
      values.endDate ? dayjs(values.endDate).toISOString() : ""
    );
    formData.append("redemptionLimit", String(values.redemptionLimit ?? 0));
    formData.append("location", JSON.stringify(location));
    formData.append("businessProfile", businessProfile);
    if (imageFile) formData.append("image", imageFile);

    try {
      await addCoupon(formData).unwrap();
      SuccessPopup("Coupon created.");
      navigate("/coupons");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create coupon.");
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
        <h1 className="text-2xl font-semibold capitalize">Add Coupon</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full p-4 md:w-2/4">
          <h2 className="text-xl font-semibold dark:text-white">
            Coupon Details
          </h2>
          <Form
            layout="vertical"
            onFinish={onFinish}
            className="mt-6 space-y-4"
          >
            <Form.Item
              name="couponName"
              label="Coupon Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Coupon name" className="web-input" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Description"
                className="web-input"
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="price"
                label="Original Price ($)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  className="web-input w-full"
                  placeholder="0"
                />
              </Form.Item>
              <Form.Item
                name="discountedPrice"
                label="Discounted Price ($)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  className="web-input w-full"
                  placeholder="0"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: "Required" }]}
              >
                <DatePicker className="web-input w-full" />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: "Required" }]}
              >
                <DatePicker className="web-input w-full" />
              </Form.Item>
            </div>

            <Form.Item
              name="redemptionLimit"
              label="Redemption Limit"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                className="web-input w-full"
                placeholder="0"
              />
            </Form.Item>

            <Form.Item name="addressLineOne" label="Address line 1">
              <Input placeholder="Street, building" className="web-input" />
            </Form.Item>
            <Form.Item name="addressLineTwo" label="Address line 2">
              <Input placeholder="Floor, unit, etc." className="web-input" />
            </Form.Item>
            <Form.Item name="zipCode" label="Zip code">
              <Input placeholder="e.g. 12345" className="web-input" />
            </Form.Item>
            <Form.Item
              name="locationAddress"
              label="Location (address string)"
              help="e.g. City, State for map display"
            >
              <Input placeholder="e.g. New York, NY" className="web-input" />
            </Form.Item>

            <Form.Item label="Coupon Image">
              <Input
                type="file"
                accept="image/*"
                className="web-input"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
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

export default AddCoupon;
