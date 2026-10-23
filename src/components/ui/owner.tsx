import React, { useEffect, useState } from "react";
import BookingConfirmModal from "./BookingConfirmModal";

const OwnerPendingPage = ({ ownerId, apiUrl }) => {
  const [pending, setPending] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!ownerId) {
      setError("Owner ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${apiUrl}/getPendingBookingsOfOwner/${ownerId}`);
      const data = await res.json();
      
      if (data.success) {
        setPending(data.bookings);
      } else {
        setError(data.message || "Failed to load bookings");
      }
    } catch (err) {
      setError("Error loading bookings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [ownerId, apiUrl]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Bookings</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && pending.length === 0 && (
        <p>No pending bookings found.</p>
      )}

      {pending.map((b) => (
        <div
          key={b._id}
          style={{ padding: 12, margin: 8, border: "1px solid #ccc", borderRadius: 8 }}
        >
          <p><b>User:</b> {b.userName}</p>
          <p><b>Car:</b> {b.carName}</p>

          <button
            onClick={() => setSelectedBookingId(b._id)}
            style={{
              background: "#457b9d",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer"
            }}
          >
            Review
          </button>
        </div>
      ))}

      <BookingConfirmModal
        bookingId={selectedBookingId}
        apiUrl={apiUrl}
        visible={!!selectedBookingId}
        onClose={() => setSelectedBookingId("")}
        onSuccess={() => load()}
      />
    </div>
  );
};

export default OwnerPendingPage;