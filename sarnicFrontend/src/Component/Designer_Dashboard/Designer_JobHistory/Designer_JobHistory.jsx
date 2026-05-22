import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import StatusBadge from "../../../Common/Statusbadge/StatusBadge";
import { useNavigate } from "react-router-dom";

const JobHistory = () => {
  // ----------------------------------
  // LOGGED-IN EMPLOYEE
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const employeeId = user?.id;

  // ----------------------------------
  // STATE
  // ----------------------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ----------------------------------
  // FETCH JOB HISTORY
  // ----------------------------------
  useEffect(() => {
    if (!employeeId) return;

    const fetchJobHistory = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/jobs/jobhistoryemployee/${employeeId}`
        );

        if (res.data?.success) {
          setJobs(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch job history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobHistory();
  }, [employeeId]);

  const handleViewJob = (job) => {
    navigate(`/designer/jobdetails/${job.id}`);
  };

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // ----------------------------------
  // FILTER LOGIC
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !search ||
        job.jobNo?.toString().includes(search) ||
        job.projectName?.toLowerCase().includes(search.toLowerCase());

      const matchProject =
        projectFilter === "all" ||
        job.projectName === projectFilter;

      const matchPriority =
        priorityFilter === "all" ||
        job.priority?.toLowerCase() === priorityFilter;

      const matchStatus =
        statusFilter === "all" ||
        job.status?.toLowerCase() === statusFilter;

      return (
        matchSearch &&
        matchProject &&
        matchPriority &&
        matchStatus
      );
    });
  }, [jobs, search, projectFilter, priorityFilter, statusFilter]);

  return (
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          {/* HEADER */}
          <h5 className="fw-semibold mb-3">Job History</h5>

          {/* FILTERS */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: "260px" }}
              placeholder="Search by Job #, Project Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-select"
              style={{ maxWidth: "160px" }}
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="all">All Projects</option>
              {[
                ...new Set(
                  jobs
                    .map((j) => j.projectName)
                    .filter(Boolean)
                ),
              ].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ maxWidth: "160px" }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="form-select"
              style={{ maxWidth: "160px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="not_started">Not Started</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Job No</th>
                  <th>Project Name</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Time Budget</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="14" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center py-4 text-muted">
                      Showing 1 to 0 of 0
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr key={index}>
                         <td className="text-primary fw-semibold"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewJob(job)}
                      >
                        {job.jobNo}
                      </td>
                      <td>{job.projectName || "-"}</td>
                      <td>{job.brand || "-"}</td>
                      <td>{job.subBrand || "-"}</td>
                      <td>{job.flavour || "-"}</td>
                      <td>{job.packType || "-"}</td>
                      <td>{job.packSize || "-"}</td>
                      <td>{job.packCode || "-"}</td>
                      <td className="text-capitalize fw-semibold">
                        {job.priority}
                      </td>
                      <td>
                        {job.dueDate
                          ? new Date(job.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{job.assignedTo || "-"}</td>
                      <td>{formatTime(job.totalTime)}</td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION (STATIC FOR NOW) */}
          <div className="d-flex justify-content-end mt-2">
            <div className="btn-group btn-group-sm">
              <button className="btn btn-light" disabled>
                &laquo;
              </button>
              <button className="btn btn-light" disabled>
                &raquo;
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobHistory;