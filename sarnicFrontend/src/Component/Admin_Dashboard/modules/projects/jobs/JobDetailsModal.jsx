import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTimes
} from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import axiosInstance from "../../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";

export default function JobDetails() {
  const { jobId } = useParams();       // job id from URL
  console.log("jobid", jobId)
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  /* ================= FETCH JOB DETAILS ================= */
  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      // 🔹 API call by job id
      const res = await axiosInstance.get(`/jobs/${jobId}`);

      if (res.status === 200 && res.data?.success) {
        setJobDetails(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch job details", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH TIME LOGS ================= */
  const fetchTimeLogs = async () => {
    try {
      setLoadingLogs(true);

      const res = await axiosInstance.get(`/time-logs/employee/job/${jobId}`);

      if (res.status === 200 && res.data?.success) {

        const rows = res.data.productions.flatMap((production) => {
          // ✅ Case 1: Logs available
          if (production.logs && production.logs.length > 0) {
            return production.logs.map(log => ({
              date: log.date,
              task_description: log.task_description || production.task_description,
              employee_name: log.employee_name || log.production_name || "-",
              time_budget: log.time_budget || production.time_budget,
              time: log.time,
              overtime: log.overtime,
              total_time: log.total_time,
            }));
          }

          // ✅ Case 2: No logs → show production row
          return [{
            date: production.created_at,
            task_description: production.task_description,
            employee_name: production.production_name,
            time_budget: production.time_budget,
            time: "00:00",
            overtime: "00:00",
            total_time: "00:00",
          }];
        });

        setTimeLogs(rows);
      }
    } catch (error) {
      console.error("Failed to fetch time logs", error);
    } finally {
      setLoadingLogs(false);
    }
  };


  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchTimeLogs();
    }
  }, [jobId]);

  /* ================= FORMAT TIME ================= */
  const formatTime = (timeString) => {
    if (!timeString) return "00:00";

    // First remove microseconds if any
    if (timeString.includes('.')) {
      timeString = timeString.split('.')[0];
    }
    
    // Now ensure we only take HH:MM
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return "00:00";
  };

  /* ================= CALCULATE TOTALS ================= */
  const calculateTotals = () => {
    let totalWorkTime = { hours: 0, minutes: 0 };
    let totalOverTime = { hours: 0, minutes: 0 };
    let totalBudgetTime = { hours: 0, minutes: 0 };
    let totalBudget = { hours: 0, minutes: 0 }; // New variable for overall time budget

    timeLogs?.forEach(log => {
      // Parse work time
      const workTime = formatTime(log.time).split(':');
      totalWorkTime.hours += parseInt(workTime[0]) || 0;
      totalWorkTime.minutes += parseInt(workTime[1]) || 0;

      // Parse overtime
      const overTime = formatTime(log.overtime).split(':');
      totalOverTime.hours += parseInt(overTime[0]) || 0;
      totalOverTime.minutes += parseInt(overTime[1]) || 0;

      // Parse total time
      const totalTime = formatTime(log.total_time).split(':');
      totalBudgetTime.hours += parseInt(totalTime[0]) || 0;
      totalBudgetTime.minutes += parseInt(totalTime[1]) || 0;

      // Parse time budget
      const budgetTime = formatTime(log.time_budget).split(':');
      totalBudget.hours += parseInt(budgetTime[0]) || 0;
      totalBudget.minutes += parseInt(budgetTime[1]) || 0;
    });

    // Normalize minutes to hours
    totalWorkTime.hours += Math.floor(totalWorkTime.minutes / 60);
    totalWorkTime.minutes = totalWorkTime.minutes % 60;

    totalOverTime.hours += Math.floor(totalOverTime.minutes / 60);
    totalOverTime.minutes = totalOverTime.minutes % 60;

    totalBudgetTime.hours += Math.floor(totalBudgetTime.minutes / 60);
    totalBudgetTime.minutes = totalBudgetTime.minutes % 60;

    // Parse budget minutes to hours (Summing logic)
    // Note: Previously this might have been just summing log budgets. 
    // Ideally budget is per task, but here we are summing all displayed budget rows 
    // to match the behavior requested by user (cumulative budget).
    
    // Reset totalBudget accumulator as we want to recalculate it from scratch if needed,
    // or just ensure the loop above handled it.
    // The loop above: totalBudget.hours += parseInt(budgetTime[0])... 
    // This is already summing it! We just need to normalize.

    totalBudget.hours += Math.floor(totalBudget.minutes / 60);
    totalBudget.minutes = totalBudget.minutes % 60;

    return {
      workTime: `${String(totalWorkTime.hours).padStart(2, '0')}:${String(totalWorkTime.minutes).padStart(2, '0')}`,
      overTime: `${String(totalOverTime.hours).padStart(2, '0')}:${String(totalOverTime.minutes).padStart(2, '0')}`,
      totalTime: `${String(totalBudgetTime.hours).padStart(2, '0')}:${String(totalBudgetTime.minutes).padStart(2, '0')}`,
      budgetTime: `${String(totalBudget.hours).padStart(2, '0')}:${String(totalBudget.minutes).padStart(2, '0')}` // New calculated budget time
    };
  };

  const totals = calculateTotals();

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        Loading job details...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">

        {/* ================= HEADER ================= */}
        <div className="bg-primary text-white px-4 py-3 rounded-top-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <BsInfoCircleFill /> Job Details
          </h5>
          <button
            className="btn btn-sm btn-light rounded-circle"
            onClick={() => navigate(-1)}
          >
            <FaTimes />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="card-body p-4">

          {/* ================= JOB INFO GRID ================= */}
          {jobDetails && (
            <div className="row g-3 mb-4">

              {[
                ["Job No", jobDetails.job_no],
                ["Project Name", jobDetails.main_project_name],
                ["Project No", jobDetails.project_no],
                ["Status", jobDetails.job_status],
                ["Priority", jobDetails.priority],
                ["Brand", jobDetails.brand_name],
                ["Sub Brand", jobDetails.sub_brand_name],
                ["Flavour", jobDetails.flavour_name],
                ["Pack Type", jobDetails.pack_type_name],
                ["Pack Code", jobDetails.packCode],
                ["Pack Size", `${jobDetails.pack_size} `],
                ["EAN Barcode", jobDetails.ean_barcode],
              ].map(([label, value], index) => (
                <div className="col-md-6" key={index}>
                  <div className="bg-light rounded-3 px-3 py-2 d-flex align-items-center gap-2">
                    <BsInfoCircleFill className="text-primary" />
                    <span className="fw-medium">{label}:</span>
                    <span>{value || "—"}</span>
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* ================= WORK LOG ================= */}
          <h6 className="fw-bold text-primary mb-2">Work Log:</h6>

          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle text-sm">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Task Description</th>
                  <th>Employee Name</th>
                  <th>Time Budget</th>
                  <th>Time Spent</th>
                  <th>Over Time</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan="7" className="text-center">Loading time logs...</td>
                  </tr>
                ) : timeLogs.length > 0 ? (
                  timeLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatDDMMYYYY(log.date)}</td>
                      <td>
                        <div className="task-desc">
                          {log.task_description || "-"}
                        </div>
                      </td>

                      <td>{log.employee_name}</td>
                      <td className="text-primary fw-semibold">{formatTime(log.time_budget)}</td>
                      <td className="text-primary fw-semibold">{formatTime(log.time)}</td>
                      <td className="text-danger fw-semibold">{formatTime(log.overtime)}</td>
                      <td className="text-success fw-semibold">{formatTime(log.total_time)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No time logs found for this job</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="row text-center bg-light rounded-4 py-3">
            <div className="col-md-3">
              <div className="fw-medium">Work Time</div>
              <div className="fw-bold text-primary fs-5">{totals.workTime}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-medium">Over Time</div>
              <div className="fw-bold text-danger fs-5">{totals.overTime}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-medium">Total Time</div>
              <div className="fw-bold text-success fs-5">{totals.totalTime}</div>
            </div>
            <div className="col-md-3">
              <div className="fw-medium">Time Budget</div>
              <div className="fw-bold text-info fs-5">{totals.budgetTime}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}