import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const AddTimeLog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------
  // DATA FROM MY JOBS
  // -------------------------------
  const {
    jobId,
    projectId,
    projectName,
    jobNo,
    productionId,
  } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user"));
  const employeeId = user?.id;

  // -------------------------------
  // STATE
  // -------------------------------
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [overtimeEnabled, setOvertimeEnabled] = useState(false);
  const [overtime, setOvertime] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // TIME FORMATTER (HH:MM)
  // -------------------------------
  const formatTimeInput = (value) => {
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    }

    return cleaned;
  };

  // -------------------------------
  // SUBMIT
  // -------------------------------
  const handleSubmit = async () => {
    if (!time || time.length < 4) {
      toast.error("Please enter valid time (HH:MM)");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date,
        employee_id: employeeId,
        production_id: productionId,
        job_id: jobId,
        project_id: projectId,
        time,
        overtime: overtimeEnabled ? overtime : "00:00",
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
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          <h5 className="fw-semibold mb-4">Timesheet & Worklog</h5>

          <div className="row g-4">
            {/* PROJECT */}
            <div className="col-md-6">
              <label className="form-label">Project</label>
              <input
                className="form-control"
                value={projectName || ""}
                disabled
              />
            </div>

            {/* JOB NO */}
            <div className="col-md-6">
              <label className="form-label">Job No.</label>
              <input
                className="form-control"
                value={jobNo || ""}
                disabled
              />
            </div>

            {/* DATE */}
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* TIME */}
            <div className="col-md-6">
              <label className="form-label">
                Time Worked (HH:MM)
              </label>
              <input
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

            {/* OVERTIME */}
            <div className="col-md-12">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={overtimeEnabled}
                  onChange={(e) =>
                    setOvertimeEnabled(e.target.checked)
                  }
                />
                <label className="form-check-label text-danger">
                  Overtime
                </label>
              </div>
            </div>

            {overtimeEnabled && (
              <div className="col-md-6">
                <label className="form-label">
                  Overtime Time (HH:MM)
                </label>
                <input
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
              Submit Time Entry
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddTimeLog;
