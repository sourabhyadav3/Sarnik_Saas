import React, { useState, useEffect } from "react";
import SuperAdminNavbar from "./SuperAdminNavbar";
import SuperAdminSidebar from "./SuperAdminSidebar";
import "./SuperAdminLayout.css";

const SuperAdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  }, []);

  return (
    <div className="superadmin-layout">
      <SuperAdminNavbar
        toggleSidebar={() => setCollapsed((prev) => !prev)}
      />
      <SuperAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`superadmin-content ${collapsed ? "collapsed" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
