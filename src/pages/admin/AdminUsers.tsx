import React, { useEffect, useState } from "react";
import apiService from "../../services/api.service";
import AdminTable, { Column } from "./AdminTable";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  mobilenumber?: string;
  role: string;
  createdAt: string;
}

const LIMIT = 50;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService.admin
      .getAllUsers({ limit: LIMIT, skip })
      .then((data: any) => {
        if (cancelled) return;
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || "Failed to load users");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [skip]);

  const columns: Column<AdminUser>[] = [
    { header: "Name", render: (u) => u.name || "—" },
    { header: "Email", render: (u) => u.email },
    { header: "Mobile", render: (u) => u.mobilenumber || "—" },
    {
      header: "Role",
      render: (u) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
          {u.role}
        </span>
      ),
    },
    { header: "Joined", render: (u) => new Date(u.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Users</h1>
      <p className="text-gray-500 text-sm mb-6">{total} total</p>
      <AdminTable
        columns={columns}
        rows={users}
        rowKey={(u) => u._id}
        loading={loading}
        error={error}
        total={total}
        skip={skip}
        limit={LIMIT}
        onPageChange={setSkip}
        emptyLabel="No users yet."
      />
    </div>
  );
};

export default AdminUsers;
