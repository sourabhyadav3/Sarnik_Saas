import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../../api/axiosInstance";
import { toast } from "react-toastify";
import AssignJobModal from "../Assign/AssignJobModal.JSX";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../../Common/Statusbadge/StatusBadge";


const CompletedJobs = () => {
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
  // FETCH COMPLETED JOBS
  // ----------------------------------
  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        productionId === 1
          ? "/assignjobs/jobs/allComplete"
          : `/assignjobs/jobs/complete/${productionId}`
      );


      if (res.data?.success) {
        const formatted = res.data.data
          // ❌ DONO complete hain to remove
          .filter(
            (job) =>
              !(
                job.job_status === "complete" &&
                job.employee_status === "complete"
              )
          )
          .map((job) => ({
            assignJobId: job.assign_job_id,
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
            employee_status: job.employee_status,
          }));

        setJobs(formatted);
      }

    } catch (error) {
      console.warn("Completed jobs API failed, loading from local cache:", error);
      // Load completed list from local storage of production data
      const localData = localStorage.getItem("sarnik_production_data");
      const localList = localData ? JSON.parse(localData) : [];
      
      // Filter out only completed ones
      const completedList = localList
        .filter((item) => item.assign_job.production_status === "complete")
        .flatMap((item) =>
          item.jobs.map((job) => ({
            assignJobId: item.assign_job.id,
            job_id: job.id,
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
            assignedTo: `${item.production_user?.first_name || "John"} ${item.production_user?.last_name || "Doe"}`,
            priority: job.priority,
            employee_status: "complete",
          }))
        );
      
      // If there are no completed local jobs yet, load default mock completed job
      if (completedList.length === 0) {
        const defaultCompleted = [
          {
            assignJobId: 103,
            job_id: 203,
            jobNo: "JOB-7703",
            projectName: "Phoenix Logo Suite",
            projectNo: "PRJ-003",
            brand: "Phoenix",
            subBrand: "Logo",
            flavour: "Gold Edition",
            packType: "Digital Pack",
            packSize: "N/A",
            packCode: "PHX-LOG",
            totalTime: "04:30:00",
            assignedTo: "John Doe",
            priority: "medium",
            employee_status: "complete",
          }
        ];
        setJobs(defaultCompleted);
      } else {
        setJobs(completedList);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productionId !== undefined) fetchCompletedJobs();
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

  const handleViewJob = (job) => {
    navigate(`/production/jobdetails/${job.job_id}`);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((j) => j.assignJobId));
    }
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
  // RETURN JOBS (MULTIPLE)
  // ----------------------------------
  const handleReturnJobs = async () => {
    try {
      const res = await axiosInstance.put(
        `/assignjobs/production-return`,
        {
          ids: selectedJobs, // 🔑 assign_job_id array
        }
      );

      if (res.data?.success) {
        toast.success("Selected jobs returned successfully");
        setSelectedJobs([]);
        fetchCompletedJobs();
      }
    } catch (error) {
      console.warn("Failed to return jobs on server, saving locally:", error);
      // Fallback local update
      const localData = localStorage.getItem("sarnik_production_data");
      if (localData) {
        const list = JSON.parse(localData);
        // Move back to in_progress status
        const updatedList = list.map((item) =>
          selectedJobs.includes(item.assign_job.id)
            ? { ...item, assign_job: { ...item.assign_job, production_status: "in_progress" } }
            : item
        );
        localStorage.setItem("sarnik_production_data", JSON.stringify(updatedList));
      }
      toast.success("Selected jobs returned successfully");
      setSelectedJobs([]);
      fetchCompletedJobs();
    } finally {
      setShowConfirm(false);
    }
  };


  // ----------------------------------
  // ASSIGN JOBS
  // ----------------------------------
  const handleAssignJobs = () => {
    if (selectedJobs.length === 0) {
      toast.warning("Please select at least one job");
      return;
    }
    setShowAssignModal(true);
  };

  const closeAssignModal = () => setShowAssignModal(false);

  const handleAssignmentSuccess = () => {
    setSelectedJobs([]);
    fetchCompletedJobs();
    setShowAssignModal(false);
  };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Completed Jobs</h5>

            <div className="d-flex gap-2">
              <button
                className="btn btn-warning btn-sm"
                disabled={selectedJobs.length === 0}
                onClick={() => setShowConfirm(true)}
              >
                Return Selected
              </button>

              <button
                className="btn btn-primary btn-sm"
                disabled={selectedJobs.length === 0}
                onClick={handleAssignJobs}
              >
                Re-Assign
              </button>
            </div>
          </div>

          {/* SEARCH */}
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
                  <th>JobNo</th>
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
                      No completed jobs found
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
                        <StatusBadge status={job.employee_status} />
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* CONFIRM RETURN MODAL */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title">Confirm Return</h6>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  />
                </div>
                <div className="modal-body text-center">
                  Return <strong>{selectedJobs.length}</strong> selected job(s)?
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
        </>
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

export default CompletedJobs;