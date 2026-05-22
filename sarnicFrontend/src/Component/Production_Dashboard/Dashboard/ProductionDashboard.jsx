import React, { useEffect, useState } from "react";
import { FaTasks, FaCheckCircle, FaClock, FaUserTie, FaChartBar } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import axiosInstance from "../../../api/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductionDashboard = () => {
  // User ID from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(
          `/dashboards/production/${userId}`
        );

        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const { topCards, weeklyPerformance, employeeWorkload } = dashboardData || {};

  // Bar chart data for weekly performance with zigzag pattern
  const weeklyGraphData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Jobs Created',
        data: [3, 15, 5, 18, 4, 20, 6],
        backgroundColor: 'rgba(13, 110, 253, 0.8)',
        borderColor: 'rgb(13, 110, 253)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7
      },
      {
        label: 'Jobs Completed',
        data: [12, 4, 16, 6, 19, 3, 17],
        backgroundColor: 'rgba(25, 135, 84, 0.8)',
        borderColor: 'rgb(25, 135, 84)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7
      }
    ]
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold">Production Dashboard</h3>
        <p className="text-muted mb-0">Jobs overview</p>
      </div>

      {/* ================= TOP CARDS ================= */}
      <div className="row g-4 mb-4">
        {[
          {
            icon: <FaTasks />,
            value: topCards?.inProgress,
            label: "In Progress Jobs",
          },
          {
            icon: <FaCheckCircle />,
            value: topCards?.completed,
            label: "Completed Jobs",
          },
          {
            icon: <FaClock />,
            value: topCards?.pendingAssignment,
            label: "Pending Assignment",
          },
          {
            icon: <FaUserTie />,
            value: employeeWorkload?.totalJobsAssigned,
            label: "Total Jobs Assigned",
          },
        ].map((item, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="fs-4 text-secondary">{item.icon}</div>
                <div>
                  <h4 className="fw-bold mb-0">{item.value}</h4>
                  <small className="text-muted">{item.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= WEEKLY PERFORMANCE ================= */}
      <div className="row">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaChartBar className="text-primary me-2" />
                Weekly Performance
              </h5>

              {/* BAR CHART */}
              <div className="mb-4" style={{ height: '300px' }}>
                <Bar data={weeklyGraphData} options={graphOptions} />
              </div>

              {/* SUMMARY CARDS */}
              <div className="row g-3">
                {[
                  {
                    value: weeklyPerformance?.jobsCreated,
                    label: "Jobs Created",
                    color: "text-primary"
                  },
                  {
                    value: weeklyPerformance?.jobsCompleted,
                    label: "Jobs Completed",
                    color: "text-success"
                  },
                  {
                    value: weeklyPerformance?.overdueJobs,
                    label: "Overdue Jobs",
                    color: "text-danger"
                  },
                ].map((item, i) => (
                  <div key={i} className="col-md-4">
                    <div className="bg-light rounded p-3 text-center">
                      <h5 className={`fw-bold mb-1 ${item.color}`}>{item.value}</h5>
                      <small className="text-muted">{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductionDashboard;