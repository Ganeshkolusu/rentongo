import React, { useEffect, useState } from "react";
import apiService from "../../services/api.service";
import AdminTable, { Column } from "./AdminTable";

interface AdminSubscription {
  _id: string;
  userId?: { name?: string; email?: string } | string;
  plan: string;
  status: string;
  expiresAt?: string;
  lastPaymentAmount?: number;
  createdAt: string;
}

const LIMIT = 50;

const AdminSubscriptions: React.FC = () => {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService.admin
      .getAllSubscriptions({ limit: LIMIT, skip })
      .then((data: any) => {
        if (cancelled) return;
        setSubs(data.subscriptions || []);
        setTotal(data.total || 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || "Failed to load subscriptions");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [skip]);

  const personLabel = (p?: { name?: string; email?: string } | string) => (typeof p === "object" ? p?.name || p?.email : "—");

  const columns: Column<AdminSubscription>[] = [
    { header: "Owner", render: (s) => personLabel(s.userId) },
    {
      header: "Plan",
      render: (s) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${s.plan === "pro" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
          {s.plan}
        </span>
      ),
    },
    { header: "Status", render: (s) => s.status },
    { header: "Expires", render: (s) => (s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—") },
    { header: "Last Payment", render: (s) => (s.lastPaymentAmount ? `₹${s.lastPaymentAmount}` : "—") },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Subscriptions</h1>
      <p className="text-gray-500 text-sm mb-6">{total} total</p>
      <AdminTable
        columns={columns}
        rows={subs}
        rowKey={(s) => s._id}
        loading={loading}
        error={error}
        total={total}
        skip={skip}
        limit={LIMIT}
        onPageChange={setSkip}
        emptyLabel="No subscriptions yet."
      />
    </div>
  );
};

export default AdminSubscriptions;
