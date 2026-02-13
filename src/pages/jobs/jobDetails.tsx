import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useGetJobQuery } from "../../redux/services/jobService";
import { useGetJobApplicationsQuery } from "../../redux/services/applicationService";
import { UPLOADS_URL } from "../../constants/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: jobData, isLoading: jobLoading, isError: jobError } = useGetJobQuery(
    id!,
    { skip: !id }
  );
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useGetJobApplicationsQuery(id!, { skip: !id });

  const job = jobData?.data ?? jobData;
  const applications =
    applicationsData?.data?.docs ??
    applicationsData?.data ??
    applicationsData?.docs ??
    applicationsData ??
    [];
  const applicationsList = Array.isArray(applications) ? applications : [];

  if (jobLoading || (!job && !jobError)) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="py-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/jobs")}
          className="!p-0 !text-black dark:!text-white"
        />
        <p className="mt-4 text-red-500">Failed to load job.</p>
      </div>
    );
  }

  const title =
    [job.category, job.subCategory].filter(Boolean).join(" · ") ||
    (job.title ?? job.jobTitle ?? job.name ?? "—");
  const location =
    typeof job.location === "object" && job.location?.address
      ? job.location.address
      : job.location ?? job.locationAddress ?? "—";
  const jobType = job.jobType ?? job.type ?? "—";
  const description = job.description ?? "—";
  const postedAt = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : "—";
  const imageSrc = job.image ? `${UPLOADS_URL}${job.image}` : null;

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/jobs")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold capitalize">Job Details</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {imageSrc && (
              <div className="flex-shrink-0">
                <img
                  src={imageSrc}
                  alt={title}
                  className="rounded-lg object-cover w-full md:w-56 h-40"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {title}
              </h2>
              <dl className="grid gap-3 text-sm mb-6">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {location}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Job type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {jobType}
                  </dd>
                </div>
                {job.salary != null && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Salary</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      ${Number(job.salary).toLocaleString()}
                    </dd>
                  </div>
                )}
                {job.contactNumber != null && job.contactNumber !== "" && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Contact</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {job.contactNumber}
                    </dd>
                  </div>
                )}
                {job.facebookLink && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Facebook</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      <a
                        href={job.facebookLink.startsWith("http") ? job.facebookLink : `https://${job.facebookLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:underline"
                      >
                        {job.facebookLink}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Posted</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {postedAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {description}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Applications
          </h3>
          {applicationsLoading ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading applications...
            </p>
          ) : applicationsError ? (
            <p className="text-red-500 text-sm">Failed to load applications.</p>
          ) : applicationsList.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No applications yet.
            </p>
          ) : (
            <div className="max-w-full overflow-x-auto">
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
                      Applicant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500"
                    >
                      Applied
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500"
                    >
                      File
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {applicationsList.map((app: any, index: number) => (
                    <TableRow key={app._id || index}>
                      <TableCell className="px-5 py-4 text-start">
                        #{index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {app.user?.fullName ??
                          app.fullName ??
                          app.applicantName ??
                          "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {app.user?.email ?? app.email ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {app.file ? (
                          <a
                            href={`${UPLOADS_URL}${app.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 text-sm font-medium text-primary-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            View file
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetails;
