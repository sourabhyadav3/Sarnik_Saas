import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../api/axiosInstance";

const AssignJobModal = ({ projectId, showModal, closeModal, selectedJobs }) => {
  const [role, setRole] = useState(""); // To select between Designer/Production
  const [employees, setEmployees] = useState([]); // List of employees (Designers/Production)
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Selected employee
  const [taskDescription, setTaskDescription] = useState(""); // Task description
  const [timeBudget, setTimeBudget] = useState(""); // Time budget

  // Fetch employees based on selected role (Production or Designer)
  useEffect(() => {
    if (role === "production") {
      fetchEmployees("/production");
    } else if (role === "employee") {
      fetchEmployees("/employee");
    }
  }, [role]);

  const fetchEmployees = async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint);
      setEmployees(response.data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };


  const handleTimeBudgetChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // sirf numbers allow

    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 3) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    }

    setTimeBudget(value);
  };


  const handleRoleChange = (e) => {
    setRole(e.target.value); // Update role when changed
  };

  const handleAssignJob = async () => {
    if (!selectedEmployee || !taskDescription || !timeBudget) {
      toast.error("Please fill all the fields.");
      return;
    }

    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("production_id", selectedEmployee);
    formData.append("task_description", taskDescription);
    formData.append("time_budget", timeBudget);
    formData.append("job_ids", JSON.stringify(selectedJobs)); // Pass selected job IDs

    try {
      const response = await axiosInstance.post("/assignjobs", formData);
      if (response.data?.success) {
        toast.success(`Job(s) assigned successfully!`);
        closeModal();
      } else {
        toast.error(response.data?.message || "Failed to assign job(s).");
      }
    } catch (error) {
      toast.error("Error assigning job(s). Please try again.");
    }
  };

  return (
    showModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Black backdrop with transparency
          zIndex: 1040, // Behind the modal
        }}
      >
        <div
          className="modal fade show d-block"
          style={{ zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Job</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Designer/Production</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={handleRoleChange}
                  >
                    <option value="">-- Select --</option>
                    <option value="employee">Designer</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                {role && (
                  <div className="mb-3">
                    <label className="form-label">Select Employee</label>
                    <select
                      className="form-select"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      <option value="">-- Select {role} --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Task Description</label>
                  <textarea
                    className="form-control"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter assignment details..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Time Budget</label>
                  <input
                    type="text"
                    className="form-control"
                    value={timeBudget}
                    onChange={handleTimeBudgetChange}
                    placeholder="HH:MM"
                    maxLength={5}
                  />

                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignJob}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AssignJobModal;
