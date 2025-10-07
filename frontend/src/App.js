import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import PropTypes from "prop-types";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

// ----- ROUTE WRAPPERS -----
function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/sign-in" replace />;
  return children;
}
PrivateRoute.propTypes = { children: PropTypes.node.isRequired };

function PublicRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const adminToken = localStorage.getItem("admin-token");

  if (token) return <Navigate to="/dashboard" replace />;
  if (adminToken) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
PublicRoute.propTypes = { children: PropTypes.node.isRequired };

function AdminRoute({ children }) {
  const token = localStorage.getItem("admin-token");
  if (!token) return <Navigate to="/admin/sign-in" replace />;
  return children;
}
AdminRoute.propTypes = { children: PropTypes.node.isRequired };

// ----- APP COMPONENT -----
export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // ----- FILTER ROUTES FOR SIDEBARS -----
  const userRoutes = routes.filter((r) => !r.admin);
  const adminRoutes = routes.filter((r) => r.admin);

  // ----- RENDER ROUTES -----
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);
      if (route.route) {
        if (route.admin) {
          return (
            <Route
              key={route.key}
              path={route.route}
              element={<AdminRoute>{route.component}</AdminRoute>}
            />
          );
        }
        if (route.protected) {
          return (
            <Route
              key={route.key}
              path={route.route}
              element={<PrivateRoute>{route.component}</PrivateRoute>}
            />
          );
        }
        if (route.publicOnly) {
          return (
            <Route
              key={route.key}
              path={route.route}
              element={<PublicRoute>{route.component}</PublicRoute>}
            />
          );
        }
        return <Route key={route.key} path={route.route} element={route.component} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />

      {layout === "dashboard" && !pathname.startsWith("/admin") && (
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="Video Clip"
          routes={userRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}

      {layout === "dashboard" && pathname.startsWith("/admin") && (
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="Admin Panel"
          routes={adminRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}

      {layout === "vr" && <Configurator />}

      <Routes>
        {getRoutes(routes)}
        {/* fallback */}
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/sign-in" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
