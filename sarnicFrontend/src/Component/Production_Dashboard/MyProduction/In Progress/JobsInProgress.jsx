import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../api/axiosInstance";
import AssignJobModal from "../Assign/AssignJobModal.JSX";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../../Common/Statusbadge/StatusBadge";


const JobsInProgress = () => {

  // ----------------------------------
  // Logged-in Production User
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // ----------------------------------
  // STATE
  // ----------------------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate()
  // selection (assign_job_id)
  const [selectedJobs, setSelectedJobs] = useState([]);

  // modal
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // ----------------------------------
  // FETCH IN-PROGRESS JOBS
  // ----------------------------------
  useEffect(() => {
    if (userId === undefined) return;


    const fetchJobs = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          userId === 1
            ? "/assignjobs/jobs/allInprogress"
            : `/assignjobs/jobs/in-progress/${userId}`
        );


        if (res.data?.success) {
          if (res.data?.success) {
  const filtered = (res.data.data || []).filter(
    (job) =>
      !(
        job.status === "in_progress" &&
        job.employee_status === "complete"
      )
  );

  setJobs(filtered);
}

        }
      } catch (error) {
        console.error("Error fetching in-progress jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId]);


  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.job_id}`);
  };
  // ----------------------------------
  // SEARCH FILTER
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      job.job_no.toString().includes(search) ||
      job.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.brand?.toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  // ----------------------------------
  // CHECKBOX HANDLERS
  // ----------------------------------
  const toggleJobSelection = (assignJobId) => {
    setSelectedJobs((prev) =>
      prev.includes(assignJobId)
        ? prev.filter((id) => id !== assignJobId)
        : [...prev, assignJobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((j) => j.assign_job_id));
    }
  };

  // ----------------------------------
  // ASSIGN SUCCESS HANDLER
  // ----------------------------------
  const handleAssignmentSuccess = () => {
    setSelectedJobs([]);
    setShowAssignModal(false);
  };

  return (
    <div className="container-fluid py-4 min-vh-100">

      {/* CARD */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* ================= HEADER ================= */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Jobs In Progress</h5>

            <button
              className="btn btn-primary btn-sm"
              disabled={selectedJobs.length === 0}
              onClick={() => setShowAssignModal(true)}
            >
              Re-Assign
            </button>
          </div>

          {/* ================= FILTER BAR ================= */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="table-responsive">
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
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th> Time Budget</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading && (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      Loading jobs...
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading && filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="13" className="text-center py-4 text-muted">
                      No in-progress jobs found.
                    </td>
                  </tr>
                )}

                {/* DATA */}
                {!loading &&
                  filteredJobs.map((job) => (
                    <tr key={job.assign_job_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.assign_job_id)}
                          onChange={() =>
                            toggleJobSelection(job.assign_job_id)
                          }
                        />
                      </td>
                      <td className="text-primary fw-semibold"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewJob(job)}
                      >
                        {job.job_no}
                      </td>
                      <td>{job.project_name}</td>
                      <td>{job.brand}</td>
                      <td>{job.sub_brand}</td>
                      <td>{job.flavour}</td>
                      <td>{job.pack_type}</td>
                      <td>{job.pack_size}</td>
                      <td>{job.pack_code}</td>
                      <td>{formatTime(job.total_time)}</td>
                      <td>{job.assigned_to}</td>
                      <td className="text-capitalize fw-semibold">
                        {job.priority}
                      </td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ================= ASSIGN MODAL ================= */}
      <AssignJobModal
        showModal={showAssignModal}
        closeModal={() => setShowAssignModal(false)}
        selectedJobs={selectedJobs}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default JobsInProgress;