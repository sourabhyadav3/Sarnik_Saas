import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./Landing/LandingPage";

/* Layout */
import Navbar from "./Layout/Navbar";
import Sidebar from "./Layout/Sidebar";

/* Auth */
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";

/* Common */
import Profile from "./Common/Profile/Profile";
import ChangePassword from "./Common/ChangePassword/ChangePassword";


/* Admin */
import AdminDashboard from "./Component/Admin_Dashboard/Dashboard/AdminDashboard";
import UsersList from "./Component/Admin_Dashboard/Admin_UserList/Admin_UserList";
import ReportsAnalytics from "./Component/Admin_Dashboard/Admin_ReportsAnalytics/Admin_ReportsAnalytics";
import ClientSupplier from "./Component/Admin_Dashboard/Admin_ClientSupplier/Admin_ClientSupplier";
import TimesheetOverview from "./Component/Admin_Dashboard/Admin_TimesheetOverview/Admin_TimesheetOverview";
import AdminSetting from "./Component/Admin_Dashboard/Admin_Setting/AdminSetting";
import AssignedJobs from "./Component/Admin_Dashboard/Designer_panel/AssignedJobs/AssignedJobs";

/* Projects */
import ProjectLists from "./Component/Admin_Dashboard/modules/projects/pages/ProjectLists";
import ProjectDetails from "./Component/Admin_Dashboard/modules/projects/pages/ProjectDetails";
import AddEditProject from "./Component/Admin_Dashboard/modules/projects/pages/AddEditProject";
import AddEditJob from "./Component/Admin_Dashboard/modules/projects/jobs/AddEditJob";
import JobDetails from "./Component/Admin_Dashboard/modules/projects/jobs/JobDetailsModal";

/* Finance */
import CostEstimatesUI from "./Component/Admin_Dashboard/modules/projects/finance/CostEstimates";
import AddEditCostEstimate from "./Component/Admin_Dashboard/modules/projects/finance/AddEditCostEstimate";
import AddPO from "./Component/Admin_Dashboard/modules/projects/finance/AddPO";
import ReceivablePO from "./Component/Admin_Dashboard/modules/projects/finance/ReceivablePO";
import Invoicing from "./Component/Admin_Dashboard/modules/projects/finance/Invoicing";
import JobTracker from "./Component/Admin_Dashboard/JobTracker/JobTracker";

/* Production */
import ProductionDashboard from "./Component/Production_Dashboard/Dashboard/ProductionDashboard";
import Production_MyJobs from "./Component/Production_Dashboard/Production_MyJobs/Production_MyJobs";
import ProductionAssignedJobs from "./Component/Production_Dashboard/MyProduction/Assign/ProductionAssignedJobs";
import JobsInProgress from "./Component/Production_Dashboard/MyProduction/In Progress/JobsInProgress";
import CompletedJobs from "./Component/Production_Dashboard/MyProduction/Completed/CompletedJobs";
import RejectedJobs from "./Component/Production_Dashboard/MyProduction/Rejected/RejectedJobs";
import TimeTracking from "./Component/Production_Dashboard/Time_Tracking/TimeTracking";
import Production_JobHistory from "./Component/Production_Dashboard/Production_jobsHistory/Production_JobHistory";

/* Designer */
import DesignerDashboard from "./Component/Designer_Dashboard/Dashboard/DesignerDashboard";
import DesignerMyJobs from "./Component/Designer_Dashboard/MyJobs/DesignerMyJobs";
import ProjectList from "./Component/Designer_Dashboard/Designer_Project$Jobs/Designer_Projects";
import JobHistory from "./Component/Designer_Dashboard/Designer_JobHistory/Designer_JobHistory";
import TimeLogs from "./Component/Designer_Dashboard/Designer_TimeLogs/Designer_TimeLogs";
import ProtectedRoute from "./Common/ProtectedRoute/ProtectedRoute";
import AddInvoice from "./Component/Admin_Dashboard/modules/projects/finance/AddInvoice";
import Jobdetailsproduction from "./Component/Production_Dashboard/Commonpage/Jobdetailsproduction";
import Jobdetailsemployee from "./Component/Designer_Dashboard/Commonpage/Jobdetailsemployee";
import AddTimeLog from "./Component/Designer_Dashboard/MyJobs/AddTimeLog";
import AddTimeLogProduction from "./Component/Production_Dashboard/Production_MyJobs/AddTimeLogProduction";

