import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../api/axiosInstance";


const AssignJobModal = ({ showModal, closeModal, selectedJobs, onAssignmentSuccess }) => {
  const [role, setRole] = useState("employee"); // Default to Designer (employee)
  const [employees, setEmployees] = useState([]); // List of employees
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Selected employee
  const [taskDescription, setTaskDescription] = useState(""); // Task description
  const [timeBudget, setTimeBudget] = useState(""); // Time budget
  const [loading, setLoading] = useState(false);

  // Fetch employees based on selected role
  useEffect(() => {
    // if (role === "production") {
    //   fetchEmployees("/production");
    // } else 
    if (role === "employee") {
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

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedEmployee(""); // Reset selected employee when role changes
  };

  const handleAssignJob = async () => {
    if (!selectedEmployee ) {
      toast.error("Please fill all the fields.");
      return;
    }

    setLoading(true);
    
    try {
      // Create the payload as required
      const payload = {
        assign_job_ids: selectedJobs, // Array of assign_job IDs
        employee_id: selectedEmployee,
      };

      const response = await axiosInstance.put("/assignjobs/production-assign", payload);
      
      if (response.data?.success) {
        toast.success(`Job(s) assigned successfully!`);
        if (onAssignmentSuccess) {
          onAssignmentSuccess();
        }
      } else {
        toast.error(response.data?.message || "Failed to assign job(s).");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error assigning job(s). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    showModal && (
      <>
        {/* BACKDROP */}
        <div className="modal-backdrop fade show"></div>
        
        {/* MODAL */}
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Job</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                {/* <div className="mb-3">
                  <label className="form-label">Select Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={handleRoleChange}
                    disabled={loading}
                  >
                    <option value="employee">Designer</option>
                    {/* <option value="production">Production</option> */}
                  {/* </select>
                </div> */}

                <div className="mb-3">
                  <label className="form-label">Select Employee</label>
                  <select
                    className="form-select"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    disabled={loading || employees.length === 0}
                  >
                    <option value="">-- Select {role === "employee" ? "Designer" : "Production"} --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

             
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignJob}
                  disabled={loading}
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default AssignJobModal;