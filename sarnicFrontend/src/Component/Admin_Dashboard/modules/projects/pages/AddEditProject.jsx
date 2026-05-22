import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

import axiosInstance from "../../../../../api/axiosInstance";
import { formatCurrencyAmount } from "../../../../../Common/Currency/currencyHelper";
import { formatDDMMYYYY, convertToISOFormat } from "../../../../../Common/DateFormate/dateFormat";


/**
 * AddEditProject Component
 * Handles both creating new projects and editing existing ones
 * Uses the same form for both operations with different API endpoints
 */
export default function AddEditProject() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL for edit mode

  // Determine if we're in edit mode
  const isEditMode = Boolean(id);

  // Refs for date picker inputs
  const startDateInputRef = useRef(null);
  const completionDateInputRef = useRef(null);

  // State management
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({}); // Form validation errors
  const today = new Date();
today.setHours(0, 0, 0, 0); // time issue avoid करने के लिए


  // Form data state
  const [formData, setFormData] = useState({
    project_name: "",
    client_name: "",
    start_date: "",
    expected_completion_date: "",
    priority: "",
    status: "",
    project_description: "",
    project_requirements: [],
    budget: "",
    currency: "",
  });

  // Available project requirements
  const availableRequirements = [
    "Creative Design",
    "POS",
    "Artwork Adaptation",
    "Mockups",
    "Prepress",
    "Rendering",
  ];

  /**
   * Fetches clients/suppliers from API
   * Filters for clients and suppliers only
   */
  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/clientsuppliers");

      if (response.data.success) {
        const clientNames = response.data.data
          .filter((client) => client.type === "client" || client.type === "supplier")
          .map((client) => ({ id: client.id, name: client.name }));

        setClients(clientNames);
      } else {
        toast.error("Failed to load clients: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients. Please check your connection.");
    }
  };

  /**
   * Fetches project data for edit mode
   * Populates form with existing project details
   */
  const fetchProjectData = async () => {
    if (!isEditMode) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}`);

      if (response.data.success) {
        const project = response.data.data;

        // Format dates for display
        const formattedData = {
          project_name: project.project_name || "",
          client_name: project.client_name || "",
          start_date: project.start_date ? formatDDMMYYYY(project.start_date) : "",
          expected_completion_date: project.expected_completion_date ? formatDDMMYYYY(project.expected_completion_date) : "",
          priority: project.priority || "",
          status: project.status || "",
          project_description: project.project_description || "",
          project_requirements: project.project_requirements || [],
          budget: project.budget || "",
          currency: project.currency || "",
        };

        setFormData(formattedData);
        toast.info("Project loaded successfully", { autoClose: 2000 });
      } else {
        toast.error("Failed to load project: " + (response.data.message || "Unknown error"));
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project data. Redirecting to project list...");
      setTimeout(() => navigate("/projects"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchClients();
    fetchProjectData();
  }, [id]);

  /**
   * Validates form data before submission
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }

    if (!formData.client_name) {
      newErrors.client_name = "Please select a client";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.expected_completion_date) {
      newErrors.expected_completion_date = "Expected completion date is required";
    }

    if (formData.start_date && formData.expected_completion_date) {
      const start = new Date(convertToISOFormat(formData.start_date));
      const end = new Date(convertToISOFormat(formData.expected_completion_date));

      if (end < start) {
        newErrors.expected_completion_date = "End date must be after start date";
      }
    }

    if (!formData.priority) {
      newErrors.priority = "Please select a priority";
    }

    if (!formData.status) {
      newErrors.status = "Please select a status";
    }

    if (!formData.currency) {
      newErrors.currency = "Please select a currency";
    }

    if (formData.project_requirements.length === 0) {
      newErrors.project_requirements = "Please select at least one requirement";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return false;
    }

    return true;
  };

  /**
   * Handles form input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles budget input with currency formatting
   * @param {Event} e - Input change event
   */
  const handleBudgetChange = (e) => {
  const rawValue = e.target.value.replace(/[^0-9.]/g, "");

  setFormData((prev) => ({
    ...prev,
    budget: rawValue,
  }));
};


const handleBudgetBlur = () => {
  if (!formData.currency || !formData.budget) return;

  const formatted = formatCurrencyAmount(
    formData.budget,
    formData.currency
  );

  setFormData((prev) => ({
    ...prev,
    budget: formatted,
  }));
};



  /**
   * Handles date selection from date picker
   * @param {Date} date - Selected date
   * @param {string} fieldName - Field name to update
   */
  const handleDateChange = (date, fieldName) => {
    if (date) {
      const formattedDate = formatDDMMYYYY(date);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: formattedDate,
      }));

      // Clear error for this field
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: "" }));
      }
    }
  };

  /**
   * Handles checkbox changes for project requirements
   * @param {Event} e - Checkbox change event
   */
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => {
      let updatedRequirements = [...prev.project_requirements];

      if (checked) {
        updatedRequirements.push(name);
      } else {
        updatedRequirements = updatedRequirements.filter((item) => item !== name);
      }

      return { ...prev, project_requirements: updatedRequirements };
    });

    // Clear error for requirements if at least one is selected
    if (errors.project_requirements && formData.project_requirements.length > 0) {
      setErrors(prev => ({ ...prev, project_requirements: "" }));
    }
  };

  /**
   * Handles form submission
   * Validates form and makes API call to create/update project
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Prepare payload for API
      const payload = {
        project_name: formData.project_name.trim(),
        client_name: formData.client_name,
        priority: formData.priority,
        status: formData.status,
        project_description: formData.project_description.trim(),
        project_requirements: formData.project_requirements,
        budget: formData.budget,
        currency: formData.currency,
        start_date: convertToISOFormat(formData.start_date),
        expected_completion_date: convertToISOFormat(formData.expected_completion_date),
      };

      console.log("Submitting payload:", payload);

      let response;

      if (isEditMode) {
        // Update existing project
        response = await axiosInstance.put(`/projects/${id}`, payload);

        if (response.data.success) {
          toast.success(`Project "${formData.project_name}" updated successfully!`);
        } else {
          throw new Error(response.data.message || "Failed to update project");
        }
      } else {
        // Create new project
        response = await axiosInstance.post("/projects", payload);

        if (response.data.success) {
          toast.success(`Project "${formData.project_name}" created successfully!`);
        } else {
          throw new Error(response.data.message || "Failed to create project");
        }
      }

      // Redirect to project list after successful operation
      setTimeout(() => navigate("/projects"), 1500);

    } catch (error) {
      console.error("Error saving project:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} project: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="container-fluid py-4 min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading project data...</p>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">
              {isEditMode ? "Edit Project" : "Create New Project"}
            </h4>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/projects")}
              disabled={isSaving}
            >
              Back to Projects
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="row g-4">
              {/* Project Name */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Project Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.project_name ? 'is-invalid' : ''}`}
                  placeholder="Enter project name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  disabled={isSaving}
                />
                {errors.project_name && (
                  <div className="invalid-feedback">{errors.project_name}</div>
                )}
              </div>

              {/* Client Name */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Client Name <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.client_name ? 'is-invalid' : ''}`}
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.client_name && (
                  <div className="invalid-feedback">{errors.client_name}</div>
                )}
              </div>

              {/* Start Date */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Start Date <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                <DatePicker
  selected={
    formData.start_date
      ? new Date(formData.start_date.split("-").reverse().join("-"))
      : null
  }
  onChange={(date) => handleDateChange(date, "start_date")}
  dateFormat="dd-MM-yyyy"
  minDate={today}   // 🔥 PAST DATE DISABLED
  className={`form-control ${errors.start_date ? "is-invalid" : ""}`}
  placeholderText="DD-MM-YYYY"
  open={showStartDatePicker}
  onClickOutside={() => setShowStartDatePicker(false)}
  disabled={isSaving}
/>

                  <span
                    className="input-group-text bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => !isSaving && setShowStartDatePicker(!showStartDatePicker)}
                  >
                    <FaCalendarAlt />
                  </span>
                  {errors.start_date && (
                    <div className="invalid-feedback d-block">{errors.start_date}</div>
                  )}
                </div>
              </div>

              {/* Expected Completion Date */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Expected Completion Date <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                 <DatePicker
  selected={
    formData.expected_completion_date
      ? new Date(
          formData.expected_completion_date
            .split("-")
            .reverse()
            .join("-")
        )
      : null
  }
  onChange={(date) =>
    handleDateChange(date, "expected_completion_date")
  }
  dateFormat="dd-MM-yyyy"
  minDate={
    formData.start_date
      ? new Date(formData.start_date.split("-").reverse().join("-"))
      : today
  }   // 🔥 past + start date se pehle disabled
  className={`form-control ${
    errors.expected_completion_date ? "is-invalid" : ""
  }`}
  placeholderText="DD-MM-YYYY"
  open={showEndDatePicker}
  onClickOutside={() => setShowEndDatePicker(false)}
  disabled={isSaving}
/>

                  <span
                    className="input-group-text bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => !isSaving && setShowEndDatePicker(!showEndDatePicker)}
                  >
                    <FaCalendarAlt />
                  </span>
                  {errors.expected_completion_date && (
                    <div className="invalid-feedback d-block">{errors.expected_completion_date}</div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Project Priority <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.priority && (
                  <div className="invalid-feedback">{errors.priority}</div>
                )}
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Project Status <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="On Hold">On Hold</option>
                </select>
                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
              </div>

              {/* Project Description */}
              <div className="col-md-12">
                <label className="form-label fw-medium">Project Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter project description (optional)"
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleChange}
                  disabled={isSaving}
                ></textarea>
              </div>

              {/* Project Requirements */}
              <div className="col-md-12">
                <label className="form-label fw-medium mb-2">
                  Project Requirements <span className="text-danger">*</span>
                </label>
                {errors.project_requirements && (
                  <div className="text-danger small mb-2">{errors.project_requirements}</div>
                )}
                <div className="row g-2">
                  {availableRequirements.map((req) => (
                    <div className="col-md-4" key={req}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name={req}
                          id={req}
                          checked={formData.project_requirements.includes(req)}
                          onChange={handleCheckboxChange}
                          disabled={isSaving}
                        />
                        <label className="form-check-label" htmlFor={req}>
                          {req}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Currency <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.currency ? 'is-invalid' : ''}`}
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Select Currency</option>
                  <option value="AED">AED - Dirhams</option>
                  <option value="EUR">EUR - Euros</option>
                  <option value="GBP">GBP - British Pounds</option>
                  <option value="INR">INR - Indian Rupees</option>
                  <option value="SAR">SAR - Saudi Riyals</option>
                  <option value="USD">USD - US Dollars</option>

                </select>
                {errors.currency && (
                  <div className="invalid-feedback">{errors.currency}</div>
                )}
              </div>

              {/* Budget */}
              <div className="col-md-6">
                <label className="form-label fw-medium">Budget Amount</label>
             <input
  type="text"
  className="form-control"
  placeholder={
    formData.currency
      ? "Enter budget amount"
      : "Select currency first"
  }
  name="budget"
  value={formData.budget}
  onChange={handleBudgetChange}
  onBlur={handleBudgetBlur}
  disabled={!formData.currency || isSaving}
/>

                {formData.currency && (
                  <small className="text-muted">
                    Format: {formData.currency === 'INR' ? '₹' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : formData.currency} 0.00
                  </small>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/projects")}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isEditMode ? "Save..." : "Save..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "Save" : "Save"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}