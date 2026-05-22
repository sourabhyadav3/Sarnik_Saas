import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Modified Custom Dropdown Component
const SearchableDropdown = ({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isCreatable = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isNewOption, setIsNewOption] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options?.find(option => option?.id == value);

  useEffect(() => {
    // Update input value based on selected option or custom value
    if (selectedOption) {
      setInputValue(selectedOption.name);
      setIsNewOption(false);
    } else if (value && value.toString().startsWith('new_')) {
      // This is a new option that hasn't been created yet
      setIsNewOption(true);
    } else if (!value) {
      setInputValue('');
      setIsNewOption(false);
    }
  }, [value, selectedOption]);

  const filteredOptions = (options || []).filter(option =>
    option?.name?.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    
    // Check if this is a new option (not matching existing ones)
    const exactMatch = options?.find(option => 
      option.name.toLowerCase() === value.toLowerCase()
    );
    
    if (!exactMatch && value.trim() !== '') {
      setIsNewOption(true);
      // Set a temporary value to indicate this is a new option
      onChange({ target: { name: name, value: `new_${value}` } });
    } else if (exactMatch) {
      setIsNewOption(false);
      onChange({ target: { name: name, value: exactMatch.id } });
    }
  };

  const handleOptionClick = (option) => {
    setInputValue(option.name);
    setIsOpen(false);
    setIsNewOption(false);
    onChange({ target: { name: name, value: option.id } });
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="col-md-6 mb-3" ref={dropdownRef}>
      <label className="form-label fw-medium">{label}</label>
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Search or create new ${label.toLowerCase()}...`}
          autoComplete="off"
          disabled={disabled}
        />
        {isOpen && !disabled && (
          <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto', cursor: 'pointer' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name}
                </li>
              ))
            ) : (
              isCreatable && inputValue.trim() !== '' && (
                <li className="list-group-item list-group-item-action text-primary">
                  Create new: "{inputValue}"
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

const AddEditJob = () => {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();

  // Determine if we're in edit mode
  const isEditMode = Boolean(jobId);

  // Form data states
  const [formData, setFormData] = useState({
    project_name: "",
    project_id: projectId,
    project_number: "",
    brand_id: "",
    sub_brand_id: "",
    flavour_id: "",
    pack_type_id: "",
    pack_code: "", // Changed from pack_code_id to pack_code
    pack_size: "",
    priority: "Medium",
    ean_barcode: "",
  });

  // Track new items that need to be created
  const [newItems, setNewItems] = useState({
    brand: null,
    sub_brand: null,
    flavour: null,
    pack_type: null,
  });

  const [brands, setBrands] = useState([]);
  const [subBrands, setSubBrands] = useState([]);
  const [flavours, setFlavours] = useState([]);
  const [packTypes, setPackTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown options on load
  const fetchDropdownData = async () => {
    try {
      const [
        brandResponse,
        flavourResponse,
        packTypeResponse,
        subBrandResponse,
      ] = await Promise.all([
        axiosInstance.get("/brand"),
        axiosInstance.get("/flavours"),
        axiosInstance.get("/packtypes"),
        axiosInstance.get("/subbrands"),
      ]);

      setBrands(brandResponse.data?.data || []);
      setFlavours(flavourResponse.data?.data || []);
      setPackTypes(packTypeResponse.data?.data || []);
      setSubBrands(subBrandResponse.data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch dropdown options.");
      console.error("Error fetching dropdown data:", error);
    }
  };

  // Fetch job data if in edit mode
  const fetchJobData = async () => {
    if (!isEditMode) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/jobs/${jobId}`);

      if (response.data?.success) {
        const jobData = response.data.data;
        setFormData(prev => ({
          ...prev,
          project_name: jobData.project_name || prev.project_name || "",
          project_id: jobData.project_id || projectId,
          project_number: jobData.project_number || prev.project_number || "",
          brand_id: jobData.brand_id || "",
          sub_brand_id: jobData.sub_brand_id || "",
          flavour_id: jobData.flavour_id || "",
          pack_type_id: jobData.pack_type_id || "",
          pack_code: jobData.pack_code || "", 
          pack_size: jobData.pack_size || "",
          priority: jobData.priority || "Medium",
          ean_barcode: jobData.ean_barcode || "",
        }));
        toast.success("Job data loaded successfully!");
      } else {
        toast.error(response.data?.message || "Failed to fetch job data.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching job data. Please try again.");
      console.error("Error fetching job data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchJobData();
  }, [jobId]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axiosInstance.get(`/projects/${projectId}`);
        if (res.data?.success) {
          setFormData(prev => ({
            ...prev,
            project_name: res.data.data.project_name,
            project_number: res.data.data.project_no,
          }));
        }
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if this is a new item (starts with 'new_')
    if (value && value.toString().startsWith('new_')) {
      const itemName = value.toString().substring(4); // Remove 'new_' prefix
      const itemType = name.replace('_id', ''); // Extract item type
      
      setNewItems(prev => ({
        ...prev,
        [itemType]: itemName
      }));
    } else {
      // Clear the new item if we're selecting an existing option
      const itemType = name.replace('_id', '');
      setNewItems(prev => ({
        ...prev,
        [itemType]: null
      }));
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enhanced validation function
  const validateForm = () => {
    const errors = [];

    if (!formData.brand_id) {
      errors.push("Brand is required");
    }

    if (!formData.sub_brand_id) {
      errors.push("Sub Brand is required");
    }

    if (!formData.flavour_id) {
      errors.push("Flavour is required");
    }

    if (!formData.pack_type_id) {
      errors.push("Pack Type is required");
    }

    if (!formData.pack_code || formData.pack_code.trim() === "") {
      errors.push("Pack Code is required");
    }

    if (!formData.pack_size || formData.pack_size.trim() === "") {
      errors.push("Pack Size is required");
    }

    if (!formData.ean_barcode || formData.ean_barcode.trim() === "") {
      errors.push("EAN Barcode is required");
    } else if (formData.ean_barcode.length !== 13 || !/^\d+$/.test(formData.ean_barcode)) {
      errors.push("EAN Barcode must be exactly 13 digits");
    }

    if (!formData.priority) {
      errors.push("Priority is required");
    }

    return errors;
  };

  // Helper function to create new items with better error handling
  const createNewItem = async (endpoint, name, type) => {
    try {
      const response = await axiosInstance.post(endpoint, { name });
      
      // Try different possible structures for the ID
      let itemId = null;
      
      if (response.data?.data?.id) {
        itemId = response.data.data.id;
      } else if (response.data?.id) {
        itemId = response.data.id;
      } else if (response.data?.data?.[0]?.id) {
        itemId = response.data.data[0].id;
      } else if (typeof response.data === 'object' && response.data !== null) {
        // Try to find any property that might be the ID
        const possibleIdKeys = ['id', 'brand_id', 'sub_brand_id', 'flavour_id', 'pack_type_id'];
        for (const key of possibleIdKeys) {
          if (response.data[key]) {
            itemId = response.data[key];
            break;
          }
        }
      }
      
      if (itemId) {
        // Removed the success toast here
        return itemId;
      } else {
        console.error(`No ID found in response for ${type}:`, response.data);
        toast.error(`Failed to create ${type}: Invalid response format`);
        return null;
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      const errorMessage = error.response?.data?.message || `Failed to create ${type}`;
      toast.error(errorMessage);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Enhanced validation
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      // Show all validation errors in a single toast
      toast.error(
        <div>
          <strong>Please fix the following errors:</strong>
          <ul style={{ margin: '5px 0 0 20px', textAlign: 'left' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create new items first if needed
      const createdItems = {};
      
      // Create brand if needed
      if (newItems.brand) {
        const brandId = await createNewItem("/brand", newItems.brand, "Brand");
        if (!brandId) {
          setIsSubmitting(false);
          return;
        }
        createdItems.brand_id = brandId;
      }
      
      // Create sub brand if needed
      if (newItems.sub_brand) {
        const subBrandId = await createNewItem("/subbrands", newItems.sub_brand, "Sub Brand");
        if (!subBrandId) {
          setIsSubmitting(false);
          return;
        }
        createdItems.sub_brand_id = subBrandId;
      }
      
      // Create flavour if needed
      if (newItems.flavour) {
        const flavourId = await createNewItem("/flavours", newItems.flavour, "Flavour");
        if (!flavourId) {
          setIsSubmitting(false);
          return;
        }
        createdItems.flavour_id = flavourId;
      }
      
      // Create pack type if needed
      if (newItems.pack_type) {
        const packTypeId = await createNewItem("/packtypes", newItems.pack_type, "Pack Type");
        if (!packTypeId) {
          setIsSubmitting(false);
          return;
        }
        createdItems.pack_type_id = packTypeId;
      }
      
      // Prepare the payload with either existing IDs or newly created IDs
      const payload = {
        ...formData,
        brand_id: createdItems.brand_id || (formData.brand_id?.toString().startsWith('new_') ? '' : formData.brand_id),
        sub_brand_id: createdItems.sub_brand_id || (formData.sub_brand_id?.toString().startsWith('new_') ? '' : formData.sub_brand_id),
        flavour_id: createdItems.flavour_id || (formData.flavour_id?.toString().startsWith('new_') ? '' : formData.flavour_id),
        pack_type_id: createdItems.pack_type_id || (formData.pack_type_id?.toString().startsWith('new_') ? '' : formData.pack_type_id),
        // Ensure pack_code is sent as the actual value, not an ID
        pack_code: formData.pack_code,
      };

      let response;

      if (isEditMode) {
        // Update existing job
        response = await axiosInstance.put(`/jobs/${jobId}`, payload);
      } else {
        // Create new job
        response = await axiosInstance.post("/jobs", payload);
      }

      if (response.data?.success) {
        const successMessage = isEditMode ? "Job updated successfully!" : "Job created successfully!";
        toast.success(successMessage);

        // Clear form only in add mode, not edit mode
        if (!isEditMode) {
          setFormData({
            project_name: formData.project_name,
            project_id: projectId,
            project_number: formData.project_number,
            brand_id: "",
            sub_brand_id: "",
            flavour_id: "",
            pack_type_id: "",
            pack_code: "",
            pack_size: "",
            priority: "Medium",
            ean_barcode: "",
          });
          
          setNewItems({
            brand: null,
            sub_brand: null,
            flavour: null,
            pack_type: null,
          });
        }

        // Navigate to project details page after successful operation
        setTimeout(() => {
          navigate(`/projects/${projectId}?tab=jobs`);

        }, 1500); // Give user time to see the success message
      } else {
        toast.error(response.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job.`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Error ${isEditMode ? 'updating' : 'creating'} job. Please try again.`;
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4 min-vh-100">
      <ToastContainer position="top-right" />
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="mb-4">
            <h4 className="fw-bold mb-0">{isEditMode ? 'Edit Job' : 'Add Job'}</h4>
          </div>

          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-medium">Project Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.project_name}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Project Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.project_number}
                  disabled
                />
              </div>

              <SearchableDropdown
                label="Brand Name"
                name="brand_id"
                options={brands}
                value={formData.brand_id}
                onChange={handleChange}
              />

              <SearchableDropdown
                label="Sub Brand"
                name="sub_brand_id"
                options={subBrands}
                value={formData.sub_brand_id}
                onChange={handleChange}
              />

              <SearchableDropdown
                label="Flavour"
                name="flavour_id"
                options={flavours}
                value={formData.flavour_id}
                onChange={handleChange}
              />

              <SearchableDropdown
                label="Pack Type"
                name="pack_type_id"
                options={packTypes}
                value={formData.pack_type_id}
                onChange={handleChange}
              />

              {/* Changed Pack Code from dropdown to input field */}
              <div className="col-md-6">
                <label className="form-label fw-medium">Pack Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="pack_code"
                  value={formData.pack_code}
                  onChange={handleChange}
                  placeholder="Enter pack code"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Pack Size</label>
                <input
                  type="text"
                  className="form-control"
                  name="pack_size"
                  value={formData.pack_size}
                  onChange={handleChange}
                  placeholder="e.g., 500ml, 1kg"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Priority</label>
                <select
                  className="form-select"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">EAN Barcode</label>
                <input
                  type="text"
                  className="form-control"
                  name="ean_barcode"
                  value={formData.ean_barcode}
                  onChange={handleChange}
                  placeholder="Enter 13-digit EAN barcode"
                  maxLength="13"
                />
                <small className="text-muted">
                  Must be exactly 13 digits (0-9)
                </small>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-3 mt-4">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </button>
            <button
              className="btn btn-dark px-4"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isEditMode ? 'Save...' : 'Save...'}
                </>
              ) : (
                isEditMode ? 'Save' : 'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditJob;