import React, { useState } from "react";

const ProjectList = () => {
  const [activeTab, setActiveTab] = useState("Active Project");

  // 🔹 Static Project Data
  const projects = [
    {
      projectNo: "0001",
      projectName: "Healthy Drink",
      startDate: "04/12/2025",
      endDate: "18/12/2025",
      client: "albert",
      requirements: "creativeDesign, POS",
      priority: "medium",
      status: "Active Project",
    },
  ];

  const tabs = [
    "Active Project",
    "In Progress",
    "Completed",
    "Closed",
    "Cancelled",
    "On Hold",
    "All",
  ];

  return (
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          {/* Header */}
          <h5 className="fw-semibold mb-3">Project List</h5>

          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search projects.."
            />
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-3 border-bottom">
            {tabs.map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${
                    activeTab === tab ? "active fw-semibold" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr className="small text-muted">
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
                {projects.map((project, index) => (
                  <tr key={index}>
                    <td>
                      <a href="#" className="text-primary text-decoration-none">
                        {project.projectNo}
                      </a>
                    </td>
                    <td>{project.projectName}</td>
                    <td>{project.startDate}</td>
                    <td>{project.endDate}</td>
                    <td>{project.client}</td>
                    <td>{project.requirements}</td>
                    <td className="text-capitalize">{project.priority}</td>
                    <td>
                      <span className="badge bg-primary">
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
            <span>Showing 1 to 1 of 1 entries</span>

            <div className="btn-group">
              <button className="btn btn-light btn-sm">&laquo;</button>
              <button className="btn btn-success btn-sm text-white">1</button>
              <button className="btn btn-light btn-sm">&raquo;</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectList;
