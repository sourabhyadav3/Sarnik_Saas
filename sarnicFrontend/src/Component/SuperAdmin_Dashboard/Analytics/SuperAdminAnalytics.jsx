import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { FaBuilding, FaUsers, FaPercentage } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchSuperAdminAnalytics, fetchSuperAdminRevenue } from "../../../api/superadminApi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [anData, revData] = await Promise.all([
        fetchSuperAdminAnalytics(),
        fetchSuperAdminRevenue()
      ]);
      setAnalytics(anData);
      setRevenue(revData);
    } catch (err) {
      toast.error("Failed to load platform analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center min-vh-100 bg-light bg-opacity-50">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3 text-secondary">Analyzing core SaaS analytics...</div>
      </div>
    );
  }

  const widgets = [
    {
      title: "Active SaaS Companies",
      value: analytics?.totalCompanies || 0,
      sub: "Active and suspended organizations",
      icon: <FaBuilding />,
      color: "primary"
    },
    {
      title: "Average Team Size",
      value: `${analytics?.avgTeamSize || 0} Members`,
      sub: "Employees, designers & directors",
      icon: <FaUsers />,
      color: "success"
    },
    {
      title: "Active User Rate",
      value: `${analytics?.activeUserRate || 0}%`,
      sub: "Monthly active session usage status",
      icon: <FaPercentage />,
      color: "info"
    }
  ];

  return (
    <div className="container-fluid py-4 min-vh-100 bg-light bg-opacity-50">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Platform Analytics</h3>
        <p className="text-secondary mb-0">Deep dive analytics showing user growth, plan counts, and company trends</p>
      </div>

      {/* Widgets Row */}
      <Row className="g-4 mb-4">
        {widgets.map((w, idx) => (
          <Col key={idx} xl={4} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
              <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`rounded-circle bg-${w.color} bg-opacity-10 text-${w.color} d-flex align-items-center justify-content-center`}
                    style={{ width: 56, height: 56, fontSize: "1.3rem" }}
                  >
                    {w.icon}
                  </div>
                  <div>
                    <h3 className="mb-1 fw-extrabold text-dark">{w.value}</h3>
                    <div className="text-secondary fw-semibold small">{w.title}</div>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>{w.sub}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Graphical Charts Section */}
      <Row className="g-4">
        {/* User Registration Growth over time */}
        <Col xl={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">User Growth Timeline</h5>
            <p className="text-muted small mb-4">Timeline mapping of total active platform users on-boarded monthly</p>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={analytics?.timeline || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffbb28" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ffbb28" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                  <XAxis dataKey="name" stroke="#6c757d" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6c757d" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#ffbb28"
                    strokeWidth={2.5}
                    name="Users"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Plan Type Distribution (Donut Chart) */}
        <Col xl={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold text-dark mb-3">Subscription Distribution</h5>
            <p className="text-muted small mb-4">Total ratio representation of SaaS tiers</p>
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
          </Card>
        </Col>

        {/* Monthly SaaS Revenue */}
        <Col xl={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Monthly SaaS Revenue Trend</h5>
            <p className="text-muted small mb-4">Monthly breakdown comparing revenue metrics in USD</p>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={revenue?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                  <XAxis dataKey="name" stroke="#6c757d" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6c757d" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#0d6efd" name="Licensing Fees" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Employee details per company */}
        <Col xl={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Company Team Allocations</h5>
            <p className="text-muted small mb-4">Horizontal ranking representing active employee size of accounts</p>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={analytics?.companyDetails || []}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9ecef" />
                  <XAxis type="number" stroke="#6c757d" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#6c757d" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="employees" fill="#00c49f" name="Active Members" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminAnalytics;
