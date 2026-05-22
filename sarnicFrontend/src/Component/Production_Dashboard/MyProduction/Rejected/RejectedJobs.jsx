import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../api/axiosInstance";
import { toast } from "react-toastify";
import AssignJobModal from "../Assign/AssignJobModal.JSX";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../../Common/Statusbadge/StatusBadge";

const RejectedJobs = () => {
  // ----------------------------------
  // Logged-in Production User
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const productionId = user?.id;

  // ----------------------------------
  // STATE
  // ----------------------------------
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

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // ----------------------------------
  // FETCH REJECTED JOBS
  // ----------------------------------
  const fetchRejectedJobs = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        productionId === 1
          ? "/assignjobs/jobs/allreject"
          : `/assignjobs/jobs/reject/${productionId}`
      );


      if (res.data?.success) {
        const formatted = res.data.data.map((job) => ({
          assignJobId: job.assign_job_id, // 🔑 IMPORTANT
          job_id: job.job_id,
          jobNo: job.job_no,
          projectName: job.project_name,
          projectNo: job.project_no,
          brand: job.brand,
          subBrand: job.sub_brand,
          flavour: job.flavour,
          packType: job.pack_type,
          packSize: job.pack_size,
          packCode: job.pack_code,
          totalTime: job.total_time,
          assignedTo: job.assigned_to || "-",
          priority: job.priority,
          status: job.status,
        }));

        setJobs(formatted);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rejected jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productionId !== undefined) fetchRejectedJobs();
  }, [productionId]);


  // ----------------------------------
  // CHECKBOX HANDLING
  // ----------------------------------
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
  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.job_id}`);
  };
  // ----------------------------------
  // FILTER
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.jobNo.toString().includes(search) ||
        job.projectName.toLowerCase().includes(search.toLowerCase()) ||
        job.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  // ----------------------------------
  // RE-ASSIGN FLOW
  // ----------------------------------
  const handleReAssign = () => {
    if (selectedJobs.length === 0) {
      toast.warning("Please select at least one job");
      return;
    }
    setShowConfirm(true);
  };

  const confirmReAssign = () => {
    setShowConfirm(false);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => setShowAssignModal(false);

  const handleAssignmentSuccess = () => {
    setSelectedJobs([]);
    fetchRejectedJobs();
    setShowAssignModal(false);
  };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Rejected Jobs</h5>

            <button
              className="btn btn-primary btn-sm"
              disabled={selectedJobs.length === 0}
              onClick={handleReAssign}
            >
              Re-Assign
            </button>
          </div>

          {/* FILTER */}
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
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
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
                        selectedJobs.length === filteredJobs.length
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
                  <th>Time Budget</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      No rejected jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, i) => (
                    <tr key={i}>
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
                      <td>{job.brand}</td>
                      <td>{job.subBrand}</td>
                      <td>{job.flavour}</td>
                      <td>{job.packType}</td>
                      <td>{job.packSize}</td>
                      <td>{job.packCode}</td>
                      <td>{formatTime(job.totalTime)}</td>
                      <td>{job.assignedTo}</td>
                      <td className="fw-semibold text-danger">
                        {job.priority}
                      </td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title">Confirm Re-Assign</h6>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  />
                </div>
                <div className="modal-body text-center">
                  Re-assign <strong>{selectedJobs.length}</strong> selected job(s)?
                </div>
                <div className="modal-footer justify-content-center">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={confirmReAssign}
                  >
                    Yes, Re-Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ASSIGN MODAL */}
      <AssignJobModal
        showModal={showAssignModal}
        closeModal={closeAssignModal}
        selectedJobs={selectedJobs} // 🔑 assign_job_ids
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default RejectedJobs;