import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../api/axiosInstance";

const ClientSupplier = () => {
  /* ================= STATE ================= */
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    type: "client", // Default to client
    name: "",
    industry: "",
    website: "",
    address: "",
    tax_id: "",
    phone: "",
    status: "active", // Default to active
    contact_persons: [
      {
        name: "",
        job_title: "",
        email: "",
        phone: "",
        department: "",
        sales_representative: "",
      },
    ],
    payment_terms: "",
    credit_limit: "",
    notes: "",
  });

  /* ================= API CALLS ================= */
  
  // Fetch all companies from API
  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("/clientsuppliers");
      const data = res.data.data || [];
      setCompanies(data);
      setFilteredCompanies(data); // Initialize filtered data
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Apply filters whenever companies or filter values change
  useEffect(() => {
    let filtered = [...companies];
    
    // Filter by name
    if (searchName) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    // Filter by type (client/supplier)
    if (filterType) {
      filtered = filtered.filter(company => 
        company.type === filterType
      );
    }
    
    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(company => 
        company.status === filterStatus
      );
    }
    
    setFilteredCompanies(filtered);
  }, [companies, searchName, filterType, filterStatus]);

  /* ================= HANDLERS ================= */
  
  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle contact person input changes
  const handleContactChange = (index, e) => {
    const updated = [...form.contact_persons];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, contact_persons: updated });
  };

  // Add a new contact person to the form
  const addContact = () => {
    setForm({
      ...form,
      contact_persons: [
        ...form.contact_persons,
        {
          name: "",
          job_title: "",
          email: "",
          phone: "",
          department: "",
          sales_representative: "",
        },
      ],
    });
  };

  // Remove a contact person from the form
  const removeContact = (index) => {
    if (form.contact_persons.length > 1) {
      const updated = [...form.contact_persons];
      updated.splice(index, 1);
      setForm({ ...form, contact_persons: updated });
    }
  };

  /* ================= SAVE (POST / PUT) ================= */
  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error("Name & Phone are required");
      return;
    }

    try {
      if (isEdit) {
        await axiosInstance.put(
          `/clientsuppliers/${selectedId}`,
          form
        );
        toast.success("Company updated successfully");
      } else {
        await axiosInstance.post("/clientsuppliers", form);
        toast.success("Company created successfully");
      }

      // Reset form and close modal
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Operation failed");
    }
  };

  // Reset form state
  const resetForm = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedId(null);
    setForm({
      type: "client",
      name: "",
      industry: "",
      website: "",
      address: "",
      tax_id: "",
      phone: "",
      status: "active",
      contact_persons: [
        {
          name: "",
          job_title: "",
          email: "",
          phone: "",
          department: "",
          sales_representative: "",
        },
      ],
      payment_terms: "",
      credit_limit: "",
      notes: "",
    });
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setIsEdit(true);
    setSelectedId(item.id);
    setForm({
      ...item,
      contact_persons: item.contact_persons || [
        {
          name: "",
          job_title: "",
          email: "",
          phone: "",
          department: "",
          sales_representative: "",
        },
      ],
    });
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;

    try {
      await axiosInstance.delete(`/clientsuppliers/${id}`);
      toast.success("Deleted successfully");
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Delete failed");
    }
  };

  // Get badge color based on type
  const getTypeBadgeColor = (type) => {
    return type === "client" ? "bg-primary" : "bg-info";
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    return status === "active" ? "bg-success" : "bg-secondary";
  };

  return (
    <div className="p-4 m-2 bg-white rounded shadow-sm">
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h4 className="fw-bold">Client / Supplier Management</h4>
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsEdit(false);
            setShowModal(true);
          }}
        >
          <FaPlus /> Add Company
        </button>
      </div>

      {/* FILTERS */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">Filters</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="client">Client</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchName("");
                  setFilterType("");
                  setFilterStatus("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>{c.name}</td>
                    <td>
                      <span className={`badge ${getTypeBadgeColor(c.type)}`}>
                        {c.type}
                      </span>
                    </td>
                    <td>{c.contact_persons?.[0]?.name}</td>
                    <td>{c.contact_persons?.[0]?.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.industry}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(c)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-3">
                    No companies found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{isEdit ? "Edit" : "Add New"} {form.type === "client" ? "Client" : "Supplier"}</h5>
                <button className="btn-close" onClick={resetForm} />
              </div>

              <div className="modal-body">
                {/* Client/Supplier Information */}
                <h6>Company Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Type</label>
                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                      <option value="client">Client</option>
                      <option value="supplier">Supplier</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label>Name *</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>Industry</label>
                    <input className="form-control" name="industry" value={form.industry} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>Website</label>
                    <input className="form-control" name="website" value={form.website} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>Address</label>
                    <textarea className="form-control" name="address" value={form.address} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>TRN No.</label>
                    <input className="form-control" name="tax_id" value={form.tax_id} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>Phone Number *</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label>Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <hr />

                {/* Contact Persons */}
                <h6>Contact Persons</h6>
                {form.contact_persons.map((cp, i) => (
                  <div className="row g-2 mb-2" key={i}>
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Contact Name" name="name" value={cp.name} onChange={(e) => handleContactChange(i, e)} />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Job Title" name="job_title" value={cp.job_title} onChange={(e) => handleContactChange(i, e)} />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Email" name="email" value={cp.email} onChange={(e) => handleContactChange(i, e)} />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Phone" name="phone" value={cp.phone} onChange={(e) => handleContactChange(i, e)} />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" placeholder="Department" name="department" value={cp.department} onChange={(e) => handleContactChange(i, e)} />
                    </div>
                    <div className="col-md-4 d-flex">
                      <input className="form-control" placeholder="Sales Representative" name="sales_representative" value={cp.sales_representative} onChange={(e) => handleContactChange(i, e)} />
                      {form.contact_persons.length > 1 && (
                        <button
                          className="btn btn-sm btn-danger ms-2"
                          onClick={() => removeContact(i)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button className="btn btn-sm btn-outline-primary" onClick={addContact}>
                  + Add Another Contact
                </button>

                <hr />

                {/* Additional Information */}
                <h6>Additional Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Payment Terms</label>
                    <input className="form-control" name="payment_terms" value={form.payment_terms} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label>Credit Limit</label>
                    <input type="number" className="form-control" name="credit_limit" value={form.credit_limit} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label>Notes</label>
                    <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {isEdit ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSupplier;