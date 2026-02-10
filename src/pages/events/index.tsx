import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { Col, Pagination, Row } from "antd";
import { CalendarDays } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import EventCard from "../../components/eventCard";
import { useGetBusinessEventsQuery } from "../../redux/services/eventService";
import usePagination from "../../utils/usePagination";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const Events = () => {
  const { user } = useSelector((state: any) => state.auth);
  const businessId = user?._id;
  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);

  const {
    data: eventsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetBusinessEventsQuery(
    { id: businessId!, page: pageNumber, limit },
    { skip: !businessId }
  );

  // update totalDocs whenever data changes
  useEffect(() => {
    if (eventsData?.data?.totalDocs) {
      updateTotalDocs(eventsData.data.totalDocs);
    }
  }, [eventsData?.data?.totalDocs, updateTotalDocs]);

  // refetch when page changes
  useEffect(() => {
    refetch();
  }, [pageNumber, limit, refetch]);

  const products = isFetching
    ? []
    : eventsData?.data?.docs?.map((event: any) => ({
        image: event.image,
        name: event.eventName,
        amount: event.ticketPrice || 0,
        date: event.date,
      })) || [];

  if (isLoading) return <p>Loading events...</p>;
  if (isError) return <p>Failed to load events.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold capitalize">Events</h1>
        {/* <Button className="web-btn">+ Add Event</Button> */}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <CalendarDays className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No events yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Events you create will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto p-4">
              <Row justify={"center"}>
                <Col xs={24} md={24} lg={24}>
                  <Row gutter={20}>
                    {products.map((product: any, index: any) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        <EventCard
                          image={product.image}
                          name={product.name}
                          subheading={product.subheading}
                          amount={product.amount}
                          date={product.date}
                        />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
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
          </>
        )}
      </div>
    </>
  );
};

export default Events;
