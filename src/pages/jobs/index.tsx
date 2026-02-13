import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button, Skeleton } from "antd";
import { Briefcase, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useGetJobsByBusinessQuery } from "../../redux/services/jobService";

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessId = user?._id;

  const { data, isLoading, isError } = useGetJobsByBusinessQuery(
    { businessId: businessId! },
    { skip: !businessId }
  );

  const jobs = data?.data?.docs ?? data?.data ?? data?.docs ?? data ?? [];
  const list = Array.isArray(jobs) ? jobs : [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">Jobs</h1>
        <Button className="web-btn" onClick={() => navigate("/add-job")}>
          + Add Job
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-red-500">Failed to load jobs.</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Briefcase className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No jobs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Jobs you create will appear here.
            </p>
          </div>
        ) : (
          <>
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
                      Title
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
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500"
                    >
                      Posted
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
                  {list.map((job: any, index: number) => (
                    <TableRow key={job._id || index}>
                      <TableCell className="px-5 py-4 text-start">
                        #{index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {job.category ?? job.title ?? job.jobTitle ?? job.name ?? "—"}
                        {job.subCategory ? ` · ${job.subCategory}` : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {typeof job.location === "object" && job.location?.address
                          ? job.location.address
                          : job.location ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {job.jobType ?? job.type ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <Button
                          type="text"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="text-primary-500 hover:text-primary-600 !p-0 inline-flex items-center justify-center"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Jobs;
