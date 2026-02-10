import React, { useMemo, useState } from "react";
import { Button, Form, Input, Select } from "antd";
import { useNavigate } from "react-router";
import { FiUploadCloud } from "react-icons/fi";
import { useCreateProfileMutation } from "../../redux/services/businessService";
import { useGetBusinessTypesQuery } from "../../redux/services/businessTypeService";
import { SuccessPopup, ErrorPopup } from "../popup/Popup";

const { TextArea } = Input;

interface BusinessProfileFormValues {
  businessName: string;
  addressLineOne: string;
  addressLineTwo: string;
  zipCode: string;
  businessType: string;
  subCategory: string[];
  locationAddress: string;
  ein: string;
  phoneNumber: string;
  website: string;
  about: string;
  facebook: string;
  instagram: string;
  tikTok: string;
  importedReviews?: string;
}

/** Static sub-categories by type (backend has only 2 types; we map by name). */
const RESTAURANT_SUBCATEGORIES = [
  { value: "chinese", label: "Chinese" },
  { value: "mexican", label: "Mexican" },
  { value: "italian", label: "Italian" },
  { value: "mediterranean", label: "Mediterranean" },
];

const CAFES_SUBCATEGORIES = [
  { value: "food cafe", label: "Food Cafe" },
  { value: "coffee cafe", label: "Coffee Cafe" },
  { value: "juices cafe", label: "Juices Cafe" },
];

function isRestaurantType(name?: string): boolean {
  const n = (name ?? "").toLowerCase();
  return n.includes("restaurant") || n.includes("rest");
}

function isCafeType(name?: string): boolean {
  const n = (name ?? "").toLowerCase();
  return n.includes("cafe") || n.includes("cafes") || n.includes("coffee");
}

