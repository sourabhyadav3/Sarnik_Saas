import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

import { toast } from "react-toastify";
import axiosInstance from "../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../Common/DateFormate/dateFormat";
import StatusBadge from "../../../../Common/Statusbadge/StatusBadge";

const AssignedJobs = () => {
  // ----------------------------------
  // STATE
  // ----------------------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ----------------------------------
  // FETCH ASSIGNED JOBS
  // ----------------------------------
  useEffect(() => {
    fetchAssignedJobs();
  }, []);

  const fetchAssignedJobs = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/assignjobs/employeeall");

      if (res.data?.success) {
        const formatted = res.data.data.flatMap((item) =>
          item.jobs.map((job) => ({
            assignJobId: item.assign_job.id,

            employeeName: item.employee_user
              ? `${item.employee_user.first_name} ${item.employee_user.last_name}`
              : "-",
            employeeEmail: item.employee_user?.email || "-",

            description: item.assign_job.task_description || "-",

            brand: job.brand?.name || "-",
            subBrand: job.sub_brand?.name || "-",
            flavour: job.flavour?.name || "-",
            packType: job.pack_type?.name || "-",
            packSize: job.pack_size || "-",
            packCode: job.pack_code?.name || "-",

            priority: job.priority || "-",
            dueDate: item.project?.expected_completion_date,
            status: item.assign_job.employee_status || "not_assigned",
          }))
        );

        setJobs(formatted);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assigned jobs");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // FILTER LOGIC
  // ----------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !search ||
        job.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        job.employeeEmail.toLowerCase().includes(search.toLowerCase()) ||
        job.brand.toLowerCase().includes(search.toLowerCase());

      const matchEmployee =
        employeeFilter === "all" ||
        job.employeeEmail === employeeFilter;

      const matchStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchSearch && matchEmployee && matchStatus;
    });
  }, [jobs, search, employeeFilter, statusFilter]);

  // ----------------------------------
  // UNIQUE FILTER OPTIONS
  // ----------------------------------
  const employeeOptions = [
    ...new Set(jobs.map((j) => j.employeeEmail).filter(Boolean)),
  ];

  const statusOptions = [
    ...new Set(jobs.map((j) => j.status)),
  ];

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <h5 className="fw-bold mb-3">Employee Assigned Jobs</h5>

          {/* FILTER BAR */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">All Employees</option>
                {employeeOptions.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Employee Name</th>
                  <th>Employee Email</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Sub Brand</th>
                  <th>Flavour</th>
                  <th>Pack Type</th>
                  <th>Pack Size</th>
                  <th>Pack Code</th>
                  <th>Priority</th>
                  {/* <th>Due Date</th> */}
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="text-center text-muted py-5"
                    >
                      No assigned jobs found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr key={index}>
                      <td>{job.employeeName}</td>
                      <td>{job.employeeEmail}</td>
                      <td>{job.description}</td>
                      <td>{job.brand}</td>
                      <td>{job.subBrand}</td>
                      <td>{job.flavour}</td>
                      <td>{job.packType}</td>
                      <td>{job.packSize}</td>
                      <td>{job.packCode}</td>
                      <td>
                        <span
                          className={`badge ${job.priority === "high"
                              ? "bg-danger"
                              : job.priority === "medium"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                        >
                          {job.priority}
                        </span>
                      </td>
                      {/* <td>
                        {job.dueDate
                          ? formatDDMMYYYY(job.dueDate)
                          : "-"}
                      </td> */}
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
    </div>
  );
};

export default AssignedJobs;
