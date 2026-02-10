import { useCallback, useState } from "react";

export default function usePagination(initialLimit: number = 10) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [totalDocs, setTotalDocs] = useState<number>(0);

  const handlePageChange = useCallback((page: number): void => {
    setPageNumber(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number): void => {
    setLimit(newLimit);
    setPageNumber(1);
  }, []);

  const updateTotalDocs = useCallback((count: number): void => {
    setTotalDocs(count);
  }, []);

  return {
    pageNumber,
    limit,
    totalDocs,
    handlePageChange,
    handleLimitChange,
    updateTotalDocs,
  };
}
