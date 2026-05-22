import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";

const TimeTracking = () => {
  // ----------------------------------
  // LOGGED-IN USER
  // ----------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // ----------------------------------
  // STATE
  // ----------------------------------
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  // ----------------------------------
  // FETCH TIME LOGS
  // ----------------------------------
  useEffect(() => {
    if (!userId) return;

    const fetchTimeLogs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/time-logs/production/${userId}`
        );

        if (res.data?.success) {
          setLogs(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch time logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeLogs();
  }, [userId]);

  // ----------------------------------
  // FILTER LOGIC
  // ----------------------------------
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !search ||
        log.JobID?.toString().includes(search) ||
        log.project_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.employee_name?.toLowerCase().includes(search.toLowerCase());

      const logDate = new Date(log.date);

      const matchFrom =
        !fromDate || logDate >= new Date(fromDate);

      const matchTo =
        !toDate || logDate <= new Date(toDate);

      const matchProject =
        projectFilter === "all" ||
        log.project_name === projectFilter;

      return matchSearch && matchFrom && matchTo && matchProject;
    });
  }, [logs, search, fromDate, toDate, projectFilter]);

  // ----------------------------------
  // TIME HELPERS (HH:MM or HH:MM:SS)
  // ----------------------------------
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const parts = time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    return h * 60 + m;
  };

  const minutesToTime = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // Helper to format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // Takes only HH:MM part
  };

  // ----------------------------------
  // TOTALS (FILTERED)
  // ----------------------------------
  const totalBudget = filteredLogs.reduce(
    (sum, l) =>
      sum +
      timeToMinutes(l.time_budget || l.time_budget_snapshot),
    0
  );

  const totalWorkTime = filteredLogs.reduce(
    (sum, l) => sum + timeToMinutes(l.time),
    0
  );

  const totalOvertime = filteredLogs.reduce(
    (sum, l) => sum + timeToMinutes(l.overtime),
    0
  );

  const totalOverall = filteredLogs.reduce(
    (sum, l) => sum + timeToMinutes(l.total_time),
    0
  );

  return (
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          {/* HEADER */}
          <h4 className="fw-bold mb-3">Time Logs</h4>

          {/* FILTER ROW */}
          <div className="row g-2 mb-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search time logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {[...new Set(logs.map(l => l.project_name).filter(Boolean))].map(
                  (name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Job ID</th>
                  <th>Project Name</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th className="text-end">Time Budget</th>
                  <th className="text-end">Work Time</th>
                  <th className="text-end">Overtime</th>
                  <th className="text-end">Total Time</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.JobID}</td>
                      <td>{log.project_name}</td>
                      <td>{log.employee_name}</td>
                      <td>{formatDDMMYYYY(log.date)}</td>
                      <td className="text-end">
                        {formatTime(log.time_budget || log.time_budget_snapshot)}
                      </td>
                      <td className="text-end">{formatTime(log.time)}</td>
                      <td className="text-end">{formatTime(log.overtime)}</td>
                      <td className="text-end">
                        {formatTime(log.total_time)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* TOTAL ROW */}
              <tfoot>
                <tr className="fw-semibold border-top">
                  <td colSpan="4" className="text-end">
                    Total
                  </td>
                  <td className="text-end">
                    {minutesToTime(totalBudget)}
                  </td>
                  <td className="text-end">
                    {minutesToTime(totalWorkTime)}
                  </td>
                  <td className="text-end">
                    {minutesToTime(totalOvertime)}
                  </td>
                  <td className="text-end">
                    {minutesToTime(totalOverall)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimeTracking;