import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";
import { useNavigate } from "react-router-dom";



export default function JobTracker() {
  // ================= STATES =================
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [projectList, setProjectList] = useState([]);
    const navigate = useNavigate()
  // ================= API CALL =================
  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get(`/jobs`);

      if (res.data.success) {
        setJobs(res.data.data);
        setFilteredJobs(res.data.data);

        // 🔹 unique project names for filter dropdown
        const projects = [
          ...new Set(
            res.data.data
              .map((job) => job.main_project_name)
              .filter(Boolean)
          ),
        ];
        setProjectList(projects);

        toast.success("Jobs loaded successfully");
      }
    } catch (error) {
      toast.error("Failed to load jobs");
      console.error(error);
    }
  };
  // Function to handle job viewing
  const handleViewJob = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let result = [...jobs];

    // 🔍 Search Filter
    if (search) {
      const searchLower = search.toLowerCase();
      const searchNormalized = searchLower.replace(/[\s\-_]/g, "");
      
      result = result.filter(
        (job) =>
          job.job_no?.toString().includes(searchLower) ||
          job.project_no?.toString().includes(searchLower) ||
          job.main_project_name?.toLowerCase().includes(searchLower) ||
          job.brand_name?.toLowerCase().includes(searchLower) ||
          job.sub_brand_name?.toLowerCase().includes(searchLower) ||
          job.flavour_name?.toLowerCase().includes(searchLower) ||
          job.pack_type_name?.toLowerCase().includes(searchLower) ||
          job.pack_code?.toLowerCase().includes(searchLower) ||
          job.job_status?.toLowerCase().replace(/[\s\-_]/g, "").includes(searchNormalized)
      );
    }

    // 📁 Project Filter
    if (projectFilter) {
      result = result.filter(
        (job) => job.main_project_name === projectFilter
      );
    }

    // 📌 Status Filter
    if (statusFilter) {
      const filterLower = statusFilter.toLowerCase().replace(/[\s\-_]/g, "");
      result = result.filter((job) => {
        if (!job.job_status) return false;
        const jobStatusLower = job.job_status.toLowerCase().replace(/[\s\-_]/g, "");
        
        // Match "complete" with "completed"
        if (filterLower === "complete" || filterLower === "completed") {
          return jobStatusLower === "complete" || jobStatusLower === "completed";
        }
        
        return jobStatusLower === filterLower;
      });
    }

    // 🚦 Priority Filter
    if (priorityFilter) {
      result = result.filter(
        (job) =>
          job.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    setFilteredJobs(result);
  }, [search, projectFilter, statusFilter, priorityFilter, jobs]);

  // ================= HELPERS =================
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase().replace(/[\s\-_]/g, ""); // Handles "in_progress", "in progress", "in-progress"
    switch (s) {
      case "inprogress":
        return { backgroundColor: "#FFC107", color: "#000", fontWeight: "600" }; // Vibrant Yellow
      case "completed":
      case "complete":
        return { backgroundColor: "#28A745", color: "#fff", fontWeight: "600" }; // Solid Green
      case "active":
        return { backgroundColor: "#007BFF", color: "#fff", fontWeight: "600" }; // Blue
      case "onhold":
        return { backgroundColor: "#17A2B8", color: "#fff", fontWeight: "600" }; // Cyan
      case "cancelled":
      case "closed":
        return { backgroundColor: "#DC3545", color: "#fff", fontWeight: "600" }; // Red
      default:
        return { backgroundColor: "#6C757D", color: "#fff", fontWeight: "600" }; // Grey
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="container-fluid py-4 min-vh-100">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* CARD */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-4">Job Tracker</h4>

          {/* FILTER BAR */}
          <div className="row g-3 align-items-center mb-4">
            {/* SEARCH */}
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Job #, Project, Brand"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* PROJECT */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="">All Projects</option>
                {projectList.map((project, index) => (
                  <option key={index} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITY */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* CLEAR FILTER */}
            <div className="col-md-2 d-flex">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearch("");
                  setProjectFilter("");
                  setStatusFilter("");
                  setPriorityFilter("");
                  setFilteredJobs(jobs);
                  toast.info("Filters cleared");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>


          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Job No</th>
                  <th>Project Name</th>
                  <th>Project No</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center text-muted">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id}>
                       <td
                            className="text-primary fw-semibold"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleViewJob(job)}
                          >
                            {job.job_no}
                          </td>
                      <td className="text-nowrap text-truncate" style={{ maxWidth: 200 }}>
                        {job.main_project_name || "-"}
                      </td>
                      <td>{job.project_no || "-"}</td>
                      <td>{job.brand_name || "-"}</td>
                      <td>{job.sub_brand_name || "-"}</td>
                      <td>{job.flavour_name || "-"}</td>
                      <td>{job.pack_type_name || "-"}</td>
                      <td>{job.pack_size}</td>
                      <td>{job.pack_code || "-"}</td>
                      <td className="fw-medium">{job.priority}</td>
                      <td>
                        {formatDDMMYYYY(job.created_at)}
                      </td>
                      <td>
                        <span 
                          className="badge rounded-pill px-3 py-2"
                          style={getStatusStyle(job.job_status)}
                        >
                          {job.job_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
