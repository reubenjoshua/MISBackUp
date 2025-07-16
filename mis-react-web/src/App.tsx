// IMPORT LIBRARIES AND DEPENDENCIES
import { useEffect } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { useAuthStore } from "@/context/authStore";

// ROUTES
import ProtectedRoutes    from "./routes/protectedRoutes";
import UnprotectedRoutes  from "./routes/unprotectedRoutes";

// LAYOUT
import Layout             from "./components/layout";

// PAGES
import PageNotFound       from "./pages/pageNotFound";
import Login              from "./pages/login";
import DashboardPage      from "./pages/dashboard";
import ManageUser         from "./pages/manageUser";
import ManageBranch       from "./pages/manageBranch";
import Monthly            from "./pages/monthly";
import Daily              from "./pages/daily";
import ApproveData        from "./pages/approveData";
import DataStatus         from "./pages/dataStatus";
import ManageProfile      from "./pages/profile";

const App = () => {
    // const fetchUser = useAuthStore ((state) => state.fetchCurrentUser);

    // useEffect (() => {
    //     // fetchUser();
    //     useAuthStore.getState().fetchCurrentUser();
    // }, []);

  const NoUserPage = () => (
    <>
        <Outlet />
        <ToastContainer />
    </>
  );

  const WithNavigation = () => (
    <>
        <Layout />
        <ToastContainer />
    </>
  );

  const routers = createBrowserRouter([
    {
      element: <NoUserPage />,
      children: [
        {
          path: '/',
          element: <Navigate to = "/login" />
        },
        {
          path: '/login',
          element:
            <UnprotectedRoutes>
              <Login />
            </UnprotectedRoutes>
        },
        {
          path: '*',
          element: <PageNotFound />
        },
      ],
    },
    {
      element: <WithNavigation />,
      children: [
        {
          path: '/dashboard',
          element:
            <ProtectedRoutes>
              <DashboardPage />
            </ProtectedRoutes>
        },
        {
          path: '/manage-user',
          element:
            <ProtectedRoutes>
              <ManageUser />
            </ProtectedRoutes>
        },
        {
          path: '/manage-branch',
          element:
            <ProtectedRoutes>
              <ManageBranch />
            </ProtectedRoutes>
        },
        {
          path: '/monthly',
          element:
            <ProtectedRoutes>
              <Monthly />
            </ProtectedRoutes>
        },
        {
          path: '/daily',
          element:
            <ProtectedRoutes>
              <Daily />
            </ProtectedRoutes>
        },
        {
          path: '/approve-data',
          element:
            <ProtectedRoutes>
              <ApproveData />
            </ProtectedRoutes>
        },
        {
          path: '/status',
          element:
            <ProtectedRoutes>
              <DataStatus />
            </ProtectedRoutes>
        },
        {
          path: '/profile',
          element:
            <ProtectedRoutes>
              <ManageProfile />
            </ProtectedRoutes>
        }
      ],
    }
  ],
  {
    basename: "/mis",
  });

  return <RouterProvider router = { routers } />;
};

export default App;
