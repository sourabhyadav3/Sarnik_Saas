import React, { useEffect, useState } from "react";
import {
  FaListUl,
  FaCheckCircle,
  FaClock,
  FaTrophy,
  FaCalendarAlt,
  FaBriefcase,
  FaChartBar,
} from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";

const DesignerDashboard = () => {
  // User ID from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : null;

  // ----------------------------------
  // STATE: Dashboard API Data
  // ----------------------------------
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // FETCH DESIGNER DASHBOARD DATA
  // ----------------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(
          `/dashboards/employee/${userId}` // employee / designer id
        );

        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching designer dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  // ----------------------------------
  // LOADING STATE
  // ----------------------------------
  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  // ----------------------------------
  // DESTRUCTURE API RESPONSE
  // ----------------------------------
  const {
    topCards,
    weeklyPerformance,
    employeeWorkload,
  } = dashboardData || {};

  return (
    <div className="container-fluid py-4 min-vh-100">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold">Designer Dashboard</h3>
        <p className="text-muted mb-0">
          Overview of projects, jobs and activities
        </p>
      </div>

      {/* ================= TOP STATS ================= */}
      <div className="row g-4 mb-4">
        {[
          {
            icon: <FaListUl />,
            value: topCards?.inProgress,
            label: "In Progress",
          },
          {
            icon: <FaCheckCircle />,
            value: topCards?.completed,
            label: "Completed Jobs",
          },
          {
            icon: <FaBriefcase />,
            value: employeeWorkload?.totalJobsAssigned,
            label: "Total Jobs Assigned",
          },
        ].map((item, i) => (
          <div key={i} className="col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 18 }}>
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48 }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="fw-bold mb-0">{item.value}</h4>
                  <small className="text-muted">{item.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="row g-4">

        {/* -------- WEEKLY PERFORMANCE -------- */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 18 }}>
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                <FaTrophy className="me-2 text-muted" />
                Weekly Performance
              </h5>

              <div className="row g-3">
                {[
                  {
                    value: weeklyPerformance?.jobsCompleted,
                    label: "Jobs Completed",
                  },
                  {
                    value: weeklyPerformance?.jobsCreated,
                    label: "Jobs Created",
                  },
                  {
                    value: weeklyPerformance?.overdueJobs,
                    label: "Overdue Jobs",
                  },
                  {
                    value: topCards?.active,
                    label: "Active Jobs",
                  },
                ].map((item, i) => (
                  <div key={i} className="col-md-6">
                    <div className="bg-light rounded p-3" style={{ borderRadius: 14 }}>
                      <h5 className="fw-bold mb-1">{item.value}</h5>
                      <small className="text-muted">{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* -------- ADDITIONAL STATS -------- */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 18 }}>
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                <FaChartBar className="me-2 text-muted" />
                Job Statistics
              </h5>

              <div className="row g-3 mb-4">
                {[
                  {
                    value: topCards?.pendingAssignment,
                    label: "Pending Assignment",
                  },
                  {
                    value: employeeWorkload?.totalJobsAssigned,
                    label: "Total Jobs Assigned",
                  },
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div className="bg-light rounded p-3" style={{ borderRadius: 14 }}>
                      <h5 className="fw-bold mb-1">{item.value}</h5>
                      <small className="text-muted">{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* -------- STATUS BREAKDOWN -------- */}
              <div>
                <div className="d-flex justify-content-between mb-3">
                  <small className="fw-semibold">Status Breakdown</small>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">● Active Jobs</span>
                  <span className="fw-bold">{topCards?.active || 0}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">● In Progress</span>
                  <span className="fw-bold">{topCards?.inProgress || 0}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">● Completed</span>
                  <span className="fw-bold">{topCards?.completed || 0}</span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">● Pending Assignment</span>
                  <span className="fw-bold">{topCards?.pendingAssignment || 0}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DesignerDashboard;