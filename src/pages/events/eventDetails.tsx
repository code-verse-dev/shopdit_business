import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import { useGetEventQuery } from "../../redux/services/eventService";
import { UPLOADS_URL } from "../../constants/api";

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetEventQuery(id!, { skip: !id });

  const event = data?.data ?? data;

  if (isLoading || !event) {
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
          onClick={() => navigate("/events")}
          className="!p-0 !text-black dark:!text-white"
        />
        <p className="mt-4 text-red-500">Failed to load event.</p>
      </div>
    );
  }

  const imageUrl = event.image
    ? `${UPLOADS_URL}${event.image}`
    : undefined;
  const locationAddress =
    typeof event.location === "object" && event.location?.address
      ? event.location.address
      : typeof event.location === "string"
        ? event.location
        : "";
  const dateStr = event.date
    ? dayjs(event.date).format("MMMM D, YYYY")
    : "—";
  const timeStr = event.time
    ? dayjs(event.time).format("h:mm A")
    : "—";

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/events")}
          className="!p-0 !text-black dark:!text-white"
        />
        <h1 className="text-2xl font-semibold capitalize">Event Details</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-6 max-w-3xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={event.eventName}
                  className="rounded-lg object-cover w-full md:w-80 h-52"
                />
              ) : (
                <div className="w-full md:w-80 h-52 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {event.eventName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {event.status ? String(event.status).toLowerCase() : ""}
              </p>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {dateStr}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Time</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {timeStr}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Ticket Price</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    ${event.ticketPrice ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {locationAddress || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Description</dt>
                  <dd className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {event.description || "—"}
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

export default EventDetails;
