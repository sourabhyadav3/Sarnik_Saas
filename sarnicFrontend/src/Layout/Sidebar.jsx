import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaProjectDiagram,
  FaIndustry,
  FaPencilRuler,
  FaFileInvoiceDollar,
  FaShoppingCart,
  FaFileAlt,
  FaClock,
  FaChartLine,
  FaUsersCog,
  FaCog,
  FaTasks,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import "./Sidebar.css";
import { clearAuthSession } from "../utils/auth";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  /* ----------------------------------
     🔑 ROLE AUTO DETECT
  ----------------------------------- */
  const getRole = () => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) return storedRole;

    if (location.pathname.startsWith("/superadmin")) return "superadmin";
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/employee")) return "employee";
    if (location.pathname.startsWith("/client")) return "client";
    if (location.pathname.startsWith("/production")) return "production";

    return "admin";
  };

  const role = getRole();

  /* ----------------------------------
     📋 ALL MENUS (ROLE WISE)
  ----------------------------------- */

  const MENUS = {
    admin: [
      { title: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },

      {
        title: "Projects & Jobs",
        icon: <FaProjectDiagram />,
        submenu: [
          { title: "Projects", path: "/projects" },
          { title: "Job Tracker", path: "/admin/JobTracker" },
        ],
      },
      {
        title: "Production",
        icon: <FaIndustry />,
        submenu: [
          { title: "Assign Job", path: "/production/assign" },
          { title: "In Progress", path: "/production/inprogress" },
          { title: "Completed", path: "/production/completed" },
          { title: "Rejected", path: "/production/rejected" },
        ],
      },
      {
        title: "Designer Panel",
        icon: <FaPencilRuler />,
        submenu: [
          { title: "Assigned Jobs", path: "/admin/Assignedjobs" },
          { title: "Time Logs", path: "/designer/TimeTracking" },
        ],
      },
      {
        title: "Cost Estimates",
        icon: <FaFileInvoiceDollar />,
        path: "/admin/CostEstimates",
      },
      {
        title: "Purchase Orders",
        icon: <FaShoppingCart />,
        submenu: [{ title: "Receivable POs", path: "/admin/receivable" }],
      },
      {
        title: "Invoicing & Billing",
        icon: <FaFileAlt />,
        path: "/admin/Invoicing",
      },
      {
        title: "Timesheet & Worklog",
        icon: <FaClock />,
        path: "/admin/TimesheetOverview",
      },
      {
        title: "Client / Supplier",
        icon: <FaUsersCog />,
        path: "/admin/ClientSupplier",
      },
      {
        title: "Reports & Analytics",
        icon: <FaChartLine />,
        path: "/admin/Reports",
      },
      {
        title: "User Management",
        icon: <FaUsersCog />,
        path: "/admin/userList",
      },
       {
        title: "Settings",
        icon: <FaCog />,
        path: "/admin/Settings",
      },
      // {
      //   title: "Profile",
      //   icon: <FaUserCircle />,
      //   path: "/admin/profile",
      // },
     
    ],

    employee: [
      { title: "Dashboard", icon: <FaHome />, path: "/designer/dashboard" },
      { title: "My Jobs", icon: <FaTasks />, path: "/designer/myjobs" },
      {
        title: "Projects & Jobs",
        icon: <FaProjectDiagram />,
        submenu: [
          { title: "Projects", path: "/projects" },
          { title: "Job Trackers", path: "/admin/JobTracker" },
        ],
      },
      {
        title: "Time Tracking",
        icon: <FaClock />,
        path: "/designer/TimeTracking",
      },
      {
        title: "Job History",
        icon: <FaHistory />,
        path: "/designer/jobHistory",
      },
      // {
      //   title: "Profile",
      //   icon: <FaUserCircle />,
      //   path: "/employee/Profile",
      // },
    ],

    client: [
      { title: "Dashboard", icon: <FaHome />, path: "/client/dashboard" },
      {
        title: "Select Project",
        icon: <FaProjectDiagram />,
        path: "/client/projectList",
      },
      {
        title: "Select Job",
        icon: <FaUsersLine />,
        path: "/client/ProjectOverview",
      },
      {
        title: "Settings",
        icon: <FaCog />,
        path: "/client/Settings",
      },
    ],

    production: [
      { title: "Dashboard", icon: <FaHome />, path: "/production/dashboard" },
      { title: "My Jobs", icon: <FaTasks />, path: "/production/myJobs" },
      {
        title: "Projects & Jobs",
        icon: <FaProjectDiagram />,
        submenu: [
          { title: "Projects", path: "/projects" },
          {
            title: "Job Trackers",
            path: "/admin/JobTracker",
          },
        ],
      },
      {
        title: "My Production",
        icon: <FaIndustry />,
        submenu: [
          { title: "Assign", path: "/production/assign" },
          { title: "In Progress", path: "/production/inprogress" },
          { title: "Completed", path: "/production/completed" },
          { title: "Rejected", path: "/production/rejected" },
        ],
      },
      {
        title: "Time Tracking",
        icon: <FaClock />,
        path: "/production/TimeTracking",
      },
      {
        title: "Job History",
        icon: <FaHistory />,
        path: "/production/jobhistory",
      },
    
    ],
  };

  const menus = MENUS[role];

  /* ---------------------------------- */

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  const toggleMenu = (title) => {
    setActiveMenu(activeMenu === title ? null : title);
  };

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-brand">
          {!collapsed && (
            <>
              <h6 className="mb-0">Workflow</h6>
              <small className="text-muted text-capitalize">
                {role} Panel
              </small>
            </>
          )}
        </div>

        <ul className="menu">
          {menus.map((menu, i) => (
            <li key={i} className="menu-item">
              <div
                className="menu-link"
                onClick={() =>
                  menu.submenu
                    ? toggleMenu(menu.title)
                    : handleNavigate(menu.path)
                }
              >
                <span className="menu-icon">{menu.icon}</span>
                {!collapsed && (
                  <span className="menu-text">{menu.title}</span>
                )}
                {!collapsed && menu.submenu && (
                  <FaAngleDown
                    className={`arrow-icon ${
                      activeMenu === menu.title ? "rotate" : ""
                    }`}
                  />
                )}
              </div>

              {!collapsed &&
                menu.submenu &&
                activeMenu === menu.title && (
                  <ul className="submenu">
                    {menu.submenu.map((sub, j) => (
                      <li
                        key={j}
                        className={`submenu-item ${
                          isActive(sub.path) ? "active-sub" : ""
                        }`}
                        onClick={() => handleNavigate(sub.path)}
                      >
                        {sub.title}
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
          <li className="menu-item">
            <div className="menu-link logout-link" onClick={handleLogout}>
              <span className="menu-icon"><FaSignOutAlt /></span>
              {!collapsed && <span className="menu-text">Logout</span>}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
