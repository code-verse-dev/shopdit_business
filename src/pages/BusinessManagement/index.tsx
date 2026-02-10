import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "antd";
import { Building2, Check, Eye, RefreshCw } from "lucide-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useGetBusinessProfilesQuery } from "../../redux/services/businessService";
import { useSetActiveProfileMutation } from "../../redux/services/userSlice";
import { setActiveProfile as setActiveProfileAction } from "../../redux/slices/authSlice";
import usePagination from "../../utils/usePagination";
import { useEffect, useState } from "react";
import { SuccessPopup, ErrorPopup } from "../../components/popup/Popup";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const UserManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const businessId = user?._id;

  const { pageNumber, limit, totalDocs, handlePageChange, updateTotalDocs } =
    usePagination(10);
  const { data, isLoading, isError, isFetching } = useGetBusinessProfilesQuery(
    { businessId, page: pageNumber, limit },
    { skip: !businessId }
  );
  const [setActiveProfile] = useSetActiveProfileMutation();
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (data?.data?.totalDocs) {
      updateTotalDocs(data.data.totalDocs);
    }
  }, [data?.data?.totalDocs, updateTotalDocs]);

  const handleSwitchProfile = async (profileId: string) => {
    if (profileId === activeProfileId) return;
    setSwitchingProfileId(profileId);
    try {
      await setActiveProfile({ profileId }).unwrap();
      dispatch(setActiveProfileAction(profileId));
      SuccessPopup("Active business profile updated.");
    } catch (err: any) {
      ErrorPopup(err?.data?.message || "Failed to switch profile.");
    } finally {
      setSwitchingProfileId(null);
    }
  };

  if (isLoading) return <>Loading...</>;
  if (isError) return <>Failed to load profiles.</>;
  const profiles = isFetching ? [] : data?.data?.docs || [];

  const activeProfileIdFromResponse = profiles[0]?.business?.activeProfile;
  const activeProfileId =
    activeProfileIdFromResponse ?? user?.activeProfile;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Business Profiles</h1>
        <button
          type="button"
          onClick={() => navigate("/business-profile")}
          className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 dark:border-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          + Add business profile
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Building2 className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No business profiles yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
              Create your first business profile to manage events, products, and orders.
            </p>
            <button
              type="button"
              onClick={() => navigate("/business-profile")}
              className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              + Add business profile
            </button>
          </div>
        ) : (
          <>
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
                      PHONE
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      STATUS
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {profiles?.map((profile: any, index: number) => (
                <TableRow key={profile._id || index}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {profile.businessName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {profile.businessType?.typeName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {profile.phoneNumber || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {profile._id === activeProfileId ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        Current profile
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSwitchProfile(profile._id)}
                        disabled={!!switchingProfileId}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-gray-300 dark:hover:border-white/30 dark:hover:bg-white/10"
                      >
                        {switchingProfileId === profile._id ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                            Switching…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                            Switch here
                          </>
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() =>
                          navigate(`/business-management/${profile._id}`, {
                            state: {
                              profile,
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
                    </div>
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
          </>
        )}
      </div>
    </>
  );
};

export default UserManagement;
