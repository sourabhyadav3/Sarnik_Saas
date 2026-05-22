import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import StatusBadge from "../../../Common/Statusbadge/StatusBadge";
import { useNavigate } from "react-router-dom";

const Production_JobHistory = () => {
  // ----------------------------------
  // Logged-in Production User
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const productionId = user?.id;
  const navigate = useNavigate();
  
  // ----------------------------------
  // STATE
  // ----------------------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ----------------------------------
  // FETCH JOB HISTORY (PRODUCTION)
  // ----------------------------------
  useEffect(() => {
    if (!productionId) return;

    const fetchJobHistory = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          `/jobs/jobHistoryproduction/${productionId}`
        );

        if (res.data?.success) {
          setJobs(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching job history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobHistory();
  }, [productionId]);

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.jobId}`);
  };

  // ----------------------------------
  // FILTER + SEARCH LOGIC
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs?.filter((job) => {
      const matchSearch =
        job?.jobNo?.toString().includes(search) ||
        job?.projectName?.toLowerCase().includes(search.toLowerCase());

      const matchProject =
        projectFilter === "all" ||
        job.projectName === projectFilter;

      const matchPriority =
        priorityFilter === "all" ||
        job.priority === priorityFilter;

      const matchStatus =
        statusFilter === "all" ||
        job.status === statusFilter;

      return (
        matchSearch &&
        matchProject &&
        matchPriority &&
        matchStatus
      );
    });
  }, [jobs, search, projectFilter, priorityFilter, statusFilter]);

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* ================= HEADER ================= */}
          <h5 className="fw-bold mb-3">Job History</h5>

          {/* ================= FILTER BAR ================= */}
          <div className="row g-3 align-items-center mb-4">

            {/* SEARCH */}
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Search by Job # / Project Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* PROJECT FILTER */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {[...new Set(jobs.map((j) => j.projectName))].map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* PRIORITY FILTER */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Completed</option>
                <option value="reject">Rejected</option>
                <option value="return">Returned</option>
              </select>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Job No</th>
                  <th>Project Name</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th>Priority</th>
                  {/* <th>Due Date</th> */}
                  <th>Assigned To</th>
                  <th>Time Budget</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading && (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      Loading job history...
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading && filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="13" className="text-center py-4 text-muted">
                      No job history found
                    </td>
                  </tr>
                )}

                {/* DATA */}
                {!loading &&
                  filteredJobs.map((job, index) => (
                    <tr key={index}>
                       <td className="text-primary fw-semibold"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewJob(job)}
                      >
                        {job.jobNo}
                      </td>
                      <td>{job.projectName}</td>
                      <td>{job.brand}</td>
                      <td>{job.subBrand}</td>
                      <td>{job.flavour}</td>
                      <td>{job.packType}</td>
                      <td>{job.packSize}</td>
                      <td>{job.packCode}</td>
                      <td className="fw-semibold text-capitalize">
                        {job.priority}
                      </td>
                      {/* <td>
                        {job.dueDate
                          ? new Date(job.dueDate).toLocaleDateString()
                          : "-"}
                      </td> */}
                      <td>{job.assignedTo}</td>
                      <td>{formatTime(job.totalTime)}</td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
            <span>
              Showing {filteredJobs.length} of {jobs.length}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Production_JobHistory;