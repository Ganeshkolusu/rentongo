import React from "react";

interface Props {
  bookingId: string;
  apiUrl: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingConfirmModal: React.FC<Props> = ({
  bookingId,
  apiUrl,
  visible,
  onClose,
  onSuccess
}) => {
  if (!visible) return null;

  const handleAccept = async () => {
    try {
      await fetch(`${apiUrl}/confirmBooking/${bookingId}/Confirmed`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error accepting booking:", error);
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`${apiUrl}/confirmBooking/${bookingId}/Cancelled`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
      }}
    >
      <div
        style={{
          width: 350,
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 0 12px rgba(0,0,0,0.2)"
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Booking Approval</h2>
        <p>Do you want to accept or reject this booking?</p>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={handleReject}
            style={{
              flex: 1,
              background: "#e63946",
              padding: "10px 0",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              cursor: "pointer"
            }}
          >
            Reject
          </button>

          <button
            onClick={handleAccept}
            style={{
              flex: 1,
              background: "#2a9d8f",
              padding: "10px 0",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              cursor: "pointer"
            }}
          >
            Accept
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 15,
            width: "100%",
            padding: "8px 0",
            background: "#ccc",
            borderRadius: 8,
            border: "none",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmModal;