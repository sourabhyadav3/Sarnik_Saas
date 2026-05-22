import React, { useEffect, useState } from "react";
import "./Profile.css";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api/axiosInstance";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);

  // 🔹 Logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    department: "",
    about: "",
    role: "",
    image: "",
    file: null,
  });

  /* ================= GET PROFILE ================= */
  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      const d = res.data.data;

      setProfile((p) => ({
        ...p,
        name: `${d.first_name} ${d.last_name}`,
        email: d.email,
        phone: d.phone_number,
        country: d.country,
        department: d.state,
        role: d.role_name,
        image: d.image || p.image,
      }));
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProfile({ ...profile, [name]: files ? files[0] : value });
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      const fd = new FormData();

      // 🔹 Split name into first & last
      const [first_name, ...rest] = profile.name.split(" ");
      const last_name = rest.join(" ");

      fd.append("first_name", first_name || "");
      fd.append("last_name", last_name || "");
      fd.append("email", profile.email);
      fd.append("phone_number", profile.phone);
      fd.append("state", profile.department);
      fd.append("country", profile.country);
      fd.append("role_name", profile.role);

      if (profile.file) {
        fd.append("file", profile.file);
      }

      await axiosInstance.put(`/users/${userId}`, fd);

      toast.success("Profile updated successfully");
      setEditMode(false);
      fetchProfile();
    } catch {
      toast.error("Profile update failed");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />

      <div className="profile-page">
        {/* LEFT CARD */}
        <div className="profile-left-card">
          <div className="avatar-wrapper">
            <img
              src={profile.image}
              alt="profile"
              className="profile-avatar"
            />

            <div
              className="edit-avatar"
              style={{ pointerEvents: editMode ? "auto" : "none" }}
            >
              +
              <input
                type="file"
                hidden
                name="file"
                onChange={handleChange}
              />
            </div>
          </div>

          <h3>{profile.name}</h3>
          <p className="email">{profile.email}</p>
          <p className="phone">{profile.phone}</p>

          <div className="divider" />

          <p className="meta">
            Role: <span>{profile.role}</span>
          </p>

          {!editMode && (
            <button
              className="edit-profile-btn"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* RIGHT CARD */}
        <div className="profile-right-card">
          <h3 className="section-title">Profile Details</h3>

          <div className="details-grid">
            <div>
              <label>Name</label>
              <input
                name="name"
                value={profile.name}
                disabled={!editMode}
                onChange={handleChange}
              />

              <label>Country</label>
              <input
                name="country"
                value={profile.country}
                disabled={!editMode}
                onChange={handleChange}
              />

              <label>Department</label>
              <input
                name="department"
                value={profile.department}
                disabled={!editMode}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                name="email"
                value={profile.email}
                disabled={!editMode}
                onChange={handleChange}
              />

              <label>Phone No</label>
              <input
                name="phone"
                value={profile.phone}
                disabled={!editMode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="about-section">
            <label>About</label>
            <textarea
              name="about"
              rows="4"
              value={profile.about}
              disabled={!editMode}
              onChange={handleChange}
            />
          </div>

          {editMode && (
            <button className="save-profile-btn" onClick={handleSave}>
              Save Profile
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
