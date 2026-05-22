import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../assets/PhoenixLogo_L-01.png";


const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Fetch user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")); // Assuming the user object is stored in localStorage

  // Get first name, last name, email, and profile image URL from localStorage
  const userName = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const userEmail = user?.email || "guest@example.com"; // Fallback to default email if no email
  const userProfileImage = user?.image ; // Fallback image

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="app-navbar">
      {/* LEFT */}
      <div className="nav-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="brand">
          <img src={logo} alt="Phoenix Logo" className="nav-logo" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* Notification */}
      

        {/* User */}
        <div className="user-section" ref={dropdownRef}>
          <div
            className="user-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {/* Profile Image */}
            <img
              src={userProfileImage}
              alt="Profile"
              className="profile-image"
            />
            <div className="user-info">
              <span className="name">{userName}</span> {/* Display full name */}
              <span className="email">{userEmail}</span> {/* Display email */}
            </div>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <Link to="/profile">
                <button>Profile</button>
              </Link>
              <hr />

              <Link to="/change-password">
                <button className="change-password">Change Password</button>
              </Link>
              <hr />
              <Link to="/">
                <button className="logout">Logout</button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