const BusinessProfileForm: React.FC = () => {
  const [form] = Form.useForm<BusinessProfileFormValues>();
  const navigate = useNavigate();
  const [createProfile, { isLoading }] = useCreateProfileMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const businessTypeId = Form.useWatch("businessType", form);

  const { data: businessTypesData, isLoading: businessTypesLoading } =
    useGetBusinessTypesQuery();
  const businessTypesList = Array.isArray(businessTypesData?.data)
    ? businessTypesData.data
    : Array.isArray(businessTypesData?.docs)
      ? businessTypesData.docs
      : Array.isArray(businessTypesData)
        ? businessTypesData
        : [];

  const businessTypeOptions = useMemo(
    () =>
      businessTypesList.map((t: any) => ({
        value: t._id,
        label: t.typeName ?? t.name ?? t._id,
      })),
    [businessTypesList]
  );

  const selectedType = useMemo(
    () => businessTypesList.find((t: any) => t._id === businessTypeId),
    [businessTypesList, businessTypeId]
  );
  const typeName = selectedType?.typeName ?? selectedType?.name ?? "";

  const subCategoryOptions =
    isRestaurantType(typeName) ? RESTAURANT_SUBCATEGORIES
    : isCafeType(typeName) ? CAFES_SUBCATEGORIES
    : [];
  const showRestaurantSub = isRestaurantType(typeName);
  const showCafeSub = isCafeType(typeName);

  const handleSubmit = async (values: BusinessProfileFormValues) => {
    const formData = new FormData();
    formData.append("businessName", values.businessName);
    formData.append(
      "address",
      JSON.stringify({
        addressLineOne: values.addressLineOne ?? "",
        addressLineTwo: values.addressLineTwo ?? "",
        zipCode: values.zipCode ?? "",
      })
    );
    formData.append("businessType", values.businessType);
    if (values.subCategory?.length) {
      formData.append("subCategory", JSON.stringify(values.subCategory));
    }
    formData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [0, 0],
        address: values.locationAddress ?? "",
      })
    );
    formData.append("ein", values.ein ?? "");
    formData.append("phoneNumber", values.phoneNumber ?? "");
    formData.append("website", values.website ?? "");
    formData.append("about", values.about ?? "");
    formData.append("facebook", values.facebook ?? "");
    formData.append("instagram", values.instagram ?? "");
    formData.append("tikTok", values.tikTok ?? "");
    if (values.importedReviews) {
      formData.append("importedReviews", values.importedReviews);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }
    try {
      await createProfile(formData).unwrap();
      SuccessPopup("Business profile created.");
      navigate("/");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create profile.");
    }
  };

  return (
    <div className="md:w-4xl my-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-sm sm:text-title-md text-center">
            Create Business Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Fill out the form to add your business profile.
          </p>
        </div>

        <Form<BusinessProfileFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          className="auth-form"
        >
          <div className="form-row">
            <Form.Item
              name="businessName"
              label="Business Name"
              rules={[
                { required: true, message: "Please enter business name" },
              ]}
              className="form-col"
            >
              <Input
                placeholder="e.g. Joe's Kitchen"
                className="web-input"
              />
            </Form.Item>

            <Form.Item
              name="businessType"
              label="Business Type"
              rules={[
                { required: true, message: "Please select business type" },
              ]}
              className="form-col"
            >
              <Select
                placeholder="Select type"
                className="web-input"
                options={businessTypeOptions}
                loading={businessTypesLoading}
                onChange={() => form.setFieldValue("subCategory", undefined)}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="addressLineOne"
            label="Address line 1"
            rules={[
              { required: true, message: "Address line 1 is required" },
            ]}
          >
            <Input
              placeholder="Street, building, suite"
              className="web-input"
            />
          </Form.Item>

          <Form.Item
            name="addressLineTwo"
            label="Address line 2"
            rules={[
              { required: true, message: "Address line 2 is required" },
            ]}
          >
            <Input placeholder="Floor, unit, etc." className="web-input" />
          </Form.Item>

          <Form.Item
            name="zipCode"
            label="Zip code"
            rules={[{ required: true, message: "Zip code is required" }]}
          >
            <Input placeholder="e.g. 12345" className="web-input" />
          </Form.Item>

          <Form.Item
            name="locationAddress"
            label="Location (address string)"
            help="e.g. city name or full address for map display"
          >
            <Input placeholder="e.g. Nashville, TN" className="web-input" />
          </Form.Item>

          <Form.Item
            name="subCategory"
            label="Sub Category"
            help={
              showRestaurantSub
                ? "Select one or more restaurant types"
                : showCafeSub
                  ? "Select one or more cafe types"
                  : "Select a business type first"
            }
          >
            <Select
              mode="multiple"
              placeholder={
                businessTypeId
                  ? "Select sub categories"
                  : "Select a business type first"
              }
              className="web-input"
              options={subCategoryOptions}
              disabled={!businessTypeId}
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item name="phoneNumber" label="Phone Number" className="form-col">
              <Input placeholder="e.g. 555-123-4567" className="web-input" />
            </Form.Item>

            <Form.Item name="website" label="Website" className="form-col">
              <Input
                type="url"
                placeholder="https://..."
                className="web-input"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="ein"
            label="EIN (Employer ID)"
            rules={[{ required: true, message: "EIN is required" }]}
          >
            <Input placeholder="e.g. 12-3456789" className="web-input" />
          </Form.Item>

          <Form.Item
            name="about"
            label="About"
            rules={[{ required: true, message: "About is required" }]}
          >
            <TextArea
              rows={4}
              placeholder="Tell customers about your business"
              className="web-input"
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item name="facebook" label="Facebook" className="form-col">
              <Input
                placeholder="URL or username"
                className="web-input"
              />
            </Form.Item>
            <Form.Item name="instagram" label="Instagram" className="form-col">
              <Input placeholder="Username or URL" className="web-input" />
            </Form.Item>
          </div>

          <Form.Item name="tikTok" label="TikTok">
            <Input placeholder="Username or URL" className="web-input" />
          </Form.Item>

          <Form.Item name="importedReviews" label="Imported Reviews (optional)">
            <Input
              placeholder="Paste or describe imported reviews"
              className="web-input"
            />
          </Form.Item>

          <Form.Item label="Profile Image">
            <div
              className="image-upload-box border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center h-[160px] cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() =>
                document.getElementById("profileImageInput")?.click()
              }
            >
              <FiUploadCloud className="text-4xl text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {imageFile ? imageFile.name : "Click to upload image"}
              </p>
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
            {imageFile && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="mt-4 web-btn"
            >
              Create profile
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default BusinessProfileForm;
