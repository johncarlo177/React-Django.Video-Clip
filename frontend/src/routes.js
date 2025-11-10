import LandingPage from "Landing";
import Dashboard from "layouts/dashboard";
import Upload from "layouts/upload";
import Billing from "layouts/subscription";
import FAQ from "layouts/faq";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import AdminSignIn from "layouts/authentication/admin-sign-in";
import AdminDashboard from "layouts/admin-dashboard";
import SignUp from "layouts/authentication/sign-up";
import Deliveries from "layouts/deliveries";
import PaymentStatus from "layouts/payment-status";
import ViewUploads from "layouts/view-uploads";
import CheckoutPage from "layouts/subscription/components/Checkout";
import ReturnPage from "layouts/subscription/components/ReturnPage";
import GetStockClips from "layouts/dashboard/components/GetStockClips";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/",
    component: <LandingPage />,
    publicOnly: true,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">space_dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Stock-Clips",
    key: "stock-clips",
    route: "/dashboard/get-stock-clips",
    component: <GetStockClips />,
    protected: true,
    hidden: true,
  },
  {
    type: "collapse",
    name: "Upload File",
    key: "upload",
    icon: <Icon fontSize="small">cloud_upload</Icon>,
    route: "/upload",
    component: <Upload />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Subscription",
    key: "subscription",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/subscription",
    component: <Billing />,
    protected: true,
  },
  {
    type: "collapse",
    name: "checkout",
    key: "checkout",
    route: "/subscription/checkout",
    component: <CheckoutPage />,
    protected: true,
    hidden: true,
  },
  {
    type: "collapse",
    name: "checkout-return",
    key: "checkout-return",
    route: "/subscription/checkout-return",
    component: <ReturnPage />,
    protected: true,
    hidden: true,
  },
  {
    type: "collapse",
    name: "FAQ",
    key: "faq",
    icon: <Icon fontSize="small">help_outline</Icon>,
    route: "/FAQ",
    component: <FAQ />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Contact",
    key: "profile",
    icon: <Icon fontSize="small">contact_support</Icon>,
    route: "/contact",
    component: <Profile />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    route: "/sign-in",
    component: <SignIn />,
    publicOnly: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    route: "/sign-up",
    component: <SignUp />,
    publicOnly: true,
  },
  {
    type: "collapse",
    name: "admin",
    key: "admin",
    route: "/admin/sign-in",
    component: <AdminSignIn />,
    publicOnly: true,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">space_dashboard</Icon>,
    route: "/admin/dashboard",
    component: <AdminDashboard />,
    admin: true,
  },
  {
    type: "collapse",
    name: "Uploads",
    key: "view-uploads",
    icon: <Icon fontSize="small">video_library</Icon>,
    route: "/admin/view-uploads",
    component: <ViewUploads />,
    admin: true,
  },
  {
    type: "collapse",
    name: "Payment",
    key: "payment-status",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/admin/payment-status",
    component: <PaymentStatus />,
    admin: true,
  },
  {
    type: "collapse",
    name: "Deliveries",
    key: "deliveries",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/admin/deliveries",
    component: <Deliveries />,
    admin: true,
  },
];

export default routes;
