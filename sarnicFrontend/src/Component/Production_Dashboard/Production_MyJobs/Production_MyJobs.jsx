import React, { useEffect, useState } from "react";
import { FaClock, FaSearch } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../Common/Statusbadge/StatusBadge";

const Production_MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();

  // bulk return selection
  const [selectedJobs, setSelectedJobs] = useState([]);

  // search
  const [searchTerm, setSearchTerm] = useState("");

  // modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(""); // return | complete
  const [selectedAssignJobId, setSelectedAssignJobId] = useState(null);

  // logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // =====================================================
  // FETCH JOBS
  // =====================================================
  useEffect(() => {
    if (userId) fetchProductionJobs();
  }, [userId]);

  const fetchProductionJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/assignjobs/production/${userId}`);

      if (res.data?.success) {
        const allowedStatus = ["in_progress", "complete"];

      const formattedJobs = res.data.data
  .filter(
    (item) => item.assign_job.production_status === "in_progress"
  )
  .flatMap((item) =>
    item.jobs.map((job) => ({
      // IDs
      assignJobId: item.assign_job.id,
      productionId: item.assign_job.production_id,
      projectId: item.project.id,
      jobId: job.id,

      // display
      jobNo: job.job_no,
      projectName: item.project.project_name,
      projectNo: item.project.project_no,
      brand: job.brand?.name || "-",
      subBrand: job.sub_brand?.name || "-",
      packType: job.pack_type?.name || "-",
      packSize: job.pack_size || "-",
      packCode: job.pack_code || "-",
      priority: job.priority,
      productionStatus: item.assign_job.production_status,
      timeBudget: item.assign_job.time_budget,
    }))
  );


        setJobs(formattedJobs);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH FILTER LOGIC
  // =====================================================
  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();

    return (
      job.jobNo?.toString().toLowerCase().includes(term) ||
      job.projectName?.toLowerCase().includes(term) ||
      job.projectNo?.toString().toLowerCase().includes(term) ||
      job.brand?.toLowerCase().includes(term) ||
      job.subBrand?.toLowerCase().includes(term) ||
      job.packType?.toLowerCase().includes(term) ||
      job.packSize?.toLowerCase().includes(term) ||
      job.packCode?.toLowerCase().includes(term) ||
      job.priority?.toLowerCase().includes(term) ||
      job.productionStatus?.toLowerCase().includes(term) ||
      job.timeBudget?.toLowerCase().includes(term) // Added timeBudget to search
    );
  });

  // =====================================================
  // CHECKBOX HANDLERS
  // =====================================================
  const toggleJobSelection = (id) => {
    setSelectedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((jobId) => jobId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((j) => j.assignJobId));
    }
  };

  // =====================================================
  // MODAL CONTROLS
  // =====================================================
  const openConfirmModal = (type, id = null) => {
    if (type === "return" && selectedJobs.length === 0) {
      toast.warning("Please select at least one job to return.");
      return;
    }
    setConfirmType(type);
    setSelectedAssignJobId(id);
    setShowConfirm(true);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setConfirmType("");
    setSelectedAssignJobId(null);
  };

  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.jobId}`);
  };
  
  // =====================================================
  // CONFIRM ACTION
  // =====================================================
  const handleConfirmAction = async () => {
    try {
      setActionLoadingId(selectedAssignJobId || "bulk");

      if (confirmType === "complete") {
        const res = await axiosInstance.put(
          `/assignjobs/production-complete/${selectedAssignJobId}`,
          { id: selectedAssignJobId }
        );
        if (res.data?.success) {
          toast.success(
            "Job has been completed successfully. It is now visible in Job History."
          );
        }
      }

      if (confirmType === "return") {
        const res = await axiosInstance.put(
          `/assignjobs/production-return-job-status`,
          { ids: selectedJobs }
        );
        if (res.data?.success) {
          toast.success(
            "Selected jobs have been returned successfully. They are now visible in Job History."
          );
          setSelectedJobs([]);
        }
      }

      fetchProductionJobs();
    } catch (error) {
      console.error(error);
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoadingId(null);
      closeConfirmModal();
    }
  };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">My Jobs</h4>

            <button
              className="btn btn-warning"
              disabled={selectedJobs.length === 0}
              onClick={() => openConfirmModal("return")}
            >
              Return Selected Jobs
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive ">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredJobs.length > 0 &&
                        selectedJobs.length === filteredJobs.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Job No</th>
                  <th>Project</th>
                  <th>Project No</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th>Time Budget</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
                      Loading jobs...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
                      No matching jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.assignJobId)}
                          onChange={() =>
                            toggleJobSelection(job.assignJobId)
                          }
                        />
                      </td>

                      <td className="text-primary fw-semibold"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewJob(job)}
                      >
                        {job.jobNo}
                      </td>
                      <td>{job.projectName}</td>
                      <td>{job.projectNo}</td>
                      <td>{job.brand}</td>
                      <td>{job.subBrand}</td>
                      <td>{job.packType}</td>
                      <td>{job.packSize}</td>
                      <td>{job.packCode}</td>
                      <td>{formatTime(job.timeBudget)}</td> {/* Fixed: Use formatTime to display only HH:MM */}

                      <td>
                        <span
                          className={`badge ${job.priority === "high"
                            ? "bg-danger"
                            : job.priority === "medium"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                            }`}
                        >
                          {job.priority}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={job.productionStatus} />
                      </td>

                      <td style={{whiteSpace:"nowrap"}} className="text-center ">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() =>
                            navigate("/production/add-time-log", {
                              state: {
                                projectId: job.projectId,
                                projectName: job.projectName,
                                jobId: job.jobId,
                                jobNo: job.jobNo,
                                productionId: job.productionId,
                              },
                            })
                          }
                        >
                          <FaClock />
                          Add Time
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          disabled={
                            job.productionStatus === "complete" ||
                            actionLoadingId === job.assignJobId
                          }
                          onClick={() =>
                            openConfirmModal("complete", job.assignJobId)
                          }
                        >
                          Mark Complete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* BACKDROP */}
      {showConfirm && <div className="modal-backdrop fade show"></div>}

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">
                  Confirm {confirmType === "complete" ? "Completion" : "Return"}
                </h6>
                <button className="btn-close" onClick={closeConfirmModal} />
              </div>

              <div className="modal-body text-center">
                {confirmType === "complete" ? (
                  <>Are you sure you want to complete this job?</>
                ) : (
                  <>
                    Are you sure you want to return{" "}
                    <strong>{selectedJobs.length}</strong> selected job(s)?
                  </>
                )}
              </div>

              <div className="modal-footer justify-content-center">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={closeConfirmModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleConfirmAction}
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Production_MyJobs;