import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchSaasCompanies,
  createSaasCompany,
  updateSaasCompany,
  deleteSaasCompany,
} from "../../../api/superadminApi";

const emptyForm = {
  company_name: "",
  slug: "",
  email: "",
  phone: "",
  status: "active",
  subscription_plan: "basic",
};

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchSaasCompanies();
      setCompanies(data);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSaasCompany(editingId, form);
        toast.success("Company updated");
      } else {
        await createSaasCompany(form);
        toast.success("Company created");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (company) => {
    setForm({
      company_name: company.company_name || "",
      slug: company.slug || "",
      email: company.email || "",
      phone: company.phone || "",
      status: company.status || "active",
      subscription_plan: company.subscription_plan || "basic",
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await deleteSaasCompany(id);
      toast.success("Company deleted");
      loadCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Companies</h3>
          <p className="text-muted mb-0">Manage SaaS tenant companies</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add Company"}
        </button>
      </div>

      {showForm && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">
              {editingId ? "Edit Company" : "New Company"}
            </h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company Name *</label>
                <input
                  className="form-control"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Slug</label>
                <input
                  className="form-control"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Subscription Plan</label>
                <select
                  className="form-select"
                  name="subscription_plan"
                  value={form.subscription_plan}
                  onChange={handleChange}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          {loading ? (
            <p className="text-muted">Loading companies...</p>
          ) : companies.length === 0 ? (
            <p className="text-muted mb-0">
              No companies yet. Run backend migration or add your first company.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id}>
                      <td>{c.company_name}</td>
                      <td>{c.email || "—"}</td>
                      <td>
                        <span className="badge bg-secondary text-capitalize">
                          {c.status}
                        </span>
                      </td>
                      <td className="text-capitalize">{c.subscription_plan}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCompanies;
