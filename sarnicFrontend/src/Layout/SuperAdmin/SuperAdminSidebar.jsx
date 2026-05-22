import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaCreditCard,
  FaChartBar,
} from "react-icons/fa";
import "./SuperAdminSidebar.css";
import { clearAuthSession } from "../../utils/auth";

const MENUS = [
  { title: "Dashboard", icon: <FaHome />, path: "/superadmin" },
  { title: "Companies", icon: <FaBuilding />, path: "/superadmin/companies" },
  { title: "Users", icon: <FaUsers />, path: "/superadmin/users" },
  { title: "Subscriptions", icon: <FaCreditCard />, path: "/superadmin/subscriptions" },
  { title: "Analytics", icon: <FaChartBar />, path: "/superadmin/analytics" },
  { title: "Settings", icon: <FaCog />, path: "/superadmin/settings" },
];

const SuperAdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const isActive = (path) =>
    path === "/superadmin"
      ? location.pathname === "/superadmin"
      : location.pathname.startsWith(path);

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  return (
    <div
      className={`superadmin-sidebar-container ${collapsed ? "collapsed" : ""}`}
    >
      <div className="superadmin-sidebar">
        <div className="superadmin-sidebar-brand">
          {!collapsed && (
            <>
              <h6 className="mb-0">Workflow MS</h6>
              <small className="text-muted">Super Admin Panel</small>
            </>
          )}
        </div>

        <ul className="superadmin-menu">
          {MENUS.map((menu) => (
            <li
              key={menu.path}
              className={`superadmin-menu-item ${
                isActive(menu.path) ? "active" : ""
              }`}
              onClick={() => handleNavigate(menu.path)}
            >
              <span className="menu-icon">{menu.icon}</span>
              {!collapsed && <span className="menu-text">{menu.title}</span>}
            </li>
          ))}
          <li className="superadmin-menu-item logout-item" onClick={handleLogout}>
            <span className="menu-icon"><FaSignOutAlt /></span>
            {!collapsed && <span className="menu-text">Logout</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
