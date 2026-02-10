import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { Pagination } from "antd";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useSelector } from "react-redux";
import { useGetBusinessCustomersQuery } from "../../redux/services/customerService";
import usePagination from "../../utils/usePagination";
import { useEffect } from "react";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const Customer = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const businessProfileId = user?.activeProfile;

  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetBusinessCustomersQuery(
      { businessProfileId, page: pageNumber, limit },
      { skip: !businessProfileId }
    );

  // update total docs whenever data changes
  useEffect(() => {
    if (data?.data?.totalDocs) {
      updateTotalDocs(data.data.totalDocs);
    }
  }, [data?.data?.totalDocs, updateTotalDocs]);

  // refetch when page or limit changes
  useEffect(() => {
    refetch();
  }, [pageNumber, limit, refetch]);

  const tableData = isFetching ? [] : data?.data?.customers || [];

  if (isLoading) return <p>Loading customers...</p>;
  if (isError) return <p>Failed to load customers.</p>;
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">Customers</h1>
        <button
          type="button"
          className="web-btn"
          onClick={() => navigate("/add-customer")}
        >
          + Add Customer
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto py-4">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  S.No
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Email
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Total Orders
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Gender
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                >
                  Last Order Date
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-4">Loading...</TableCell>
                </TableRow>
              ) : tableData.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((user: any, index: number) => (
                  <TableRow key={user._id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {user?.user?.fullName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {user?.user?.email}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {user?.user?.phoneNumber || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {user?.totalOrders}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {user?.user?.gender}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm">
                      {new Date(user?.lastOrderDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4">
          <Pagination
            align="end"
            current={pageNumber}
            pageSize={limit}
            total={totalDocs}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Customer;
