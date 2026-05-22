import React from "react";

const Invoicing = () => {
  return (
    <div className="container-fluid p-4">
      {/* Page Title */}
      <h4 className="mb-4 fw-semibold">Invoicing</h4>

      {/* Filters */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search invoices..."
            />
          </div>
        </div>

        <div className="col-md-2">
          <input type="date" className="form-control" />
        </div>

        <div className="col-md-2">
          <input type="date" className="form-control" />
        </div>

        <div className="col-md-2">
          <select className="form-select">
            <option>All Projects</option>
            <option>Project A</option>
            <option>Project B</option>
          </select>
        </div>

        <div className="col-md-2">
          <select className="form-select">
            <option>All Clients</option>
            <option>Client X</option>
            <option>Client Y</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Project</th>
                <th>CE-No</th>
                <th>PO Number</th>
                <th>Client Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-muted">
                <td colSpan="8" className="text-center py-4">
                  No invoices found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoicing;