/* Super Admin */
import SuperAdminLayout from "./Layout/SuperAdmin/SuperAdminLayout";
import SuperAdminDashboard from "./Component/SuperAdmin_Dashboard/Dashboard/SuperAdminDashboard";
import SuperAdminCompanies from "./Component/SuperAdmin_Dashboard/Companies/SuperAdminCompanies";
import SuperAdminUsers from "./Component/SuperAdmin_Dashboard/Users/SuperAdminUsers";
import SuperAdminSettings from "./Component/SuperAdmin_Dashboard/Settings/SuperAdminSettings";
import SuperAdminSubscriptions from "./Component/SuperAdmin_Dashboard/Subscriptions/SuperAdminSubscriptions";
import SuperAdminAnalytics from "./Component/SuperAdmin_Dashboard/Analytics/SuperAdminAnalytics";
import { isSuperAdminRoute } from "./utils/auth";
import { ROLES } from "./utils/roles";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";

  const isSuperAdmin = isSuperAdminRoute(location.pathname);

  return (
    <>
         {/* 🌍 GLOBAL TOAST CONTAINER */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        newestOnTop
      />
      {hideLayout ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : isSuperAdmin ? (
        <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
          <SuperAdminLayout>
            <Routes>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/companies" element={<SuperAdminCompanies />} />
              <Route path="/superadmin/users" element={<SuperAdminUsers />} />
              <Route path="/superadmin/subscriptions" element={<SuperAdminSubscriptions />} />
              <Route path="/superadmin/analytics" element={<SuperAdminAnalytics />} />
              <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Routes>
          </SuperAdminLayout>
        </ProtectedRoute>
      ) : (
        <ProtectedRoute>
          <Navbar toggleSidebar={toggleSidebar} />

          <div className="main-content">
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />

            <div className={`right-side-content ${isSidebarCollapsed ? "collapsed" : ""}`}>
              <Routes>

                {/* Common */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* ADMIN */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/projects" element={<ProtectedRoute allowedRoles={["admin","production","employee"]}><ProjectLists /></ProtectedRoute>} />
                <Route path="/projects/add" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditProject /></ProtectedRoute>} />
                <Route path="/projects/edit/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditProject /></ProtectedRoute>} />
                <Route path="/projects/:projectId" element={<ProtectedRoute allowedRoles={["admin","production","employee"]}><ProjectDetails /></ProtectedRoute>} />
                <Route path="/projects/:projectId/jobs/add" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditJob /></ProtectedRoute>} />
                <Route path="/projects/:projectId/jobs/edit/:jobId" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditJob /></ProtectedRoute>} />
                <Route path="/jobs/:jobId" element={<ProtectedRoute allowedRoles={["admin","production","employee"]}><JobDetails /></ProtectedRoute>} />

                <Route path="/admin/CostEstimates" element={<ProtectedRoute allowedRoles={["admin"]}><CostEstimatesUI /></ProtectedRoute>} />
                <Route path="/admin/add-cost-estimate" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditCostEstimate /></ProtectedRoute>} />
                <Route path="/admin/edit-cost-estimate/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AddEditCostEstimate /></ProtectedRoute>} />
                
                <Route path="/admin/add-purchase-order" element={<ProtectedRoute allowedRoles={["admin"]}><AddPO /></ProtectedRoute>} />
                <Route path="/admin/invoices/create" element={<ProtectedRoute allowedRoles={["admin"]}><AddInvoice /></ProtectedRoute>}/>

                <Route path="/admin/receivable" element={<ProtectedRoute allowedRoles={["admin"]}><ReceivablePO /></ProtectedRoute>} />
                <Route path="/admin/Invoicing" element={<ProtectedRoute allowedRoles={["admin"]}><Invoicing /></ProtectedRoute>} />
                <Route path="/admin/JobTracker" element={<ProtectedRoute allowedRoles={["admin","production","employee"]}><JobTracker /></ProtectedRoute>} />
                <Route path="/admin/userList" element={<ProtectedRoute allowedRoles={["admin"]}><UsersList /></ProtectedRoute>} />
                <Route path="/admin/Reports" element={<ProtectedRoute allowedRoles={["admin"]}><ReportsAnalytics /></ProtectedRoute>} />
                <Route path="/admin/ClientSupplier" element={<ProtectedRoute allowedRoles={["admin"]}><ClientSupplier /></ProtectedRoute>} />
                <Route path="/admin/TimesheetOverview" element={<ProtectedRoute allowedRoles={["admin"]}><TimesheetOverview /></ProtectedRoute>} />
                <Route path="/admin/Settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSetting /></ProtectedRoute>} />
                <Route path="/admin/Assignedjobs" element={<ProtectedRoute allowedRoles={["admin"]}><AssignedJobs /></ProtectedRoute>} />

                {/* PRODUCTION */}
                <Route path="/production/dashboard" element={<ProtectedRoute allowedRoles={["production"]}><ProductionDashboard /></ProtectedRoute>} />
                <Route path="/production/myJobs" element={<ProtectedRoute allowedRoles={["production"]}><Production_MyJobs /></ProtectedRoute>} />
                <Route path="/production/assign" element={<ProtectedRoute allowedRoles={["production", "admin","employee"]}><ProductionAssignedJobs /></ProtectedRoute>} />
                <Route path="/production/inprogress" element={<ProtectedRoute allowedRoles={["production", "admin","employee"]}><JobsInProgress /></ProtectedRoute>} />
                <Route path="/production/completed" element={<ProtectedRoute allowedRoles={["production", "admin","employee"]}><CompletedJobs /></ProtectedRoute>} />
                <Route path="/production/rejected" element={<ProtectedRoute allowedRoles={["production", "admin","employee"]}><RejectedJobs /></ProtectedRoute>} />
                <Route path="/production/TimeTracking" element={<ProtectedRoute allowedRoles={["production"]}><TimeTracking /></ProtectedRoute>} />
                <Route path="/production/jobhistory" element={<ProtectedRoute allowedRoles={["production"]}><Production_JobHistory /></ProtectedRoute>} />
                <Route path="/production/jobdetails/:id" element={<ProtectedRoute allowedRoles={["production"]}><Jobdetailsproduction /></ProtectedRoute>} />
                <Route path="/production/jobdetails" element={<ProtectedRoute allowedRoles={["production"]}><Jobdetailsproduction /></ProtectedRoute>} />
                <Route path="/production/add-time-log" element={<ProtectedRoute allowedRoles={["production"]}><AddTimeLogProduction /></ProtectedRoute>} />

                {/* DESIGNER */}
                <Route path="/designer/dashboard" element={<ProtectedRoute allowedRoles={["employee"]}><DesignerDashboard /></ProtectedRoute>} />
                <Route path="/designer/myjobs" element={<ProtectedRoute allowedRoles={["employee"]}><DesignerMyJobs /></ProtectedRoute>} />
                <Route path="/designer/projectList" element={<ProtectedRoute allowedRoles={["employee"]}><ProjectList /></ProtectedRoute>} />
                <Route path="/designer/jobHistory" element={<ProtectedRoute allowedRoles={["employee"]}><JobHistory /></ProtectedRoute>} />
                <Route path="/designer/TimeTracking" element={<ProtectedRoute allowedRoles={["employee","admin"]}><TimeLogs /></ProtectedRoute>} />
                <Route path="/designer/jobdetails/:id" element={<ProtectedRoute allowedRoles={["employee","admin"]}><Jobdetailsemployee /></ProtectedRoute>} />
                <Route path="/designer/add-time-log" element={<ProtectedRoute allowedRoles={["employee"]}><AddTimeLog /></ProtectedRoute>} />

              </Routes>
            </div>
          </div>
        </ProtectedRoute>
      )}
    </>
  );
}

export default App;
