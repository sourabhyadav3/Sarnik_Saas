import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../api/axiosInstance";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(""); // Store current user's role

  // 🔍 Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // 🧾 Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    state: "",
    country: "",
    role_name: "",
    file: null, // Will hold File object or null
  });

  /* ---------------- RESET FORM ---------------- */
  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      state: "",
      country: "",
      role_name: "",
      file: null,
    });
    setSelectedUserId(null);
  };

  /* ---------------- GET USERS ---------------- */
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data?.data || []);
      
      // Get current user's role (assuming it's in the response or you might need a separate API call)
      // This is a placeholder - adjust based on your actual API structure
      const currentUser = res.data?.data?.find(u => u.is_current_user) || 
                         res.data?.data?.[0]; // Fallback to first user if needed
      
      if (currentUser) {
        setCurrentUserRole(currentUser.role_name);
      }
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /* ---------------- CREATE USER ---------------- */
  const handleCreate = async () => {
    try {
      const fd = new FormData();

      // Append all form fields
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      fd.append("phone_number", form.phone_number);
      if (form.password) fd.append("password", form.password);
      fd.append("state", form.state);
      fd.append("country", form.country);
      fd.append("role_name", form.role_name);

      // Append file if it exists - this will be sent as binary
      if (form.file instanceof File) {
        fd.append("file", form.file, form.file.name);
      }

      // Make sure we don't manually set the Content-Type header
      // Let Axios set it automatically for FormData
      await axiosInstance.post("/users", fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("User created successfully");

      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create user");
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (user) => {
    setSelectedUserId(user.id);
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      password: "", // Never pre-fill password
      state: user.state || "",
      country: user.country || "",
      role_name: user.role_name || "",
      file: null, // Reset file; user must choose new one to replace
    });
    setShowModal(true);
  };

  /* ---------------- UPDATE USER ---------------- */
  const handleUpdate = async () => {
    try {
      const fd = new FormData();

      // Append all form fields
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      fd.append("phone_number", form.phone_number);
      if (form.password) fd.append("password", form.password); // Only if changed
      fd.append("state", form.state);
      fd.append("country", form.country);
      fd.append("role_name", form.role_name);

      // Append file if it exists - this will be sent as binary
      if (form.file instanceof File) {
        fd.append("file", form.file, form.file.name);
      }

      // Make sure we don't manually set the Content-Type header
      // Let Axios set it automatically for FormData
      await axiosInstance.put(`/users/${selectedUserId}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("User updated successfully");

      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/users/${selectedUserId}`);
      toast.success("User deleted successfully");

      setDeleteModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  /* ---------------- FILTERED USERS ---------------- */
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const matchName = fullName.includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role_name === roleFilter;
    
    // Exclude admin users from the list
    const isAdmin = u.role_name === "admin";

    return matchName && matchRole && !isAdmin;
  });

  // Get available roles for the dropdown (excluding current user's role)
  const getAvailableRoles = () => {
    const allRoles = ["admin", "production", "employee"];
    return allRoles.filter(role => role !== currentUserRole);
  };

  return (
    <div className="p-2 p-md-4 bg-white rounded shadow-sm">
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h4 className="mb-3 mb-md-0">User Management</h4>
        <button
          className="btn btn-primary w-100 w-md-auto"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="d-flex flex-column flex-md-row gap-2 mb-3">
        <input
          type="text"
          className="form-control flex-grow-1"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="production">Production</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* TABLE - DESKTOP VIEW */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>State</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.image || "https://via.placeholder.com/40"} // fallback if no image
                          alt="profile"
                          width="40"
                          height="40"
                          className="rounded-circle border"
                          style={{ objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-semibold">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-primary">{u.role_name}</span>
                    </td>

                    <td>{u.state}</td>
                    <td>{u.country}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleEdit(u)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD VIEW - MOBILE */}
      <div className="d-md-none">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-muted py-4">No users found</div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={u.image || "https://via.placeholder.com/50"}
                    alt="profile"
                    width="50"
                    height="50"
                    className="rounded-circle border me-3"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1">
                      {u.first_name} {u.last_name}
                    </h5>
                    <p className="card-text text-muted small mb-0">{u.email}</p>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-6">
                    <span className="text-muted small">Role:</span>
                    <div>
                      <span className="badge bg-primary">{u.role_name}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small">State:</span>
                    <div>{u.state}</div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <span className="text-muted small">Country:</span>
                    <div>{u.country}</div>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{selectedUserId ? "Edit User" : "Add User"}</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Profile Image</label>
                  <input 
                    type="file" 
                    name="file" 
                    className="form-control" 
                    onChange={handleChange} 
                    accept="image/*" // Added to restrict to image files
                  />
                  {form.file && (
                    <div className="mt-2">
                      <small className="text-muted">Selected file: {form.file.name}</small>
                    </div>
                  )}
                  {selectedUserId && !form.file && (
                    <small className="text-muted">Leave blank to keep current image</small>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      name="first_name"
                      className="form-control"
                      placeholder="First Name"
                      value={form.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      name="last_name"
                      className="form-control"
                      placeholder="Last Name"
                      value={form.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                  type="number"
                    name="phone_number"
                    className="form-control"
                    placeholder="Phone"
                    value={form.phone_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder={selectedUserId ? "Leave blank to keep current" : "Password"}
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">State</label>
                    <input
                      name="state"
                      className="form-control"
                      placeholder="State"
                      value={form.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <input
                      name="country"
                      className="form-control"
                      placeholder="Country"
                      value={form.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    name="role_name"
                    className="form-select"
                    value={form.role_name}
                    onChange={handleChange}
                  >
                    <option value="">Select Role</option>
                    {getAvailableRoles().map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-dark"
                  onClick={selectedUserId ? handleUpdate : handleCreate}
                >
                  {selectedUserId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button className="btn-close" onClick={() => setDeleteModal(false)}></button>
              </div>
              <div className="modal-body">Are you sure you want to delete this user?</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;