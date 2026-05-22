import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import axiosInstance from "../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";

export default function Jobdetailsproduction() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();

  /* ================= GET USER ID ================= */
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || user.employee_id || null;
    } catch (err) {
      console.error("LocalStorage user parse error", err);
      return null;
    }
  };

  const userId = getUserId();

  /* ================= STATES ================= */
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [productionDetails, setProductionDetails] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  /* ================= FETCH JOB DETAILS ================= */
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/jobs/${jobId}`);
      if (res.status === 200 && res.data?.success) {
        setJobDetails(res.data.data);
      }
    } catch (error) {
      console.error("Job fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH TIME LOGS ================= */
  const fetchTimeLogs = async () => {
    if (!userId) return;

    try {
      setLoadingLogs(true);
      const res = await axiosInstance.get(
        `/time-logs/employee/${userId}/job/${jobId}`
      );

      if (res.status === 200 && res.data?.success) {
        const { production, logs } = res.data;

        if (production) {
          setProductionDetails(production);
        }

        // ✅ Logs available
        if (logs && logs.length > 0) {
          setTimeLogs(logs);
        }
        // ✅ Logs empty → show production row
        else if (production) {
          setTimeLogs([
            {
              date: production.created_at,
              task_description: production.task_description,
              employee_name: production.assigned_employee_name || production.production_name,
              time_budget: production.time_budget,
              time: "00:00",
              overtime: "00:00",
              total_time: "00:00",
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Time log fetch error", error);
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
  const formatTime = (time) => {
    if (!time) return "00:00";
    
    // If time has HH:MM:SS format, extract only HH:MM
    if (time.includes(":")) {
      const parts = time.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    // If time has decimal point, remove everything after the decimal
    if (time.includes(".")) {
      time = time.split(".")[0];
      // Check if it's HH:MM format after removing decimal
      if (time.includes(":")) {
        const parts = time.split(":");
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
      }
    }
    
    return time;
  };

  /* ================= CALCULATE TOTALS ================= */
  const calculateTotals = () => {
    let wh = 0, wm = 0;
    let oh = 0, om = 0;
    let th = 0, tm = 0;

    timeLogs.forEach(log => {
      const [h1, m1] = formatTime(log.time).split(":");
      const [h2, m2] = formatTime(log.overtime).split(":");
      const [h3, m3] = formatTime(log.total_time).split(":");

      wh += parseInt(h1) || 0;
      wm += parseInt(m1) || 0;
      oh += parseInt(h2) || 0;
      om += parseInt(m2) || 0;
      th += parseInt(h3) || 0;
      tm += parseInt(m3) || 0;
    });

    wh += Math.floor(wm / 60); wm %= 60;
    oh += Math.floor(om / 60); om %= 60;
    th += Math.floor(tm / 60); tm %= 60;

    return {
      work: `${String(wh).padStart(2, "0")}:${String(wm).padStart(2, "0")}`,
      over: `${String(oh).padStart(2, "0")}:${String(om).padStart(2, "0")}`,
      total: `${String(th).padStart(2, "0")}:${String(tm).padStart(2, "0")}`,
    };
  };

  const calculateTotalBudget = () => {
    let bh = 0, bm = 0;
    timeLogs.forEach(log => {
      const [h, m] = formatTime(log.time_budget).split(":");
      bh += parseInt(h) || 0;
      bm += parseInt(m) || 0;
    });
    
    bh += Math.floor(bm / 60); 
    bm %= 60;
    
    return `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`;
  };

  const totals = calculateTotals();
  const totalBudget = calculateTotalBudget();

  /* ================= LOADING ================= */
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

        {/* HEADER */}
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

        <div className="card-body p-4">

          {/* JOB INFO */}
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
                ["Pack Code", jobDetails.pack_code],
                ["Pack Size", jobDetails.pack_size],
                ["EAN Barcode", jobDetails.ean_barcode],
              ].map(([label, value], i) => (
                <div className="col-md-6" key={i}>
                  <div className="bg-light rounded-3 px-3 py-2 d-flex gap-2">
                    <BsInfoCircleFill className="text-primary" />
                    <span className="fw-medium">{label}:</span>
                    <span>{value || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WORK LOG */}
          <h6 className="fw-bold text-primary mb-2">Work Log:</h6>

          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Task Description</th>
                  <th>Employee</th>
                  <th>Time Budget</th>
                  <th>Time</th>
                  <th>Over Time</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Loading time logs...
                    </td>
                  </tr>
                ) : (
                  timeLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatDDMMYYYY(log.date)}</td>
                      <td>
                        <div className="task-desc">
                          {log.task_description || "-"}
                        </div>
                      </td>
                      <td>{log.employee_name}</td>
                      <td className="text-primary fw-semibold">
                        {formatTime(log.time_budget)}
                      </td>
                      <td className="text-primary fw-semibold">
                        {formatTime(log.time)}
                      </td>
                      <td className="text-danger fw-semibold">
                        {formatTime(log.overtime)}
                      </td>
                      <td className="text-success fw-semibold">
                        {formatTime(log.total_time)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="row text-center bg-light rounded-4 py-3">
            <div className="col-md-3">
              <div>Work Time</div>
              <b>{totals.work}</b>
            </div>
            <div className="col-md-3">
              <div>Over Time</div>
              <b className="text-danger">{totals.over}</b>
            </div>
            <div className="col-md-3">
              <div>Total Time</div>
              <b className="text-success">{totals.total}</b>
            </div>
            <div className="col-md-3">
              <div>Time Budget</div>
              <b className="text-info">
                {totalBudget}
              </b>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}