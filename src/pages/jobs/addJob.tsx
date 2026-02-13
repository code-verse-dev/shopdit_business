import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useCreateJobMutation } from "../../redux/services/jobService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import { useState } from "react";

const AddJob = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [createJob, { isLoading }] = useCreateJobMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onFinish = async (values: Record<string, any>) => {
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
    formData.append("category", values.category ?? "");
    formData.append("subCategory", values.subCategory ?? "");
    formData.append("description", values.description ?? "");
    formData.append("jobType", values.jobType ?? "");
    formData.append("location", JSON.stringify(location));
    formData.append("salary", String(values.salary ?? 0));
    formData.append("contactNumber", String(values.contactNumber ?? ""));
    formData.append("facebookLink", values.facebookLink ?? "");
    formData.append("business", user!._id);
    if (imageFile) formData.append("image", imageFile);

    try {
      await createJob(formData).unwrap();
      SuccessPopup("Job created.");
      navigate("/jobs");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create job.");
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
        <h1 className="text-2xl font-semibold capitalize">Add Job</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full p-4 md:w-2/4">
          <h2 className="text-xl font-semibold dark:text-white">Job Details</h2>
          <Form
            layout="vertical"
            onFinish={onFinish}
            className="mt-6 space-y-4"
          >
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="e.g. Marketing, Advertising & PR" className="web-input" />
            </Form.Item>
            <Form.Item name="subCategory" label="Sub Category">
              <Input placeholder="e.g. Brand Management" className="web-input" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Job description"
                className="web-input"
              />
            </Form.Item>
            <Form.Item
              name="jobType"
              label="Job Type"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                placeholder="Select job type"
                className="web-input"
                options={[
                  { value: "Full Time", label: "Full Time" },
                  { value: "Part Time", label: "Part Time" },
                  { value: "Contract", label: "Contract" },
                  { value: "Internship", label: "Internship" },
                ]}
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

            <Form.Item
              name="salary"
              label="Salary ($)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                className="web-input w-full"
                placeholder="0"
              />
            </Form.Item>
            <Form.Item name="contactNumber" label="Contact Number">
              <Input placeholder="e.g. 1234567890" className="web-input" />
            </Form.Item>
            <Form.Item name="facebookLink" label="Facebook Link">
              <Input
                placeholder="e.g. www.facebook.com/page"
                className="web-input"
              />
            </Form.Item>
            <Form.Item label="Job Image">
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

export default AddJob;
