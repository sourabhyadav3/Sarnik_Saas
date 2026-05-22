import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import axiosInstance from "../../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";

/**
 * ProjectLists Component
 * Displays a list of projects with options to view, edit, and delete
 * Includes search functionality and status filtering tabs
 * Uses API calls for filtering instead of client-side filtering
 */
const ProjectLists = () => {

//user role from local storage
const userRole = localStorage.getItem("role");
console.log("User Role:", userRole);




  const navigate = useNavigate();
  
  // State management
  const [projects, setProjects] = useState([]); // Store fetched projects
  const [filteredProjects, setFilteredProjects] = useState([]); // Store filtered projects for search
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [activeTab, setActiveTab] = useState("Active"); // Currently active status tab
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal visibility
  const [projectToDelete, setProjectToDelete] = useState(null); // Project to be deleted
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [isFilterLoading, setIsFilterLoading] = useState(false); // Loading state for filter operations

  // Fetch projects from API on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch projects based on active tab (status)
  useEffect(() => {
    fetchProjectsByStatus(activeTab);
  }, [activeTab]);

  // Filter projects based on search term
  useEffect(() => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toString().includes(searchTerm)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  /**
   * Fetches all projects from the API
   * Used when component first loads
   */
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/projects");
      
      if (response.data.success) {
        // Format dates for display
        const formattedProjects = response.data.data.map((project) => ({
          ...project,
          start_date: formatDDMMYYYY(project.start_date),
          expected_completion_date: formatDDMMYYYY(project.expected_completion_date),
        }));
        
        setProjects(formattedProjects);
        setFilteredProjects(formattedProjects);
        toast.success("Projects loaded successfully!", { autoClose: 2000 });
      } else {
        toast.error("Failed to load projects: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches projects filtered by status from the API
   * @param {string} status - The status to filter by
   */
  const fetchProjectsByStatus = async (status) => {
    setIsFilterLoading(true);
    try {
      // Handle "All" case by fetching all projects
      if (status === "All") {
        const response = await axiosInstance.get("/projects");
        
        if (response.data.success) {
          // Format dates for display
          const formattedProjects = response.data.data.map((project) => ({
            ...project,
            start_date: formatDDMMYYYY(project.start_date),
            expected_completion_date: formatDDMMYYYY(project.expected_completion_date),
          }));
          
          setProjects(formattedProjects);
          setFilteredProjects(formattedProjects);
        } else {
          toast.error("Failed to load projects: " + (response.data.message || "Unknown error"));
        }
      } else {
        // Fetch projects by specific status
        const response = await axiosInstance.get(`/projects/status/${status}`);
        
        if (response.data.success) {
          // Format dates for display
          const formattedProjects = response.data.data.map((project) => ({
            ...project,
            start_date: formatDDMMYYYY(project.start_date),
            expected_completion_date: formatDDMMYYYY(project.expected_completion_date),
          }));
          
          setProjects(formattedProjects);
          setFilteredProjects(formattedProjects);
        } else {
          toast.error("Failed to filter projects: " + (response.data.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error filtering projects:", error);
      toast.error("Failed to filter projects. Please check your connection and try again.");
    } finally {
      setIsFilterLoading(false);
    }
  };

  /**
   * Handles project deletion
   * Makes API call to delete project and updates state
   */
  const handleDelete = async () => {
    if (!projectToDelete) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/projects/${projectToDelete.id}`);
      
      if (response.data.success) {
        // Remove deleted project from state
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== projectToDelete.id)
        );
        
        setFilteredProjects(prevProjects => 
          prevProjects.filter(project => project.id !== projectToDelete.id)
        );
        
        toast.success(`Project "${projectToDelete.project_name}" deleted successfully!`);
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } else {
        toast.error("Failed to delete project: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Opens delete confirmation modal
   * @param {Object} project - Project object to be deleted
   */
  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  /**
   * Closes delete confirmation modal without deleting
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  /**
   * Navigates to edit page for the selected project
   * @param {string|number} projectId - ID of the project to edit
   */
  const handleEdit = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

  /**
   * Handles tab click for status filtering
   * @param {string} tabName - Name of the clicked tab
   */
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    // The useEffect will handle fetching projects based on the new active tab
  };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Main Card Container */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          {/* Header Section */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4">
            <h4 className="fw-bold mb-3 mb-sm-0">Project List</h4>
            <button
              className="btn btn-primary px-4 w-md-auto"
              onClick={() => navigate("/projects/add")}
              disabled={isLoading || isFilterLoading}
            >
              + Add Project
            </button>
          </div>

          {/* Search Bar */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-12">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search projects by name, client, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status Filter Tabs - Responsive with wrapping */}
          <div className="mb-4 border-bottom pb-2">
            <div className="d-flex flex-wrap gap-2 gap-md-4">
              {["Active", "In Progress", "Completed", "Closed", "Cancelled", "On Hold", "All"].map((tab) => (
                <span
                  key={tab}
                  className={`fw-medium cursor-pointer transition-all ${
                    activeTab === tab 
                      ? "text-primary border-bottom border-2 pb-2" 
                      : "text-muted hover-text-primary"
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          {/* Projects Table */}
          <div className="table-responsive">
            {isLoading || isFilterLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">
                  {isLoading ? "Loading projects..." : "Filtering projects..."}
                </p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No projects found</p>
              </div>
            ) : (
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:"nowrap"}}>Project No</th>
                    <th>Project Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Client</th>
                    <th className="d-none d-lg-table-cell">Project Requirements</th>
                    <th className="d-none d-md-table-cell">Priority</th>
                    <th>Status</th>
                    {userRole === 'admin' && (
                    <th className="text-center">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      {/* Project ID - Clickable to view details */}
                      <td
                        className="fw-semibold text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        {project.project_no}
                      </td>
                      
                      <td>{project.project_name}</td>
                      <td style={{whiteSpace:"nowrap"}}>{project.start_date}</td>
                      <td style={{whiteSpace:"nowrap"}}>{project.expected_completion_date}</td>
                      <td>{project.client_name}</td>
                      
                      {/* Project Requirements - Truncate if too long */}
                      <td className="d-none d-lg-table-cell">
                        <span title={project.project_requirements.join(", ")}>
                          {project.project_requirements.slice(0, 2).join(", ")}
                          {project.project_requirements.length > 2 && "..."}
                        </span>
                      </td>
                      
                      {/* Priority Badge */}
                      <td className="d-none d-md-table-cell">
                        <span className={`badge ${
                          project.priority === 'High' ? 'bg-danger' : 
                          project.priority === 'Medium' ? 'bg-warning text-dark' : 
                          'bg-success'
                        }`}>
                          {project.priority}
                        </span>
                      </td>
                      
                      {/* Status Badge */}
                      <td>
                        <span className={`badge ${
                          project.status === 'Active' ? 'bg-primary' :
                          project.status === 'Completed' ? 'bg-success' :
                          project.status === 'Cancelled' ? 'bg-danger' :
                          project.status === 'On Hold' ? 'bg-warning text-dark' :
                          'bg-secondary'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      
                      {/* Action Buttons */}
                      {userRole === 'admin' && (
                               <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(project.id)}
                            title="Edit Project"
                            disabled={isLoading || isFilterLoading}
                          >
                            <FaEdit />
                          </button>
                          {/* <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => confirmDelete(project)}
                            title="Delete Project"
                            disabled={isLoading || isFilterLoading}
                          >
                            <FaTrash />
                          </button> */}
                        </div>
                      </td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 text-muted small">
            <span className="mb-2 mb-sm-0">
              Showing {filteredProjects.length} of {projects.length} entries
              {searchTerm && ` (filtered from ${projects.length} total entries)`}
            </span>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-light" disabled>«</button>
              <button className="btn btn-sm btn-success">1</button>
              <button className="btn btn-sm btn-light" disabled>»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal show" 
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} 
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelDelete}
                  disabled={isLoading || isFilterLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this project?</p>
                <div className="alert alert-warning">
                  <strong>Project:</strong> {projectToDelete?.project_name}<br/>
                  
                </div>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                  disabled={isLoading || isFilterLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading || isFilterLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Project"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLists;