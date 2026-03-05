import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { useNavigate, useParams } from "react-router";
import { useGetProductQuery } from "../../redux/services/productService";
import { UPLOADS_URL } from "../../constants/api";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetProductQuery(id!, { skip: !id });

  const product = data?.data ?? data;

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/product-listing")}
          className="!p-0 !text-black dark:!text-white"
        />
        <p className="mt-4 text-red-500">Failed to load product.</p>
      </div>
    );
  }

  const imageUrl = product.image
    ? `${UPLOADS_URL}${product.image}`
    : undefined;
  const gallery = Array.isArray(product.gallery)
    ? product.gallery.map((f: string) => `${UPLOADS_URL}${f}`)
    : [];

  return (
    <>
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/product-listing")}
            className="!p-0 !text-black dark:!text-white"
          />
          <h1 className="text-2xl font-semibold capitalize">Product Details</h1>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/product-listing/${id}/edit`)}
          className="web-btn"
        >
          Edit Product
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-6 max-w-3xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.productName}
                  className="rounded-lg object-cover w-full md:w-64 h-64"
                />
              ) : (
                <div className="w-full md:w-64 h-64 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {gallery.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {gallery.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-14 h-14 rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {product.productName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Added {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}
              </p>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    ${product.price ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Reward Points</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {product.rewardPoints ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Points Required</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {product.pointsRequired ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Required Shopdit Points</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {product.requiredShopditPoints ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Description</dt>
                  <dd className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {product.description || "—"}
                  </dd>
                </div>
                {product.variations?.length > 0 && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 mb-1">Variations</dt>
                    <dd className="text-gray-700 dark:text-gray-300">
                      <ul className="list-disc list-inside space-y-0.5">
                        {product.variations.map((v: any, i: number) => (
                          <li key={i}>
                            {v.name}
                            {v.price != null ? ` — $${v.price}` : ""}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
