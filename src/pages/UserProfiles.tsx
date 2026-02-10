import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { useSelector } from "react-redux";
import { useGetMyProfileQuery } from "../redux/services/userSlice";

export default function UserProfiles() {
  const { user } = useSelector((state: any) => state.auth);
  const { data: profile, isLoading } = useGetMyProfileQuery(user?._id);
  console.log("data", profile);

  if (isLoading) return <>Loading...</>;
  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | Shopdit - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for Shopdit - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard profile={profile?.data} />
          <UserInfoCard profile={profile?.data} />
        </div>
      </div>
    </>
  );
}
