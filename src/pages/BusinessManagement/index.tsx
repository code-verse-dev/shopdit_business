import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "antd";
import { Eye } from "lucide-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useGetBusinessProfilesQuery } from "../../redux/services/businessService";
import usePagination from "../../utils/usePagination";
import { useEffect } from "react";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessId = user?._id;

  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);
  const { data, isLoading, isError, isFetching } = useGetBusinessProfilesQuery(
    { businessId, page: pageNumber, limit },
    { skip: !businessId }
  );
  console.log(data);
  useEffect(() => {
    if (data?.data?.totalDocs) {
      updateTotalDocs(data.data.totalDocs);
    }
  }, [data?.data?.totalDocs, updateTotalDocs]);

  if (isLoading) return <>Loading...</>;
  if (isError) return <>Failed to load profiles.</>;
  const profiles = isFetching ? [] : data?.data?.docs || [];

  return (
    <>
      <h1 className="text-2xl font-bold py-2">Business Profiles</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto py-4">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  S.No
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  BUSINESS NAME
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  BUSINESS TYPE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  REGISTRATION DATE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  EMAIL ADDRESS
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {profiles?.map((user: any, index: number) => (
                <TableRow key={user._id || index}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.businessName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.businessType?.typeName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.phoneNumber || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        navigate(`/business-management/${user._id}`, {
                          state: {
                            user,
                          },
                        })
                      }
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      title="View Details"
                    >
                      <Eye
                        size={18}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
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

export default UserManagement;
