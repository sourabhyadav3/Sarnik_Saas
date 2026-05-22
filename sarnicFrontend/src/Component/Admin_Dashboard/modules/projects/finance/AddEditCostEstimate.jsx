import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCalendarAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";

// Import helper functions and configured API instance
import axiosInstance from "../../../../../api/axiosInstance";
import { formatCurrencyAmount, parseCurrencyToNumber } from "../../../../../Common/Currency/currencyHelper";

export default function AddEditCostEstimate() {
  const location = useLocation();
  const prefillProjectId = location.state?.projectId;
  console.log("prefillProjectId:", prefillProjectId);

  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params
  const isEditMode = !!id; // Determine if we're in edit mode
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currencySelected, setCurrencySelected] = useState(false); // Track if currency is selected

  // State for date picker visibility
  const [showEstimateDatePicker, setShowEstimateDatePicker] = useState(false);
  const [showValidUntilDatePicker, setShowValidUntilDatePicker] = useState(false);

  // State for clients and projects data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // State for confirmation dialogs
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

  // Initial form state
  const [estimateData, setEstimateData] = useState({
    client_id: "",
    project_id: "",
    estimate_date: new Date(),
    valid_until: null,
    currency: "",
    ce_status: "Draft", // Using ce_status instead of status
    line_items: [{ description: "", quantity: "1", rate: "0.00" }],
    vat_rate: "5",
    notes: ""
  });

  // Initial data fetch
  useEffect(() => {
    fetchClients();
    fetchProjects();
    if (isEditMode) {
      fetchEstimateData(id);
    }
  }, [id, isEditMode]);

  // AUTO PREFILL logic when project id reciver from location state
  useEffect(() => {
    if (prefillProjectId && projects.length > 0) {
      const selectedProject = projects.find(
        (p) => p.id === Number(prefillProjectId)
      );

      if (selectedProject) {
        // Log outside object
        console.log("Clientid", selectedProject.client_id);

        setEstimateData((prev) => ({
          ...prev,
          project_id: selectedProject.id.toString(),
          client_id: selectedProject.client_id?.toString() || "",
          currency: selectedProject.currency || prev.currency,
        }));

        setCurrencySelected(!!selectedProject.currency);
      }
    }
  }, [prefillProjectId, projects]);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/clientsuppliers");
      if (response.data.success) {
        // Filter for clients only
        setClients(response.data.data.filter(client => client.type === "client"));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      // If projectId is passed (from route / state)
      const url = prefillProjectId
        ? `/projects/${prefillProjectId}`
        : `/projects`;

      const response = await axiosInstance.get(url);

      if (response.data?.success) {
        // If single project API, wrap it in array
        const projectData = prefillProjectId
          ? [response.data.data]
          : response.data.data;

        setProjects(projectData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    }
  };

  // Fetch estimate data for edit mode
  const fetchEstimateData = async (estimateId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/costestimates/${estimateId}`);

      if (response.data?.success) {
        const data = response.data.data; // REAL DATA

        setEstimateData({
          ...data,
          client_id: data.client_id?.toString() || "",
          project_id: data.project_id?.toString() || "",
          estimate_date: data.estimate_date ? new Date(data.estimate_date) : new Date(),
          valid_until: data.valid_until ? new Date(data.valid_until) : null,
          ce_status: data.ce_status || "Draft", // Using ce_status
          line_items: data.line_items?.length
            ? data.line_items.map(item => ({
              description: item.description,
              quantity: item.quantity.toString(),
              rate: formatCurrencyAmount(item.rate.toString(), data.currency)
            }))
            : [{ description: "", quantity: "1", rate: "0.00" }]
        });

        setCurrencySelected(!!data.currency);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch estimate data";
      toast.error(`Error fetching estimate: ${errorMessage}`);
      console.error("Error fetching estimate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'currency') {
      setCurrencySelected(!!value);
      
      // Reformat all rates when currency changes
      if (value && estimateData.line_items.length > 0) {
          const oldCurrency = estimateData.currency;
          const updatedLineItems = estimateData.line_items.map(item => {
            const num = parseCurrencyToNumber(item.rate, oldCurrency || value);
            return { ...item, rate: formatCurrencyAmount(num, value) };
          });
        setEstimateData(prev => ({ ...prev, [name]: value, line_items: updatedLineItems }));
      } else {
        setEstimateData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEstimateData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle date changes
  const handleDateChange = (date, fieldName) => {
    setEstimateData(prev => ({ ...prev, [fieldName]: date }));
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...estimateData.line_items];
    
    if (field === 'rate') {
      // Allow numbers, dot and comma while typing
      const numericValue = value.replace(/[^0-9.,]/g, "");
      updatedLineItems[index][field] = numericValue;
    } else {
      updatedLineItems[index][field] = value;
    }
    
    setEstimateData(prev => ({ ...prev, line_items: updatedLineItems }));
  };

  // Format rate when user leaves the input field
  const handleRateBlur = (index, value) => {
    if (!estimateData.currency) return;
    const num = parseCurrencyToNumber(value, estimateData.currency);
    if (!isNaN(num)) {
      const formattedValue = formatCurrencyAmount(num, estimateData.currency);
      const updatedLineItems = [...estimateData.line_items];
      updatedLineItems[index].rate = formattedValue;
      setEstimateData(prev => ({ ...prev, line_items: updatedLineItems }));
    }
  };

  // Add new line item
  const addLineItem = () => {
    setEstimateData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", quantity: "1", rate: "0.00" }]
    }));
  };

  // Show delete confirmation dialog
  const confirmDeleteLineItem = (index) => {
    setItemToDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  // Remove line item after confirmation
  const removeLineItem = () => {
    if (itemToDeleteIndex !== null) {
      const updatedLineItems = [...estimateData.line_items];
      updatedLineItems.splice(itemToDeleteIndex, 1);
      setEstimateData(prev => ({ ...prev, line_items: updatedLineItems }));
      setShowDeleteConfirmation(false);
      setItemToDeleteIndex(null);
    }
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDeleteIndex(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!estimateData.client_id) newErrors.client_id = "Client is required";
    if (!estimateData.project_id) newErrors.project_id = "Project is required";
    if (!estimateData.currency) newErrors.currency = "Currency is required";

    // Validate line items
    estimateData.line_items.forEach((item, index) => {
      if (!item.description) newErrors[`line_item_${index}_description`] = "Description is required";
      if (!item.quantity || parseFloat(item.quantity) <= 0) newErrors[`line_item_${index}_quantity`] = "Quantity must be greater than 0";
      const rateNum = parseCurrencyToNumber(item.rate, estimateData.currency);
      if (!item.rate || isNaN(rateNum) || rateNum <= 0) newErrors[`line_item_${index}_rate`] = "Rate must be greater than 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format date for API submission (DD-MM-YYYY)
  const formatDateForAPI = (date) => {
    if (!date) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`; // ISO SHORT
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix errors in the form");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API - remove formatting from rates before sending
      const apiData = {
        ...estimateData,
        estimate_date: formatDateForAPI(estimateData.estimate_date), // yyyy-mm-dd
        valid_until: estimateData.valid_until
          ? formatDateForAPI(estimateData.valid_until)
          : null,
        line_items: estimateData.line_items.map(item => ({
          ...item,
          rate: parseCurrencyToNumber(item.rate, estimateData.currency)
        }))
      };

      const url = isEditMode ? `/costestimates/${id}` : `/costestimates`;
      const method = isEditMode ? "put" : "post";

      const response = await axiosInstance({ method, url, data: apiData });

      if (response.data.success) {
        // Calculate total amount for the success message
        const subtotal = estimateData.line_items.reduce((sum, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const rate = parseCurrencyToNumber(item.rate, estimateData.currency) || 0;
          return sum + (quantity * rate);
        }, 0);
        const totalAmount = subtotal * (1 + parseFloat(estimateData.vat_rate) / 100);

        // Get client and project names for the message
        const clientName = clients.find(c => c.id === parseInt(estimateData.client_id))?.name || "Unknown";
        const projectName = projects.find(p => p.id === parseInt(estimateData.project_id))?.project_name || "Unknown";

        // Show success toast
        toast.success(
          <div>
            <strong>{isEditMode ? "Estimate Updated!" : "Estimate Created!"}</strong>
            <div className="mt-1">{clientName} - {projectName}</div>
          </div>
        );

        // Give browser time to paint toast
        setTimeout(() => {
          navigate(-1);
        }, 1200);

      } else {
        throw new Error(response.data.message || "Failed to save estimate");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save estimate";
      toast.error(`Error: ${errorMessage}`);
      console.error("Error saving estimate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate subtotal, VAT, and total
  const calculateSubtotal = () => {
    return estimateData.line_items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseCurrencyToNumber(item.rate, estimateData.currency) || 0;
      return sum + (quantity * rate);
    }, 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * (parseFloat(estimateData.vat_rate) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() * (1 + parseFloat(estimateData.vat_rate) / 100);
  };

  // Calculate line item amount
  const calculateLineItemAmount = (quantity, rate) => {
    const qty = parseFloat(quantity) || 0;
    const rateValue = parseCurrencyToNumber(rate, estimateData.currency) || 0;
    return qty * rateValue;
  };

  // --- RENDER ---
  return (
    <div className="p-2">
      <h4 className="fw-bold mb-4">Cost Estimates</h4>
      <div className="bg-white border rounded-3 p-4 shadow-sm">
        <h4 className="fw-semibold mb-4">
          {isEditMode ? `Edit Estimate` : "Create New Estimate"}
        </h4>

        {/* ===== BASIC DETAILS ===== */}
        <div className="row mb-3">
          {/* Client Selection */}
          <div className="col-md-4 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <label className="fw-bold">Client</label>
              <Link to="#"><button className="btn btn-sm btn-outline-primary rounded-pill">+ Create</button></Link>
            </div>
            <select className={`form-select ${errors.client_id ? "is-invalid" : ""}`} name="client_id" value={estimateData.client_id} onChange={handleInputChange}>
              <option value="">Select Client</option>
              {clients.map((client) => (<option key={client.id} value={client.id}>{client.name}</option>))}
            </select>
            {errors.client_id && <div className="invalid-feedback">{errors.client_id}</div>}
          </div>

          {/* Project Selection */}
          <div className="col-md-4 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <label className="fw-bold">Project</label>
              <Link to="/projects/add"><button className="btn btn-sm btn-outline-primary rounded-pill">+ Projects</button></Link>
            </div>
            <select className={`form-select ${errors.project_id ? "is-invalid" : ""}`} name="project_id" value={estimateData.project_id} onChange={handleInputChange}>
              <option value="">Select a project</option>
              {projects.map((project) => (<option key={project.id} value={project.id}>{project.project_no} - {project.project_name}</option>))}
            </select>
            {errors.project_id && <div className="invalid-feedback">{errors.project_id}</div>}
          </div>

          {/* Estimate Date */}
          <div className="col-md-4 mb-3">
            <label className="fw-bold">Estimate Date</label>
            <div className="input-group">
              <DatePicker
                selected={estimateData.estimate_date}
                onChange={(date) => {
                  handleDateChange(date, 'estimate_date');

                  // If valid_until is before estimate_date, reset it
                  if (
                    estimateData.valid_until &&
                    date &&
                    estimateData.valid_until < date
                  ) {
                    handleDateChange(null, 'valid_until');
                  }
                }}
                dateFormat="dd-MM-yyyy"
                minDate={new Date()}        // TODAY & FUTURE ONLY
                className={`form-control ${errors.estimate_date ? "is-invalid" : ""}`}
                placeholderText="DD-MM-YYYY"
                open={showEstimateDatePicker}
                onClickOutside={() => setShowEstimateDatePicker(false)}
                disabled={isLoading}
              />

              <span className="input-group-text bg-white" style={{ cursor: 'pointer' }} onClick={() => !isLoading && setShowEstimateDatePicker(!showEstimateDatePicker)}><FaCalendarAlt /></span>
              {errors.estimate_date && <div className="invalid-feedback d-block">{errors.estimate_date}</div>}
            </div>
          </div>

          {/* Valid Until Date */}
          <div className="col-md-4 mb-3">
            <label className="fw-bold">Valid Until</label>
            <div className="input-group">
              <DatePicker
                selected={estimateData.valid_until}
                onChange={(date) => handleDateChange(date, 'valid_until')}
                dateFormat="dd-MM-yyyy"
                minDate={estimateData.estimate_date || new Date()} // AFTER ESTIMATE DATE
                className="form-control"
                placeholderText="DD-MM-YYYY"
                open={showValidUntilDatePicker}
                onClickOutside={() => setShowValidUntilDatePicker(false)}
                disabled={isLoading}
                isClearable
              />

              <span className="input-group-text bg-white" style={{ cursor: 'pointer' }} onClick={() => !isLoading && setShowValidUntilDatePicker(!showValidUntilDatePicker)}><FaCalendarAlt /></span>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="col-md-4 mb-3">
            <label className="fw-bold">Currency</label>
            <select className={`form-select ${errors.currency ? "is-invalid" : ""}`} name="currency" value={estimateData.currency} onChange={handleInputChange}>
              <option value="">Select Currency</option>
              <option value="USD">USD - US Dollars</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupees</option>
              <option value="AED">AED - Dirhams</option>
              <option value="SAR">SAR - Saudi Riyal</option>
            </select>
            {errors.currency && <div className="invalid-feedback">{errors.currency}</div>}
          </div>

          {/* Status Selection - Changed to use ce_status */}
          <div className="col-md-4 mb-3">
            <label className="fw-bold">Status</label>
            <select className={`form-select ${errors.ce_status ? "is-invalid" : ""}`} name="ce_status" value={estimateData.ce_status} onChange={handleInputChange}>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            {errors.ce_status && <div className="invalid-feedback">{errors.ce_status}</div>}
          </div>
        </div>

        {/* ===== LINE ITEMS ===== */}
        <h6 className="fw-semibold mb-3">Line Items</h6>
        <div className="row fw-semibold text-muted mb-2 px-2">
          <div className="col-md-5">Description</div>
          <div className="col-md-2">Quantity</div>
          <div className="col-md-2">Rate</div>
          <div className="col-md-2">Amount</div>
          <div className="col-md-1"></div>
        </div>

        {estimateData?.line_items?.map((item, index) => (
          <div key={index} className="row gx-2 gy-2 align-items-center mb-2 px-2 py-2" style={{ background: "#f9f9f9", borderRadius: "8px" }}>
            <div className="col-md-5">
              <input className={`form-control ${errors[`line_item_${index}_description`] ? "is-invalid" : ""}`} placeholder="Item description" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} />
              {errors[`line_item_${index}_description`] && <div className="invalid-feedback">{errors[`line_item_${index}_description`]}</div>}
            </div>
            <div className="col-md-2">
              <input className={`form-control ${errors[`line_item_${index}_quantity`] ? "is-invalid" : ""}`} placeholder="Qty" type="number" min="1" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} />
              {errors[`line_item_${index}_quantity`] && <div className="invalid-feedback">{errors[`line_item_${index}_quantity`]}</div>}
            </div>
            <div className="col-md-2">
              <input 
                className={`form-control ${errors[`line_item_${index}_rate`] ? "is-invalid" : ""} ${!currencySelected ? 'bg-light' : ''}`} 
                placeholder="Rate" 
                value={item.rate} 
                disabled={!currencySelected} 
                onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)} 
                onBlur={() => handleRateBlur(index, item.rate)} 
              />
              {errors[`line_item_${index}_rate`] && <div className="invalid-feedback">{errors[`line_item_${index}_rate`]}</div>}
              {!currencySelected && <small className="text-muted">Please select currency first</small>}
            </div>
            <div className="col-md-2">
              <span>{estimateData.currency} {formatCurrencyAmount(calculateLineItemAmount(item.quantity, item.rate).toFixed(2), estimateData.currency)}</span>
            </div>
            <div className="col-md-1 text-end">
              <button className="btn btn-link text-danger p-0" onClick={() => confirmDeleteLineItem(index)}>remove</button>
            </div>
          </div>
        ))}

        <button className="btn border rounded px-3 py-1 mb-4" onClick={addLineItem} disabled={!currencySelected}>+ Add Line Item</button>

        {/* ===== VAT + NOTES ===== */}
        <div className="row mt-4">
          <div className="col-md-6">
            <label className="fw-bold">VAT Rate (%)</label>
            <input className="form-control" name="vat_rate" value={estimateData.vat_rate} onChange={handleInputChange} />
            <div className="mt-3">
              <p>Subtotal: {estimateData.currency} {formatCurrencyAmount(calculateSubtotal().toFixed(2), estimateData.currency)}</p>
              <p>VAT: {estimateData.currency} {formatCurrencyAmount(calculateVAT().toFixed(2), estimateData.currency)}</p>
              <p><strong>Total: {estimateData.currency} {formatCurrencyAmount(calculateTotal().toFixed(2), estimateData.currency)}</strong></p>
            </div>
          </div>
          <div className="col-md-6">
            <label className="fw-bold">Notes</label>
            <textarea className="form-control" rows="5" placeholder="Additional notes..." name="notes" value={estimateData.notes} onChange={handleInputChange} />
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary rounded-pill px-4" onClick={handleSubmit} disabled={isLoading || !currencySelected}>
            {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <span className="ms-2">Saving...</span></> : (isEditMode ? "Save" : "Save")}
          </button>
          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Confirm Delete</h5><button type="button" className="btn-close" onClick={cancelDelete}></button></div>
              <div className="modal-body"><p>Are you sure you want to delete this line item?</p></div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={cancelDelete}>Cancel</button><button type="button" className="btn btn-danger" onClick={removeLineItem}>Delete</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}