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
import { useGetCampaignsQuery } from "../../redux/services/campaignsService";
import usePagination from "../../utils/usePagination";
import { useEffect } from "react";
import Badge from "../../components/ui/badge/Badge";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const getStatusColor = (status: string): "success" | "error" | "primary" => {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "error";
    case "upcoming":
      return "primary";
    default:
      return "primary";
  }
};

const CampaignManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessId = user?.activeProfile;
  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);

  const { data, isLoading, isFetching, isError } = useGetCampaignsQuery(
    { businessId: businessId!, page: pageNumber, limit },
    { skip: !businessId }
  );

  console.log(data);

  useEffect(() => {
    if (data?.data?.totalDocs) {
      updateTotalDocs(data?.data?.totalDocs);
    }
  }, [updateTotalDocs, data?.data?.totalDocs]);

  const tableData = isFetching ? [] : data?.data || [];

  if (isLoading) return <p>Loading campaigns...</p>;
  if (isError) return <p>Failed to load campaigns.</p>;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">Campaign Management</h1>
        <button
          type="button"
          className="web-btn"
          onClick={() => navigate("/create-campaign")}
        >
          + CREATE NEW CAMPAIGN
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
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  S.No
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Campaign Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Campaign Start Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Campaign End Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
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
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-4">
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((campaign: any, index: number) => (
                  <TableRow key={campaign._id || index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      #{(pageNumber - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {campaign?.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(
                        campaign?.campaignStartDate
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(campaign?.campaignEndDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                      <Badge color={getStatusColor(campaign.status)}>
                        {campaign?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          navigate(`/campaign-management/${campaign._id}`)
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

export default CampaignManagement;
