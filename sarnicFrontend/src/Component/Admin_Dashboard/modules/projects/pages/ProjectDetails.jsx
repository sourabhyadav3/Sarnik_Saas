import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OverviewTab from "../tabs/OverviewTab";
import JobsTab from "../tabs/JobsTab";
import FinanceTab from "../tabs/FinanceTab";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import axiosInstance from "../../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";
import { useLocation } from "react-router-dom";



export default function ProjectDetails() {


  // user role from local storage
  const userRole = localStorage.getItem("role");
  console.log("User Role:", userRole);



  const { projectId } = useParams();
  const navigate = useNavigate();

  // Active tab state
  const location = useLocation();

  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "overview";
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL);


  // Project data state
  const [project, setProject] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setActiveTab(getTabFromURL());
  }, [location.search]);


  /* ---------------------------------------
     🔹 FETCH PROJECT BY ID
  ---------------------------------------- */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`/projects/${projectId}`);

        if (res.data.success) {
          setProject(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h4 className="fw-bold mb-1">
                {project?.project_name || "Project"}
              </h4>
              <p className="text-muted mb-0">
                Client: {project?.client_name || "-"}
              </p>
            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/projects")}
            >
              ← Back to Projects
            </button>
          </div>

          {/* TABS */}
          <div className="border-bottom mb-4">
            <ul className="nav nav-tabs border-0">
              {["overview", "jobs", ...(userRole === "admin" ? ["finance"] : [])].map(
                (tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link ${activeTab === tab
                          ? "active text-primary fw-semibold"
                          : "text-muted"
                        }`}
                      onClick={() => {
                        setActiveTab(tab);
                        navigate(`/projects/${projectId}?tab=${tab}`);
                      }}
                      type="button"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  </li>
                )
              )}

            </ul>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "overview" && <OverviewTab projectId={projectId} />}
          {activeTab === "jobs" && <JobsTab projectId={projectId} />}

          {activeTab === "finance" && userRole === "admin" && (
            <FinanceTab projectId={projectId} />
          )}


          {/* PROJECT DETAILS TABLE */}
          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Project Details</h6>

              {loading ? (
                <p className="text-muted">Loading project details...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Project No</th>
                        <th>Project Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Client</th>
                        <th>Project Requirements</th>
                        <th>Priority</th>
                        <th>Status</th>

                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>{project?.project_no}</td>
                        <td>{project?.project_name}</td>
                        <td>
                          {formatDDMMYYYY(project?.start_date)}
                        </td>
                        <td>
                          {formatDDMMYYYY(project?.expected_completion_date)}
                        </td>
                        <td>{project?.client_name}</td>
                        <td>
                          {project?.project_requirements.join(", ")}
                        </td>
                        <td className="text-capitalize">
                          {project?.priority}
                        </td>
                        <td>
                          <span className="badge bg-success">
                            {project?.status}
                          </span>
                        </td>

                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
