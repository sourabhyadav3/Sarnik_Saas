import React from "react";

const SuperAdminSettings = () => {
  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Platform Settings</h3>
        <p className="text-muted mb-0">
          SaaS configuration — Phase 2 will add tenant billing & plans
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <h5 className="fw-semibold">Coming in Phase 2</h5>
          <ul className="text-muted mb-0">
            <li>Default subscription plans</li>
            <li>Platform branding</li>
            <li>Email / notification settings</li>
            <li>Feature flags per tenant</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
