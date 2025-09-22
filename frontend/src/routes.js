import Dashboard from "layouts/dashboard";
import Upload from "layouts/upload";
import Billing from "layouts/subscription";
import FAQ from "layouts/faq";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Upload File",
    key: "upload",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/upload",
    component: <Upload />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Subscription",
    key: "subscription",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/subscription",
    component: <Billing />,
    protected: true,
  },
  {
    type: "collapse",
    name: "FAQ",
    key: "faq",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/FAQ",
    component: <FAQ />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Contact",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/contact",
    component: <Profile />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/sign-in",
    component: <SignIn />,
    publicOnly: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/sign-up",
    component: <SignUp />,
    publicOnly: true,
  },
];

export default routes;
