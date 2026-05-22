import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";

const TimesheetOverview = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    const fetchTimeLogs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/time-logs");
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
  }, []);

  // Get unique employees for the dropdown
  const uniqueEmployees = useMemo(() => {
    const employees = new Set();
    logs.forEach(log => {
      if (log.employee_name) {
        employees.add(log.employee_name);
      }
    });
    return Array.from(employees).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !search ||
        log.JobID?.toString().includes(search) ||
        log.project_id?.toString().includes(search) ||
        log.employee_id?.toString().includes(search) ||
        log.project_name?.toLowerCase().includes(search.toLowerCase());

      const logDate = new Date(log.date);
      const matchFrom = !fromDate || logDate >= new Date(fromDate);
      const matchTo = !toDate || logDate <= new Date(toDate);
      const matchEmployee = !selectedEmployee || log.employee_name === selectedEmployee;

      return matchSearch && matchFrom && matchTo && matchEmployee;
    });
  }, [logs, search, fromDate, toDate, selectedEmployee]);

  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // Function to format time from HH:MM:SS to HH:MM
  const formatTimeWithoutSeconds = (time) => {
    if (!time) return "00:00";
    return time.slice(0, 5); // Take only the first 5 characters (HH:MM)
  };

  const totalTime = filteredLogs.reduce(
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

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setSelectedEmployee("");
  };

  const hasActiveFilters = search || fromDate || toDate || selectedEmployee;

  return (
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          <h4 className="fw-bold mb-3">Timesheet & Worklog</h4>

          {/* FILTERS */}
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Job No.  Project..."
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

            <div className="col-md-3">
              <select 
                className="form-select" 
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {uniqueEmployees.map(employee => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <FaTimes /> Clear Filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Job No</th>
                  <th>Project Name</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th className="text-end">Time</th>
                  <th className="text-end">Overtime</th>
                  <th className="text-end">Total Time</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
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
                      <td className="text-end">{formatTimeWithoutSeconds(log.time)}</td>
                      <td className="text-end">{formatTimeWithoutSeconds(log.overtime)}</td>
                      <td className="text-end">
                        {formatTimeWithoutSeconds(log.total_time)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* ✅ TOTALS PERFECTLY ALIGNED */}
              <tfoot>
                <tr className="fw-semibold border-top">
                  <td colSpan="4" className="text-end">
                    Total
                  </td>
                  <td className="text-end">
                    {minutesToTime(totalTime)}
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

export default TimesheetOverview;