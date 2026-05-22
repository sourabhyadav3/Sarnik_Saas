import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../api/axiosInstance";
import { toast } from "react-toastify";
import AssignJobModal from "./AssignJobModal.JSX";
import { useNavigate } from "react-router-dom";
import { formatDDMMYYYY } from "../../../../Common/DateFormate/dateFormat";


const ProductionAssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  // selection
  const [selectedJobs, setSelectedJobs] = useState([]);

  // modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // =====================================================
  // FETCH ASSIGNED JOBS
  // =====================================================
  useEffect(() => {
    if (userId !== undefined) fetchAssignedJobs();
  }, [userId]);


  const fetchAssignedJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        userId === 1
          ? "/assignjobs/productionall"
          : `/assignjobs/production/${userId}`
      );


      if (res.data?.success) {

        // 🔑 FILTER: production_id match AND employee_id must be NULL
        // 🔑 STEP 1: assign_job level filter
        const filteredData = res.data.data.filter(
          (item) =>
            (userId === 1 || item.assign_job.production_id === userId) &&
            item.assign_job.employee_id === null
        );





        // 🔑 STEP 2: job level filter (sirf in_progress jobs)
        const formatted = filteredData.flatMap((item) =>
          item.jobs
            .filter((job) => job.job_status === "in_progress")
            .map((job) => ({
              assignJobId: item.assign_job.id,
              jobId: job.id,
              jobNo: job.job_no,
              projectName: item.project.project_name,
              projectNo: item.project.project_no,
              brand: job.brand?.name || "-",
              subBrand: job.sub_brand?.name || "-",
              flavour: job.flavour?.name || "-",
              packType: job.pack_type?.name || "-",
              packSize: job.pack_size || "-",
              packCode: job.pack_code || "-",
              totalTime: item.assign_job.time_budget || "00:00",
              dueDate: item.project.expected_completion_date
                ? new Date(item.project.expected_completion_date).toLocaleDateString()
                : "-",
              assignedTo: `${item.production_user.first_name} ${item.production_user.last_name}`,
              priority: job.priority,
              status: job.job_status,
            }))
        );

        setJobs(formatted);

      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load assigned jobs");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHECKBOX
  // =====================================================
  const toggleJobSelection = (id) => {
    setSelectedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
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
  // FILTER LOGIC
  // =====================================================
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.jobNo.toString().includes(search) ||
        job.projectName.toLowerCase().includes(search.toLowerCase()) ||
        job.brand.toLowerCase().includes(search.toLowerCase()) ||
        job.subBrand.toLowerCase().includes(search.toLowerCase());

      const matchProject =
        projectFilter === "all" ||
        job.projectName === projectFilter;

      const matchStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchSearch && matchProject && matchStatus;
    });
  }, [jobs, search, projectFilter, statusFilter]);

  // =====================================================
  // RETURN JOBS
  // =====================================================
  const handleReturnJobs = async () => {
    try {
      const res = await axiosInstance.put(
        `/assignjobs/production-reject`,
        {
          ids: selectedJobs // 🔑 assign_job_id array
        }
      );

      if (res.data?.success) {
        toast.success("Selected jobs have been rejected successfully.");
        setSelectedJobs([]);
        fetchAssignedJobs();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject jobs");
    } finally {
      setShowConfirm(false);
    }
  };


  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.jobId}`);
  };

  // =====================================================
  // ASSIGN JOBS
  // =====================================================
  const handleAssignJobs = () => {
    if (selectedJobs.length === 0) {
      toast.warning("Please select at least one job to assign.");
      return;
    }

    // Open the assign modal instead of showing a toast
    setShowAssignModal(true);
  };

  // Function to close the modal
  const closeAssignModal = () => {
    setShowAssignModal(false);
  };

  // Function to handle successful assignment
  const handleAssignmentSuccess = () => {
    setSelectedJobs([]);
    fetchAssignedJobs();
    setShowAssignModal(false);
  };


        const getStatusBadgeClass = (status) => {
          switch (status?.toLowerCase()) {
            case "complete":
              return "bg-success";          // 🟢
            case "reject":
              return "bg-danger";           // 🔴
            case "in_progress":
              return "bg-warning text-dark";// 🟡
            case "return":
              return "bg-info text-dark";   // 🔵
            default:
              return "bg-secondary";
          }
        };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Production Assigned Jobs</h5>

            <div className="d-flex gap-2">
              {/* RETURN */}
              <button
                className="btn btn-warning btn-sm"
                disabled={selectedJobs.length === 0}
                onClick={() => setShowConfirm(true)}
              >
                Reject Jobs
              </button>

              {/* ASSIGN */}
              <button
                className="btn btn-primary btn-sm"
                disabled={selectedJobs.length === 0}
                onClick={handleAssignJobs}
              >
                Assign
              </button>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={projectFilter}
                onChange={(e) =>
                  setProjectFilter(e.target.value)
                }
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

            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Completed</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredJobs.length > 0 &&
                        selectedJobs.length ===
                        filteredJobs.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Job No</th>
                  <th>Project</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th> Time Budget</th>
                  {/* <th>Due Date</th> */}
                  <th>Assigned</th>
                  <th>Priority</th>
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
                    <td colSpan="14" className="text-center py-4">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(
                            job.assignJobId
                          )}
                          onChange={() =>
                            toggleJobSelection(
                              job.assignJobId
                            )
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
                      <td>{job.brand}</td>
                      <td>{job.subBrand}</td>
                      <td>{job.flavour}</td>
                      <td>{job.packType}</td>
                      <td>{job.packSize}</td>
                      <td>{job.packCode}</td>
                      <td>{formatTime(job.totalTime)}</td>
                      {/* <td>{formatDDMMYYYY(job.dueDate)}</td> */}
                      <td>{job.assignedTo}</td>
                      <td className="fw-semibold text-danger">
                        {job.priority}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
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

      {/* BACKDROP */}
      {showConfirm && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">
                  Confirm Return
                </h6>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                />
              </div>
              <div className="modal-body text-center">
                Are you sure you want to return{" "}
                <strong>{selectedJobs.length}</strong>{" "}
                selected job(s)?
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleReturnJobs}
                >
                  Yes, Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      <AssignJobModal
        showModal={showAssignModal}
        closeModal={closeAssignModal}
        selectedJobs={selectedJobs}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default ProductionAssignedJobs;