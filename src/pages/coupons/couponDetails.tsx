import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate, useLocation } from "react-router";
import { UPLOADS_URL } from "../../constants/api";
import Badge from "../../components/ui/badge/Badge";

const getCouponStatusColor = (
  status: string
): "success" | "warning" | "error" | "primary" | "info" | "light" | "dark" => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "expired":
      return "error";
    default:
      return "primary";
  }
};

const CouponDetails = () => {
  const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const coupon = location.state?.coupon as any;

  if (!coupon) {
    return (
      <div className="py-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/coupons")}
          className="!p-0 !text-black dark:!text-white"
        />
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          No coupon data. Open from the coupons list.
        </p>
      </div>
    );
  }

  const locationAddress =
    typeof coupon.location === "object" && coupon.location?.address
      ? coupon.location.address
      : "—";
  const imageSrc = coupon.image ? `${UPLOADS_URL}${coupon.image}` : null;

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/coupons")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold capitalize">Coupon Details</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {imageSrc && (
              <div className="flex-shrink-0">
                <img
                  src={imageSrc}
                  alt={coupon.couponName}
                  className="rounded-lg object-cover w-full md:w-72 h-48"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {coupon.couponName ?? "—"}
              </h2>
              <div className="mb-4">
                {coupon.status ? (
                  <Badge color={getCouponStatusColor(coupon.status)}>
                    {coupon.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </div>
              <dl className="grid gap-3 text-sm">
                {coupon.description && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {coupon.description}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500 line-through mr-2">
                      ${Number(coupon.price ?? 0).toLocaleString()}
                    </span>
                    <span>
                      ${Number(coupon.discountedPrice ?? 0).toLocaleString()}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">
                    Start date
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {coupon.startDate
                      ? new Date(coupon.startDate).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">End date</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {coupon.endDate
                      ? new Date(coupon.endDate).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {locationAddress}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">
                    Redemptions
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {coupon.redemptionLimit != null
                      ? `${coupon.redemptionCount ?? 0} / ${
                          coupon.redemptionLimit
                        }`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponDetails;
