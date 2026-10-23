import React, { useEffect, useState } from "react";
import apiService from "../../services/api.service";
import AdminTable, { Column } from "./AdminTable";

interface AdminBooking {
  _id: string;
  vechileType: string;
  userId?: { name?: string; email?: string } | string;
  ownerId?: { name?: string; email?: string } | string;
  FromDate: string;
  ToDate: string;
  totalPrice: number;
  withDriver?: boolean;
  status: string;
  createdAt: string;
}

const LIMIT = 50;

const statusColor: Record<string, string> = {
  Confirmed: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  AutoCancelled: "bg-red-100 text-red-700",
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService.admin
      .getAllBookings({ status: status || undefined, limit: LIMIT, skip })
      .then((data: any) => {
        if (cancelled) return;
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || "Failed to load bookings");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, skip]);

  const personLabel = (p?: { name?: string; email?: string } | string) => (typeof p === "object" ? p?.name || p?.email : "—");

  const columns: Column<AdminBooking>[] = [
    { header: "Vehicle", render: (b) => b.vechileType },
    { header: "Customer", render: (b) => personLabel(b.userId) },
    { header: "Owner", render: (b) => personLabel(b.ownerId) },
    { header: "Dates", render: (b) => `${new Date(b.FromDate).toLocaleDateString()} → ${new Date(b.ToDate).toLocaleDateString()}` },
    { header: "Price", render: (b) => `₹${b.totalPrice}${b.withDriver ? " (+driver)" : ""}` },
    {
      header: "Status",
      render: (b) => <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor[b.status] || "bg-gray-100 text-gray-600"}`}>{b.status}</span>,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">All Bookings</h1>
      <p className="text-gray-500 text-sm mb-4">{total} total</p>

      <select value={status} onChange={(e) => { setStatus(e.target.value); setSkip(0); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="">All statuses</option>
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
        <option value="AutoCancelled">Auto-cancelled</option>
      </select>

      <AdminTable
        columns={columns}
        rows={bookings}
        rowKey={(b) => b._id}
        loading={loading}
        error={error}
        total={total}
        skip={skip}
        limit={LIMIT}
        onPageChange={setSkip}
        emptyLabel="No bookings match."
      />
    </div>
  );
};

export default AdminBookings;
