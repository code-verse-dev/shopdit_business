import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "antd";
import { Ticket, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useGetBusinessCouponsQuery } from "../../redux/services/couponService";

const Coupons = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessProfileId =
    user?.activeProfile ?? user?.businessProfiles?.[0]?._id;

  const { data, isLoading, isError } = useGetBusinessCouponsQuery(
    { businessProfileId: businessProfileId! },
    { skip: !businessProfileId }
  );

  const coupons = data?.data?.docs ?? data?.data ?? data?.docs ?? data ?? [];
  const list = Array.isArray(coupons) ? coupons : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading coupons...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-red-500">Failed to load coupons.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">Coupons</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Ticket className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No coupons yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Coupons for your business will appear here.
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto py-4">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Coupon
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Start
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    End
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Location
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Redemptions
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {list.map((coupon: any, index: number) => {
                  const locationAddress =
                    typeof coupon.location === "object" && coupon.location?.address
                      ? coupon.location.address
                      : "—";
                  const redemption =
                    coupon.redemptionLimit != null
                      ? `${coupon.redemptionCount ?? 0} / ${coupon.redemptionLimit}`
                      : "—";
                  return (
                    <TableRow key={coupon._id || index}>
                      <TableCell className="px-5 py-4 text-start">
                        #{index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {coupon.couponName ?? "—"}
                          </div>
                          {coupon.description ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                              {coupon.description}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <span className="text-gray-500 line-through">
                          ${Number(coupon.price ?? 0).toLocaleString()}
                        </span>
                        <span className="ml-1 font-medium">
                          ${Number(coupon.discountedPrice ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {coupon.startDate
                          ? new Date(coupon.startDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {coupon.endDate
                          ? new Date(coupon.endDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start max-w-[160px] truncate">
                        {locationAddress}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {redemption}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start capitalize">
                        {coupon.status ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <Button
                          type="text"
                          onClick={() =>
                            navigate(`/coupons/${coupon._id}`, {
                              state: { coupon },
                            })
                          }
                          className="text-primary-500 hover:text-primary-600 !p-0 inline-flex items-center justify-center"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default Coupons;
