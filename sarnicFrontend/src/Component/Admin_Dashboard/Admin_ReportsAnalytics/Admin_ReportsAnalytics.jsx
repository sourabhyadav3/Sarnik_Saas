import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { FaFilePdf } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { formatCurrencyAmount } from "../../../Common/Currency/currencyHelper";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // FETCH REPORT DATA
  // ============================
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/Reports");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        Loading reports...
      </div>
    );
  }

  // ============================
  // CHART DATA
  // ============================
  const jobStatusChart = {
    labels: ["Active Jobs", "Completed Jobs"],
    datasets: [
      {
        data: [
          data.topCards.activeJobs,
          data.topCards.completedJobs,
        ],
        backgroundColor: ["#0d6efd", "#28a745"],
      },
    ],
  };

  const weeklyJobChart = {
    labels: [
      "Created",
      "Completed",
      "Due",
      "Overdue",
    ],
    datasets: [
      {
        label: "Jobs This Week",
        data: [
          data.jobAnalytics.createdThisWeek,
          data.jobAnalytics.completedThisWeek,
          data.jobAnalytics.dueThisWeek,
          data.jobAnalytics.overdueJobs,
        ],
        backgroundColor: "#6f42c1",
      },
    ],
  };

  // Helper function to format currency amounts with multiple currencies
  const formatMultiCurrency = (currencyArray) => {
    if (!currencyArray || currencyArray.length === 0) return "N/A";
    
    return currencyArray.map(item => {
      const currency = item.currency || "AED"; // Default to AED if currency is null
      const amount = typeof item.amount === 'string' ? item.amount : item.amount.toFixed(2);
      return `${currency} ${formatCurrencyAmount(amount)}`;
    }).join(", ");
  };

  return (
    <div className="p-4 m-2 rounded shadow-sm">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Reports & Analytics</h4>

        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
          <FaFilePdf />
          Export PDF
        </button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Total Projects</small>
              <h4 className="fw-bold">{data.topCards.totalProjects}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Total Jobs</small>
              <h4 className="fw-bold">{data.topCards.totalJobs}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Active Jobs</small>
              <h4 className="fw-bold text-primary">
                {data.topCards.activeJobs}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <small className="text-muted">Completed Jobs</small>
              <h4 className="fw-bold text-success">
                {data.topCards.completedJobs}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Job Status</h6>
              <Doughnut data={jobStatusChart} />
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">
                Weekly Job Analytics
              </h6>
              <Bar data={weeklyJobChart} />
            </div>
          </div>
        </div>
      </div>

      {/* FINANCE & PRODUCTIVITY */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Financial Summary</h6>
              <p className="mb-1">
                Invoice This Month: <strong>{formatMultiCurrency(data.finance.invoiceThisMonthByCurrency)}</strong>
              </p>
              <p className="mb-0">
                PO Amount: <strong>{formatMultiCurrency(data.finance.poThisMonthByCurrency)}</strong>
              </p>
              <p className="mb-1 mt-2">
                Paid Amount: <strong>{formatCurrencyAmount(data.finance.paidAmount)}</strong>
              </p>
              <p className="mb-0">
                Unpaid Amount: <strong>{formatCurrencyAmount(data.finance.unpaidAmount)}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Productivity</h6>
              <p className="mb-1">
                Total Logged Works: <strong>{data.productivity.totalHours}</strong>
              </p>
              <p className="mb-0">
                Weekly Hours Work: <strong>{data.productivity.weeklyHours}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportsAnalytics;