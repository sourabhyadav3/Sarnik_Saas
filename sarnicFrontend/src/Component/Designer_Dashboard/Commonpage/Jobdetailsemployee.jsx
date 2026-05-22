import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTimes} from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import axiosInstance from "../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";

export default function Jobdetailsemployee() {
  const { id: jobId } = useParams();       // job id from URL
  console.log("jobid", jobId)
  const navigate = useNavigate();
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user.employee_id || null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  const userId = getUserId();

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
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    try {
      setLoadingLogs(true);

      const res = await axiosInstance.get(`/time-logs/employee/${userId}/job/${jobId}`);

      if (res.status === 200 && res.data?.success) {
        // logs are now in res.data.logs
        const { employee, logs } = res.data;

        // save employee object
        if (employee) {
          setEmployeeDetails(employee);
        }

        // logs aaye to wahi dikhao
        if (logs && logs.length > 0) {
          setTimeLogs(logs);
        }
        // logs empty ho to employee se fallback row banao
        else if (employee) {
          setTimeLogs([
            {
              date: employee.created_at,
              task_description: employee.task_description,
              employee_name: employee.employee_name,
              time_budget: employee.time_budget,
              time: "00:00",
              overtime: "00:00",
              total_time: "00:00",
            }
          ]);
        }

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

    // If time has HH:MM:SS format, extract only HH:MM
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    // If time has decimal point, remove everything after the decimal
    if (timeString.includes(".")) {
      timeString = timeString.split(".")[0];
      // Check if it's HH:MM format after removing decimal
      if (timeString.includes(":")) {
        const parts = timeString.split(":");
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
      }
    }
    
    return timeString;
  };

  /* ================= CALCULATE TOTALS ================= */
  const calculateTotals = () => {
    let totalWorkTime = { hours: 0, minutes: 0 };
    let totalOverTime = { hours: 0, minutes: 0 };
    let totalTotalTime = { hours: 0, minutes: 0 };

    timeLogs?.forEach((log) => {
      // Work Time
      const work = formatTime(log.time).split(":");
      totalWorkTime.hours += parseInt(work[0]) || 0;
      totalWorkTime.minutes += parseInt(work[1]) || 0;

      // Over Time
      const over = formatTime(log.overtime).split(":");
      totalOverTime.hours += parseInt(over[0]) || 0;
      totalOverTime.minutes += parseInt(over[1]) || 0;

      // Total Time
      const total = formatTime(log.total_time).split(":");
      totalTotalTime.hours += parseInt(total[0]) || 0;
      totalTotalTime.minutes += parseInt(total[1]) || 0;
    });

    // normalize minutes
    totalWorkTime.hours += Math.floor(totalWorkTime.minutes / 60);
    totalWorkTime.minutes %= 60;

    totalOverTime.hours += Math.floor(totalOverTime.minutes / 60);
    totalOverTime.minutes %= 60;

    totalTotalTime.hours += Math.floor(totalTotalTime.minutes / 60);
    totalTotalTime.minutes %= 60;

    return {
      workTime: `${String(totalWorkTime.hours).padStart(2, "0")}:${String(
        totalWorkTime.minutes
      ).padStart(2, "0")}`,
      overTime: `${String(totalOverTime.hours).padStart(2, "0")}:${String(
        totalOverTime.minutes
      ).padStart(2, "0")}`,
      totalTime: `${String(totalTotalTime.hours).padStart(2, "0")}:${String(
        totalTotalTime.minutes
      ).padStart(2, "0")}`,
      timeBudget: (() => {
        let bh = 0, bm = 0;
        timeLogs?.forEach(log => {
          const [h, m] = formatTime(log.time_budget).split(":");
          bh += parseInt(h) || 0;
          bm += parseInt(m) || 0;
        });
        bh += Math.floor(bm / 60);
        bm %= 60;
        return `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`;
      })()
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
                ) : timeLogs?.length > 0 ? (
                  timeLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatDDMMYYYY(log.date)}</td>
                      <td>
                        <div className="task-desc">
                          {log.task_description || "-"}
                        </div>
                      </td>
                      <td>{log.employee_name}</td>


                      <td className="text-info fw-semibold">{formatTime(log.time_budget)}</td>

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
              <div className="fw-bold text-info fs-5">{totals.timeBudget}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}