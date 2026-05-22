import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, clearAuthSession } from "../../utils/auth";
import logo from "../../assets/PhoenixLogo_L-01.png";
import "./SuperAdminNavbar.css";

const SuperAdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const user = getStoredUser();

  const userName = user
    ? `${user.first_name} ${user.last_name}`
    : "Super Admin";
  const userEmail = user?.email || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  return (
    <nav className="superadmin-navbar">
      <div className="nav-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="brand">
          <img src={logo} alt="Logo" className="nav-logo" />
          <span className="brand-badge">Super Admin</span>
        </div>
      </div>

      <div className="nav-right">
        <div className="user-section" ref={dropdownRef}>
          <div
            className="user-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle className="profile-icon" />
            <div className="user-info">
              <span className="name">{userName}</span>
              <span className="email">{userEmail}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <Link to="/profile">
                <button type="button">Profile</button>
              </Link>
              <hr />
              <Link to="/change-password">
                <button type="button" className="change-password">
                  Change Password
                </button>
              </Link>
              <hr />
              <button type="button" className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;
