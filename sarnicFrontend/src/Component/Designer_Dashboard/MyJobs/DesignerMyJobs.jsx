import React, { useEffect, useMemo, useState } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
} from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../Common/Statusbadge/StatusBadge";

const MyJobs = () => {
  // ----------------------------------
  // Logged-in Employee
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // ----------------------------------
  // STATE
  // ----------------------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // ----------------------------------
  // FETCH MY JOBS
  // ----------------------------------
  const fetchMyJobs = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/assignjobs/employee/${userId}`
      );

      if (res.data?.success) {
        const formatted = res.data.data.flatMap((item) =>
          item.jobs.map((job) => ({
            // IDs
            assignJobId: item.assign_job.id,
            productionId: item.assign_job.production_id,
            projectId: item.project.id,
            jobId: job.id,

            jobNo: job.job_no,
            projectName: item.project.project_name,
            projectNo: item.project.project_no,
            brand: job.brand?.name || "-",
            subBrand: job.sub_brand?.name || "-",
            flavour: job.flavour?.name || "-",
            packType: job.pack_type?.name || "-",
            packSize: job.pack_size || "-",

            // ✅ FIXED: PACK CODE FROM assign_job
            packCode: item.assign_job.pack_code || "-",

            priority: job.priority,
            timeBudget: item.assign_job.time_budget,
            status: item.assign_job.employee_status,
          }))
        );


        setJobs(formatted);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMyJobs();
  }, [userId]);

  // ----------------------------------
  // COMPLETE JOB (NEW ROUTE)
  // ----------------------------------
  const handleComplete = async (assignJobId, jobId) => {
    try {
      setActionLoading(jobId);

      const res = await axiosInstance.put(
        `/assignjobs/employee-complete/${assignJobId}/${jobId}`
      );

      if (res.data?.success) {
        toast.success("Job marked as completed");
        fetchMyJobs();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete job");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewJob = (job) => {
    navigate(`/designer/jobdetails/${job.jobId}`);
  };

  // ----------------------------------
  // GENERATE & COPY FILE NAME
  // ----------------------------------
  const generateFileName = (job) => {
    const parts = [
      job.jobNo,
      job.brand !== "-" ? job.brand : "",
      job.subBrand !== "-" ? job.subBrand : "",
      job.flavour !== "-" ? job.flavour : "",
      job.packType !== "-" ? job.packType : "",
      job.packSize !== "-" ? job.packSize : "",
      job.packCode !== "-" ? job.packCode : "",
    ];
    
    // Filter out empty parts and join with underscore
    return parts.filter(part => part && part !== "-").join("_");
  };

  const handleCopyFileName = async (job) => {
    try {
      const fileName = generateFileName(job);
      await navigator.clipboard.writeText(fileName);
      toast.success("File name copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy file name");
    }
  };

  // ----------------------------------
  // REJECT JOB (NEW ROUTE)
  // ----------------------------------
  const handleReject = async (assignJobId, jobId) => {
    try {
      setActionLoading(jobId);

      const res = await axiosInstance.put(
        `/assignjobs/employee-reject/${assignJobId}/${jobId}`
      );

      if (res.data?.success) {
        toast.success("Job rejected successfully");
        fetchMyJobs();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject job");
    } finally {
      setActionLoading(null);
    }
  };

  // ----------------------------------
  // SEARCH FILTER
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 🔒 ONLY IN-PROGRESS JOBS
      if (job.status !== "in_progress") return false;

      const matchSearch =
        job.jobNo.toString().includes(search) ||
        job.projectName.toLowerCase().includes(search.toLowerCase()) ||
        job.brand.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [jobs, search]);


  return (
    <div className="container-fluid mt-4 min-vh-100">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">

          {/* HEADER */}
          <h5 className="fw-semibold mb-3">My Jobs</h5>

          {/* SEARCH */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-borderless align-middle">
              <thead className="border-bottom">
                <tr className="text-muted small">
                  <th>Job No</th>
                  <th>Project</th>
                  <th className="d-none d-md-table-cell">Project No</th>
                  <th className="d-none d-md-table-cell">Brand</th>
                  <th className="d-none d-lg-table-cell">Sub Brand</th>
                  <th className="d-none d-lg-table-cell">Pack Type</th>
                  <th className="d-none d-lg-table-cell">Pack Size</th>
                  <th className="d-none d-lg-table-cell">Pack Code</th>
                  <th className="d-none d-lg-table-cell">Time Budget</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading && (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      Loading jobs...
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading && filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-muted">
                      No jobs found
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

                      <td className="d-none d-md-table-cell">
                        {job.projectNo}
                      </td>

                      <td className="d-none d-md-table-cell">
                        {job.brand}
                      </td>

                      <td className="d-none d-lg-table-cell">
                        {job.subBrand}
                      </td>

                      <td className="d-none d-lg-table-cell">
                        {job.packType}
                      </td>

                      <td className="d-none d-lg-table-cell">
                        {job.packSize}
                      </td>

                      <td className="d-none d-lg-table-cell">
                        {job.packCode}
                      </td>


                      <td className="d-none d-lg-table-cell">
                        {formatTime(job.timeBudget)}
                      </td>

                      <td>
                        <span
                          className={`badge ${job.priority === "high"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                            }`}
                        >
                          {job.priority}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={job.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            title="Add Time Log"
                            onClick={() =>
                              navigate("/designer/add-time-log", {
                                state: {
                                  jobId: job.jobId,
                                  projectId: job.projectId,
                                  projectName: job.projectName,
                                  jobNo: job.jobNo,
                                  productionId: job.productionId,
                                },
                              })
                            }
                          >
                            <FaClock />
                            <span className="d-none d-md-inline"></span>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            title="Copy File Name"
                            onClick={() => handleCopyFileName(job)}
                          >
                            <FaCopy />
                            <span className="d-none d-md-inline"></span>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            disabled={actionLoading === job.jobId}
                            onClick={() =>
                              handleComplete(job.assignJobId, job.jobId)
                            }
                          >
                            <FaCheckCircle />
                            <span className="d-none d-md-inline">
                              Complete
                            </span>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            disabled={actionLoading === job.jobId}
                            onClick={() =>
                              handleReject(job.assignJobId, job.jobId)
                            }
                          >
                            <FaTimesCircle />
                            <span className="d-none d-md-inline">
                              Reject
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyJobs;