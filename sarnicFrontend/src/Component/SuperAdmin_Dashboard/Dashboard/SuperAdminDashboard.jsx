import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaCreditCard,
  FaDollarSign,
  FaChartLine,
  FaFolderMinus
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  fetchSuperAdminDashboard,
  fetchSuperAdminRevenue,
  fetchSuperAdminAnalytics
} from "../../../api/superadminApi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dStats, dRev, dAn] = await Promise.all([
        fetchSuperAdminDashboard(),
        fetchSuperAdminRevenue(),
        fetchSuperAdminAnalytics()
      ]);
      setStats(dStats);
      setRevenue(dRev);
      setAnalytics(dAn);
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = stats && revenue
    ? [
        {
          title: "Total Revenue",
          value: `$${parseFloat(revenue.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          icon: <FaDollarSign />,
          color: "primary",
          link: "/superadmin/subscriptions",
        },
        {
          title: "Monthly Revenue",
          value: `$${parseFloat(revenue.monthlyRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          icon: <FaChartLine />,
          color: "success",
          link: "/superadmin/subscriptions",
        },
        {
          title: "Active Subscriptions",
          value: revenue.activeSubscriptions || 0,
          icon: <FaCreditCard />,
          color: "info",
          link: "/superadmin/subscriptions",
        },
        {
          title: "Expired Subscriptions",
          value: revenue.expiredSubscriptions || 0,
          icon: <FaFolderMinus />,
          color: "danger",
          link: "/superadmin/subscriptions",
        },
        {
          title: "Total Companies",
          value: stats.totalCompanies || 0,
          icon: <FaBuilding />,
          color: "warning",
          link: "/superadmin/companies",
        },
        {
          title: "Active Users",
          value: stats.activeUsers || 0,
          icon: <FaUsers />,
          color: "secondary",
          link: "/superadmin/users",
        },
      ]
    : [];

  return (
    <div className="container-fluid py-4 min-vh-100 bg-light bg-opacity-50">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Super Admin Dashboard</h3>
        <p className="text-secondary mb-0">
          Real-time SaaS platform telemetry & metric diagnostics
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2 text-secondary">Analyzing platform telemetry...</div>
        </div>
      ) : (
        <>
          {/* Card Widgets */}
          <div className="row g-4 mb-5">
            {cards.map((item, i) => (
              <div key={i} className="col-xl-4 col-md-6">
                <div
                  className="card border-0 shadow-sm h-100 rounded-4"
                  style={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    background: "#ffffff"
                  }}
                  onClick={() => navigate(item.link)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="card-body d-flex align-items-center justify-content-between p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} d-flex align-items-center justify-content-center`}
                        style={{ width: 56, height: 56, fontSize: "1.3rem" }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="mb-1 fw-extrabold text-dark">{item.value}</h3>
                        <div className="text-secondary fw-semibold small">{item.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="row g-4">
            {/* Revenue Trend Chart */}
            <div className="col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: "#ffffff" }}>
                <h5 className="fw-bold mb-3 text-dark">Revenue Diagnostics (12-Month Trend)</h5>
                <p className="text-muted small mb-4">Cumulative monthly platform licensing fees received in USD</p>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart
                      data={revenue?.revenueTrend || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                      <XAxis dataKey="name" stroke="#6c757d" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#6c757d" tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0d6efd"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Plan Distribution Donut */}
            <div className="col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: "#ffffff" }}>
                <h5 className="fw-bold mb-3 text-dark">Licensing Tiers</h5>
                <p className="text-muted small mb-4">SaaS customer subscription plan ratio</p>
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: 320 }}>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={analytics?.planDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(analytics?.planDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                    {(analytics?.planDistribution || []).map((item, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <span
                          className="d-inline-block rounded-circle"
                          style={{ width: 10, height: 10, backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="small text-secondary fw-semibold">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Company & User Growth timeline */}
            <div className="col-12 mt-4">
              <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: "#ffffff" }}>
                <h5 className="fw-bold mb-3 text-dark">Platform Onboarding Velocity</h5>
                <p className="text-muted small mb-4">Monthly comparison of company and user registration velocity</p>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={analytics?.timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                      <XAxis dataKey="name" stroke="#6c757d" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#6c757d" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="companies" fill="#00c49f" name="Companies" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="users" fill="#ffbb28" name="Users Registered" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

