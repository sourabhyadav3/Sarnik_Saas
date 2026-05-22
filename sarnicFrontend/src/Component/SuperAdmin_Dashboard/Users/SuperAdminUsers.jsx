import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchSuperAdminUsers } from "../../../api/superadminApi";

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchSuperAdminUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Users</h3>
        <p className="text-muted mb-0">All platform users across tenants</p>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          {loading ? (
            <p className="text-muted">Loading users...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Company ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.first_name} {u.last_name}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge bg-primary text-capitalize">
                          {u.role_name}
                        </span>
                      </td>
                      <td>{u.company_id ?? "—"}</td>
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

export default SuperAdminUsers;
