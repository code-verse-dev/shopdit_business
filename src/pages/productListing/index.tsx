import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination, Skeleton } from "antd";
import { Package, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { useSelector } from "react-redux";
import { useGetBusinessProductsQuery } from "../../redux/services/productService";
import usePagination from "../../utils/usePagination";
import { useEffect } from "react";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const ProductListing = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const businessProfileId = user?.activeProfile;

  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);

  const { data, isLoading, isFetching, isError } = useGetBusinessProductsQuery({
    businessProfileId: businessProfileId!,
    page: pageNumber,
    limit,
  }, { skip: !businessProfileId });

  const products = data?.data?.docs || [];

  useEffect(() => {
    if (data?.data?.totalDocs) {
      updateTotalDocs(data.data.totalDocs);
    }
  }, [data?.data?.totalDocs, updateTotalDocs]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold py-2">Product Listing</h1>
        <button
          type="button"
          className="web-btn"
          onClick={() => navigate("/add-product")}
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {isLoading || isFetching ? (
          <div className="p-6 space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-red-500">Failed to load products.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Package className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No products yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
              Add your first product to start selling.
            </p>
            {/* <button
              type="button"
              onClick={() => navigate("/add-product")}
              className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              + Add Product
            </button> */}
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
                      Product Name
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
                      Reward Points
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500"
                    >
                      Added On
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
                  {products.map((product: any, index: number) => (
                    <TableRow key={product._id || index}>
                      <TableCell className="px-5 py-4 text-start">
                        #{(pageNumber - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {product.productName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {product.price}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {product.rewardPoints || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        {new Date(product.createdAt).toLocaleDateString() || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start">
                        <button
                          type="button"
                          onClick={() => navigate(`/product-listing/${product._id}`)}
                          className="text-primary-500 hover:text-primary-600 inline-flex items-center justify-center"
                          title="See more"
                        >
                          <Eye className="h-4 w-4" />
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
                total={totalDocs}
                pageSize={limit}
                onChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProductListing;
