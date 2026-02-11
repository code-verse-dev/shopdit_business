import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Radio, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAddProductMutation } from "../../redux/services/productService";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";
import Label from "../../components/form/Label";
import { useState } from "react";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [wantsVariation, setWantsVariation] = useState<boolean>(false);

  const onFinish = async (values: Record<string, any>) => {
    const businessProfile = user?.activeProfile ?? user?.businessProfiles?.[0]?._id;
    if (!businessProfile) {
      ErrorPopup("No business profile selected.");
      return;
    }

    const formData = new FormData();
    formData.append("productName", values.productName);
    formData.append("description", values.description ?? "");
    formData.append("price", String(values.price ?? 0));
    const variations =
      wantsVariation && Array.isArray(values.variationList)
        ? values.variationList
            .filter((v: any) => v?.name != null && v?.name !== "")
            .map((v: any) => ({ name: v.name, price: Number(v.price) ?? 0 }))
        : [];
    formData.append("variations", JSON.stringify(variations));
    formData.append("pointsRequired", String(values.pointsRequired ?? 0));
    formData.append("rewardPoints", String(values.rewardPoints ?? 0));
    formData.append("requiredShopditPoints", String(values.requiredShopditPoints ?? 0));
    formData.append("businessProfile", businessProfile);
    if (imageFile) formData.append("image", imageFile);
    galleryFiles.forEach((file) => formData.append("gallery", file));

    try {
      await addProduct(formData).unwrap();
      SuccessPopup("Product created.");
      navigate("/product-listing");
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Failed to create product.");
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
        <h1 className="text-2xl font-semibold capitalize">Add Product</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-4 md:w-2/4">
          <h2 className="text-2xl font-semibold dark:text-white">
            Product Details
          </h2>

          <Form
            layout="vertical"
            onFinish={onFinish}
            className="mt-6 space-y-6"
          >
            <Form.Item
              name="productName"
              label={<Label className="font-semibold !text-black dark:!text-white">Product Name <span className="text-error-500">*</span></Label>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Enter Product Name" className="web-input" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Label className="font-semibold !text-black dark:!text-white">Description</Label>}
            >
              <TextArea
                rows={4}
                placeholder="Enter Product Description"
                className="web-input !min-h-[100px] !resize-none w-full"
                style={{ resize: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="price"
              label={<Label className="font-semibold !text-black dark:!text-white">Price ($) <span className="text-error-500">*</span></Label>}
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                className="web-input w-full"
                placeholder="0"
                prefix="$"
              />
            </Form.Item>

            <Form.Item
              name="pointsRequired"
              label={<Label className="font-semibold !text-black dark:!text-white">Points Required</Label>}
            >
              <InputNumber min={0} className="web-input w-full" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="rewardPoints"
              label={<Label className="font-semibold !text-black dark:!text-white">Reward Points</Label>}
            >
              <InputNumber min={0} className="web-input w-full" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="requiredShopditPoints"
              label={<Label className="font-semibold !text-black dark:!text-white">Required Shopdit Points</Label>}
            >
              <InputNumber min={0} className="web-input w-full" placeholder="0" />
            </Form.Item>

            <Form.Item
              label={<Label className="font-semibold !text-black dark:!text-white">Add variations?</Label>}
            >
              <Radio.Group
                value={wantsVariation}
                onChange={(e) => setWantsVariation(e.target.value)}
                className="flex gap-4"
              >
                <Radio value={false}>No</Radio>
                <Radio value={true}>Yes</Radio>
              </Radio.Group>
            </Form.Item>

            {wantsVariation && (
              <Form.Item
                label={<Label className="font-semibold !text-black dark:!text-white">Variations</Label>}
              >
                <Form.List name="variationList" initialValue={[{ name: "", price: undefined }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <Space
                          key={key}
                          align="start"
                          className="flex flex-wrap gap-2 mb-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]"
                        >
                          <Form.Item
                            {...rest}
                            name={[name, "name"]}
                            rules={[{ required: true, message: "Name" }]}
                            className="!mb-0"
                          >
                            <Input placeholder="Variation name (e.g. Size M)" className="web-input min-w-[180px]" />
                          </Form.Item>
                          <Form.Item
                            {...rest}
                            name={[name, "price"]}
                            rules={[{ required: true, message: "Price" }]}
                            className="!mb-0"
                          >
                            <InputNumber
                              min={0}
                              placeholder="Price"
                              className="web-input"
                              prefix="$"
                            />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            className="!mb-0"
                          />
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="w-full"
                      >
                        Add variation
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            )}

            <Form.Item
              label={<Label className="font-semibold !text-black dark:!text-white">Product Image <span className="text-error-500">*</span></Label>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input
                type="file"
                accept="image/*"
                className="web-input"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </Form.Item>

            <Form.Item label={<Label className="font-semibold !text-black dark:!text-white">Gallery (optional)</Label>}>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="web-input"
                onChange={(e) =>
                  setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
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

export default AddProduct;
