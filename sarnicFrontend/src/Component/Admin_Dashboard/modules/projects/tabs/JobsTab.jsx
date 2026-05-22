import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axiosInstance from "../../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AssignJobModal from "../jobs/AssignJobModal";

// Confirmation Modal
const ConfirmationModal = ({ show, onClose, onConfirm }) => {
  return (
    show && (
      <>
        {/* Backdrop */}
        <div
          className="modal-backdrop fade show"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
          }}
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            display: "block",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this job?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={onConfirm}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

// Mobile Job Card Component
const MobileJobCard = ({
  job,
  handleSelectJob,
  selectedJobs,
  handleViewJob,
  handleEditJob,
  handleDeleteJob,
  getStatusBadgeClass,
  getPriorityClass
}) => {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedJobs.includes(job.id)}
              onChange={() => handleSelectJob(job.id)}
              id={`job-checkbox-${job.id}`}
            />
            <label className="form-check-label fw-bold" htmlFor={`job-checkbox-${job.id}`}>
              {job.job_no}
            </label>
          </div>
          <span className={`badge ${getStatusBadgeClass(job.status)}`}>
            {job.status || "N/A"}
          </span>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <small className="text-muted d-block">Project</small>
            <span className="d-block text-truncate">{job.project_name}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Project No</small>
            <span className="d-block">{job.project_no || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Brand</small>
            <span className="d-block text-truncate">{job.brand_name || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">SubBrand</small>
            <span className="d-block text-truncate">{job.sub_brand_name || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Flavour</small>
            <span className="d-block text-truncate">{job.flavour_name || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">PackType</small>
            <span className="d-block text-truncate">{job.pack_type_name || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">PackSize</small>
            <span className="d-block">{job.pack_size || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">PackCode</small>
            <span className="d-block text-truncate">{job.pack_code_name || "N/A"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Priority</small>
            <span className={`d-block ${getPriorityClass(job.priority)}`}>
              {job.priority || "N/A"}
            </span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Assignee</small>
            <span className="d-block text-truncate">{job.assignee || " Unassigned"}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Total Time</small>
            <span className="d-block">{job.total_time || "N/A"}</span>
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-sm btn-outline-primary flex-fill me-1"
            onClick={() => handleViewJob(job)}
          >
            <FaEye className="me-1" /> View
          </button>
          <button
            className="btn btn-sm btn-outline-primary flex-fill mx-1"
            onClick={() => handleEditJob(job)}
          >
            <FaEdit className="me-1" /> Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger flex-fill ms-1"
            onClick={() => handleDeleteJob(job.id)}
          >
            <FaTrash className="me-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function JobsTab({ projectId, project_name }) {


  //user role from local storage
  const userRole = localStorage.getItem("role");
  console.log("User Role:", userRole);



  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // State for jobs data
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to show/hide modal

  const openModal = () => {
    if (selectedJobs.length > 0) {
      setShowModal(true);
    } else {
      toast.error("Please select at least one job.");
    }
  };
  const closeModal = () => setShowModal(false);

  // Check screen size on mount and when resized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch jobs data on component mount
  useEffect(() => {
    fetchJobs();
  }, [projectId]);



  // Function to fetch jobs from API using the project-specific endpoint
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      // Updated API endpoint to get jobs by project ID
      const response = await axiosInstance.get(`/jobs/project/${projectId}`);

      if (response.data?.success) {
        setJobs(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch jobs.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching jobs. Please try again.");
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle job deletion
  const handleDeleteJob = async (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  // Confirm the deletion of the job
  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const response = await axiosInstance.delete(`/jobs/${jobToDelete}`);

      if (response.data?.success) {
        toast.success("Job deleted successfully!");
        fetchJobs();
        setShowDeleteModal(false);
      } else {
        toast.error(response.data?.message || "Failed to delete job.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting job. Please try again.");
      console.error("Error deleting job:", error);
    }
  };

  // Function to handle job editing
  const handleEditJob = (job) => {
    navigate(`/projects/${projectId}/jobs/edit/${job.id}`);
  };

  // Function to handle job viewing
  const handleViewJob = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  // Function to handle checkbox selection
  // In the JobsTab component

  // Function to handle job selection
  const handleSelectJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId)); // Remove job ID
    } else {
      setSelectedJobs([...selectedJobs, jobId]); // Add job ID
    }
  };




  // Function to handle select all
  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "bg-success"; // 🟢 green

      case "reject":
        return "bg-danger"; // 🔴 red

      case "in_progress":
        return "bg-warning text-dark"; // 🟡 yellow

      case "return":
        return "bg-info text-dark"; // 🟡 yellow

      default:
        return "bg-secondary";
    }
  };


  // Function to get priority class
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-danger fw-medium';
      case 'medium':
        return 'text-warning fw-medium';
      case 'low':
        return 'text-info fw-medium';
      default:
        return 'text-secondary fw-medium';
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteJob}
      />

      {/* JOBS LIST CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Jobs List</h6>
            <div className="d-flex gap-2">
              {userRole === 'admin' && (
                <button className="btn btn-primary btn-sm" onClick={openModal}>
                  Assign Job
                </button>
              )}

              <AssignJobModal
                showModal={showModal}
                closeModal={closeModal}
                projectId={projectId}
                selectedJobs={selectedJobs} // Pass selected job IDs
              />

              {userRole === 'admin' && (
                <button
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => navigate(`/projects/${projectId}/jobs/add`)}
                >
                  Add Job
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <>
              {/* Mobile Select All */}
              {isMobile && (
                <div className="d-flex mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedJobs.length === jobs.length}
                      onChange={handleSelectAll}
                      id="select-all-mobile"
                    />
                    <label className="form-check-label" htmlFor="select-all-mobile">
                      Select All ({selectedJobs.length} selected)
                    </label>
                  </div>
                </div>
              )}

              {/* Desktop Table View */}
              {!isMobile && (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedJobs.length === jobs.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th style={{ whiteSpace: "nowrap" }}>Job No</th>
                        <th style={{ whiteSpace: "nowrap" }}>Project Name</th>
                        <th style={{ whiteSpace: "nowrap" }}>Project No</th>
                        <th>Brand</th>
                        <th>SubBrand</th>
                        <th>Flavour</th>
                        <th>PackType</th>
                        <th>PackSize</th>
                        <th>PackCode</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>TotalTime</th>
                        <th>Status</th>
                        {userRole === 'admin' && (
                          <th className="text-center">Actions</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedJobs.includes(job.id)}
                              onChange={() => handleSelectJob(job.id)}
                            />
                          </td>
                          <td
                            className="text-primary fw-semibold"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleViewJob(job)}
                          >
                            {job.job_no}
                          </td>
                          <td>{job.project_name}</td>
                          <td>{job.project_no || "N/A"}</td>
                          <td >{job.brand_name || "N/A"}</td>
                          <td>{job.sub_brand_name || "N/A"}</td>
                          <td>{job.flavour_name || "N/A"}</td>
                          <td>{job.pack_type_name || "N/A"}</td>
                          <td>{job.pack_size || "N/A"}</td>
                          <td>{job.pack_code || "N/A"}</td>
                          <td>
                            <span className={getPriorityClass(job.priority)}>
                              {job.priority || "N/A"}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{job.assigned_name || " Unassigned"}</td>
                          <td>{job.total_time || "N/A"}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(job.job_status)}`}>
                              {job.job_status || "N/A"}
                            </span>

                          </td>
                          {userRole === 'admin' && (
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="View"
                                  onClick={() => handleViewJob(job)}
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="Edit"
                                  onClick={() => handleEditJob(job)}
                                >
                                  <FaEdit />
                                </button>
                                {/* <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
                                  onClick={() => handleDeleteJob(job.id)}
                                >
                                  <FaTrash />
                                </button> */}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <div className="mobile-jobs-container">
                  {jobs.map((job) => (
                    <MobileJobCard
                      key={job.id}
                      job={job}
                      handleSelectJob={handleSelectJob}
                      selectedJobs={selectedJobs}
                      handleViewJob={handleViewJob}
                      handleEditJob={handleEditJob}
                      handleDeleteJob={handleDeleteJob}
                      getStatusBadgeClass={getStatusBadgeClass}
                      getPriorityClass={getPriorityClass}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No jobs found for this project.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/projects/${projectId}/jobs/add`)}
              >
                Add First Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}