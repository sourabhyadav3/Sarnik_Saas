import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaProjectDiagram,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaBell,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import { formatCurrencyAmount } from "../../../Common/Currency/currencyHelper";
import { formatDDMMYYYY } from "../../../Common/DateFormate/dateFormat";
import { getStatusColor } from "../../../Common/Statusbadge/StatusBadge";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // FETCH DASHBOARD DATA
  // ================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admindashboard");

      if (res.data?.success) {
        setDashboardData(res.data.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // STATS CARDS
  // ================================
  const stats = dashboardData
    ? [
      {
        title: "Projects in Progress",
        value: dashboardData.cards.projectsInProgress,
        icon: <FaProjectDiagram />,
        color: "success",
        link: "/projects",
      },
      {
        title: "Jobs in Progress",
        value: dashboardData.cards.jobsInProgress,
        icon: <FaTasks />,
        color: "success",
        link: "/admin/JobTracker",
      },
      {
        title: "Jobs Due Today",
        value: dashboardData.cards.jobsDueToday,
        icon: <FaClipboardList />,
        color: "warning",
        link: "/admin/JobTracker",
      },
      {
        title: "Cost Estimates",
        value: dashboardData.cards.costEstimates,
        subtitle: "Waiting to receive POs",
        icon: <FaFileInvoiceDollar />,
        color: "primary",
        link: "/admin/CostEstimates",
      },
      {
        title: "Receivable Purchase Order",
        value: dashboardData.cards.receivablePO,
        subtitle: "Waiting for Invoicing",
        icon: <FaFileInvoiceDollar />,
        color: "info",
        link: "/admin/receivable",
      },
      {
        title: "Completed Projects",
        value: dashboardData.cards.completedProjects,
        subtitle: "Invoiced",
        icon: <FaFileInvoiceDollar />,
        color: "danger",
        link: "/admin/Invoicing",
      },
    ]
    : [];

  // ================================
  // CHART DATA
  // ================================
  const chartData = dashboardData?.projectStatus
    ? dashboardData.projectStatus.map((item) => ({
      name: item.status,
      value: item.count,
    }))
    : [];

  return (
    <div className="container-fluid py-4 min-vh-100">
      {/* PAGE TITLE */}
      <div className="mb-4">
        <h3 className="fw-bold">Admin Dashboard</h3>
        <p className="text-muted mb-0">
          Overview of projects, jobs and activities
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-4">
        {loading ? (
          <div className="text-center py-5">Loading dashboard...</div>
        ) : (
          stats.map((item, i) => (
            <div key={i} className="col-xl-4 col-md-6">
              <div
                className="card shadow-sm border-0 h-100 rounded-4"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(item.link)}
              >
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className={`rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} d-flex align-items-center justify-content-center`}
                    style={{ width: 48, height: 48 }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h4 className="mb-0 fw-bold">{item.value}</h4>
                    <small className="text-muted">{item.title}</small>
                    {item.subtitle && (
                      <div className="small text-muted">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOWER SECTION */}
      <div className="row g-4">
        {/* PROJECT STATUS CHART */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100 rounded-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">
                Project Status Overview
              </h5>

              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
            <BarChart
  data={chartData}
  barCategoryGap="15%"
>
  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />

  <Bar
    dataKey="value"
    barSize={42}
    radius={[8, 8, 0, 0]}
  >
    {chartData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={getStatusColor(entry.name)}
      />
    ))}
  </Bar>
</BarChart>

                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100 rounded-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-4">
                Recent Activity
              </h5>

              {dashboardData?.recentActivity?.length === 0 ? (
                <p className="text-muted small">
                  No recent activity found
                </p>
              ) : (
                dashboardData?.recentActivity?.map((item, index) => (
                  <div key={index} className="d-flex gap-3 mb-4">
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary"
                      style={{ width: 44, height: 44 }}
                    >
                      <FaBell />
                    </div>

                    <div>
                      <strong>{item.project_name}</strong>
                      <p className="mb-1 small text-muted">
                        Client: {item.client_name}
                        <br />
                        Budget:{" "}
                        <strong>
                          {item.currency}{" "}
                          {formatCurrencyAmount(
                            item.budget,
                            item.currency
                          )}
                        </strong>
                      </p>
                      <small className="text-muted">
                        {formatDDMMYYYY(item.created_at)}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
