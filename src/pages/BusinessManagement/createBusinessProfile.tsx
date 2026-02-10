import PageMeta from "../../components/common/PageMeta";
import BusinessProfileForm from "../../components/auth/businessProfileForm";

/** Create business profile page (inside app layout, for logged-in users). */
export default function CreateBusinessProfile() {
  return (
    <>
      <PageMeta
        title="Shopdit | Create Business Profile"
        description="Create a new business profile."
      />
      <BusinessProfileForm />
    </>
  );
}
