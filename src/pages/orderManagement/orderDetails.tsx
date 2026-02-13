import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { useNavigate, useParams, useLocation } from "react-router";
import { useGetOrderQuery } from "../../redux/services/orderService";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { UPLOADS_URL } from "../../constants/api";

const getStatusColor = (
  status: string
): "success" | "warning" | "error" | "primary" => {
  switch (status) {
    case "Delivered":
      return "success";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "error";
    case "Processing":
      return "primary";
    default:
      return "primary";
  }
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const orderFromState = location.state?.order as any;

  const { data: orderData, isLoading, isError } = useGetOrderQuery(id!, {
    skip: !id || !!orderFromState,
  });

  const order =
    orderFromState ?? orderData?.data ?? orderData;

  if (!orderFromState && (isLoading || (!order && !isError))) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/order-management")}
          className="!p-0 !text-black dark:!text-white"
        />
        <p className="mt-4 text-red-500">Order not found.</p>
      </div>
    );
  }

  const customerName = order.personName ?? order.user?.fullName ?? "—";
  const email = order.user?.email ?? "—";
  const phone = order.user?.phoneNumber ?? "—";
  const deliveryAddress =
    typeof order.deliveryAddress === "object" && order.deliveryAddress?.address
      ? order.deliveryAddress.address
      : order.deliveryAddress ?? "—";
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "—";
  const products = Array.isArray(order.products) ? order.products : [];

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/order-management")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold capitalize">Order Details</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Order #{order._id?.slice(-6) ?? "—"}
          </h2>

          <dl className="grid gap-3 text-sm mb-6 md:grid-cols-2">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Customer</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {customerName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {email}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Order date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {orderDate}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd>
                <Badge size="sm" color={getStatusColor(order.status ?? "")}>
                  {order.status ?? "—"}
                </Badge>
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-gray-500 dark:text-gray-400">Delivery address</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {deliveryAddress}
              </dd>
            </div>
            {order.specialInstructions && (
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400">Special instructions</dt>
                <dd className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                  {order.specialInstructions}
                </dd>
              </div>
            )}
          </dl>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Items
          </h3>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-gray-500"
                  >
                    Product
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-gray-500"
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-gray-500"
                  >
                    Unit price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-gray-500"
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((item: any, index: number) => {
                  const name =
                    item.name ??
                    item.productDetails?.productName ??
                    "—";
                  const qty = item.quantity ?? 0;
                  const unitPrice = item.basePrice ?? item.productDetails?.price ?? 0;
                  const lineTotal = qty * Number(unitPrice);
                  const image =
                    item.productDetails?.image ?? item.image;
                  return (
                    <TableRow key={item._id ?? index}>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <div className="flex items-center gap-3">
                          {image && (
                            <img
                              src={`${UPLOADS_URL}${image}`}
                              alt=""
                              className="h-10 w-10 rounded object-cover shrink-0"
                            />
                          )}
                          <span>{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-end">
                        {qty}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-end">
                        ${Number(unitPrice).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-end font-medium">
                        ${lineTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="text-right text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal </span>
              <span className="ml-3 font-semibold text-gray-900 dark:text-white">
                ${Number(order.subTotal ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
