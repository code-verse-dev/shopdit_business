import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import VerificationCode from "./pages/AuthPages/VerificationCode";
import Forgotpassword from "./pages/AuthPages/forgotpassword";
import ResetPassword from "./pages/AuthPages/resetPassword";
import SubscriptionPlan from "./pages/AuthPages/subscriptionPlan";
import CampaignManagement from "./pages/campaign";
import ViewCampaign from "./pages/campaign/viewCampaign";
import CreateCampaign from "./pages/campaign/createCampaign";
import PublicRoute from "./routes/publicRoute";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import NotFound from "./pages/OtherPage/NotFound";
import Unauthorized from "./pages/OtherPage/Unauthorized";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";
// import ProtectedRoute, { Role } from "./routes/auth-route";
import { JSX } from "react";

import BusinessManagement from "./pages/BusinessManagement";
import BusinessDetails from "./pages/BusinessManagement/businessDetails";
import CreateBusinessProfile from "./pages/BusinessManagement/createBusinessProfile";

import Events from "./pages/events";

import MyCollaboration from "./pages/myCollaboration";
import CampaignAnalytics from "./pages/campaignAnalytics/indesx";
import Rewards from "./pages/rewards";
import Customer from "./pages/customer";
import ProductListing from "./pages/productListing";
import OrderManagement from "./pages/orderManagement";
import OrderDetails from "./pages/orderManagement/orderDetails";
import AddReward from "./pages/rewards/addReward";
import AddProduct from "./pages/productListing/addProduct";
import AddCustomer from "./pages/customer/addCustomer";
import ProtectedRoute from "./routes/auth-route";

interface RouteConfig {
  path: string;
  element: JSX.Element;
  title?: string;
  activeTab?: string;
}

const routesConfig: RouteConfig[] = [
  {
    path: "/",
    element: <Home />,

    title: "Dashboard",
    activeTab: "dashboard",
  },
  {
    path: "/profile",
    element: <UserProfiles />,

    title: "profile",
  },
  {
    path: "/business-management",
    element: <BusinessManagement />,

    title: "Business Management",
  },
  {
    path: "/business-management/:id",
    element: <BusinessDetails />,

    title: "Business Management",
  },
  {
    path: "/business-profile",
    element: <CreateBusinessProfile />,

    title: "Create Business Profile",
  },
  {
    path: "/events",
    element: <Events />,

    title: "Events And Add Event",
  },
  {
    path: "/my-collaboration",
    element: <MyCollaboration />,

    title: "MY COLLABORATION",
  },

  {
    path: "/campaign-management",
    element: <CampaignManagement />,

    title: "Campaign Management",
  },
  {
    path: "/create-campaign",
    element: <CreateCampaign />,

    title: "Campaign Management",
  },
  {
    path: "/campaign-management/:id",
    element: <ViewCampaign />,

    title: "Campaign Management",
  },
  {
    path: "/analytics",
    element: <CampaignAnalytics />,

    title: "Analytics",
  },

  {
    path: "/rewards",
    element: <Rewards />,

    title: "Rewards",
  },
  {
    path: "/add-reward",
    element: <AddReward />,

    title: "Add Rewards",
  },
  {
    path: "/customer",
    element: <Customer />,

    title: "Customer",
  },
  {
    path: "/add-customer",
    element: <AddCustomer />,

    title: "Add Customer",
  },
  {
    path: "/product-listing",
    element: <ProductListing />,

    title: "Product Listing",
  },
  {
    path: "/add-product",
    element: <AddProduct />,

    title: "Add Product",
  },

  {
    path: "/order-management",
    element: <OrderManagement />,

    title: "Order Management",
  },
  {
    path: "/order-management/:id",
    element: <OrderDetails />,

    title: "Campaign Management",
  },
];

export default function App() {
  return (
    <>
      <Router basename="/shopdit-business">
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            {routesConfig?.map(({ path, element }) => (
              <Route
                key={path}
                index={path === "/"}
                path={path}
                element={<ProtectedRoute>{element}</ProtectedRoute>}
              />
            ))}
          </Route>
          <Route element={<AppLayout />}>
            {/* Others Page */}

            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
          {/* Auth Layout */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/forgotpassword"
            element={
              <PublicRoute>
                <Forgotpassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verification-code"
            element={
              <PublicRoute>
                <VerificationCode />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/subscription-plan"
            element={
              <PublicRoute>
                <SubscriptionPlan />
              </PublicRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </>
  );
}
