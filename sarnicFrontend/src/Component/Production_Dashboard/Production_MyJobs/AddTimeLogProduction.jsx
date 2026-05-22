import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const AddTimeLogProduction = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const {
    projectId,
    projectName,
    jobId,
    jobNo,
    productionId,
  } = state || {};

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [hasOvertime, setHasOvertime] = useState(false);
  const [overtime, setOvertime] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // =================================
  // AUTO HH:MM FORMATTER
  // =================================
  const formatTimeInput = (value) => {
    // remove non-numeric
    let cleaned = value.replace(/\D/g, "");

    // limit to 4 digits
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

    // auto insert colon
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    }

    return cleaned;
  };

  // =================================
  // SUBMIT
  // =================================
  const handleSubmit = async () => {
    if (!time || time.length < 4) {
      toast.error("Please enter valid time (HH:MM)");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date,
        employee_id: user?.id,
        production_id: productionId,
        job_id: jobId,
        project_id: projectId,
        time,
        overtime: hasOvertime ? overtime : "00:00",
        task_description: taskDescription || "",
      };

      const res = await axiosInstance.post("/time-logs", payload);

      if (res.data?.success) {
        toast.success("Time log added successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add time log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">Timesheet & Worklog</h5>

          <div className="row g-4">

            {/* Project */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Project</label>
              <input className="form-control" value={projectName} disabled />
            </div>

            {/* Job No */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Job No.</label>
              <input className="form-control" value={jobNo} disabled />
            </div>

            {/* Date */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time Worked */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Time Worked (HH:MM)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="HH:MM"
                value={time}
                onChange={(e) =>
                  setTime(formatTimeInput(e.target.value))
                }
              />
              <small className="text-muted">
                Auto formats after 2 digits (e.g. 12 → 12:)
              </small>
            </div>

            {/* Overtime Checkbox */}
            <div className="col-md-12">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={hasOvertime}
                  onChange={(e) => setHasOvertime(e.target.checked)}
                  id="overtimeCheck"
                />
                <label
                  className="form-check-label fw-semibold text-danger"
                  htmlFor="overtimeCheck"
                >
                  Overtime
                </label>
              </div>
            </div>

            {/* Overtime Time */}
            {hasOvertime && (
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Overtime Time (HH:MM)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="HH:MM"
                  value={overtime}
                  onChange={(e) =>
                    setOvertime(formatTimeInput(e.target.value))
                  }
                />
              </div>
            )}

          </div>

          {/* ACTIONS */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              className="btn btn-light"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="btn btn-dark"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Submitting..." : "Submit Time Entry"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddTimeLogProduction;
