import React, { useEffect, useState } from 'react';
import { useBookingModalStore } from '../../store/booking-modal.store';
import { API_BASE_URL, authHeader } from '../../services/api.service';
import { useNotificationStore } from '../../store/notification.store';

// Customer Waiting Popup Component (120 second countdown) - Original UI Style
export default function CustomerWaitingPopup() {
    const {
        showWaitingPopup,
        waitingBookingInfo,
        showCustomerTimeoutModal,
        closeWaitingPopup,
        showCustomerAcceptedModal,
        showCustomerRejectedModal
    } = useBookingModalStore();

    const { addNotification } = useNotificationStore();

    const [remainingTime, setRemainingTime] = useState(120);

    // Reset timer when popup opens with new booking
    useEffect(() => {
        if (showWaitingPopup && waitingBookingInfo) {
            console.log('🕐 Waiting popup opened for booking:', waitingBookingInfo.bookingId);
            console.log('🕐 Expires at:', new Date(waitingBookingInfo.expiresAt).toLocaleTimeString());
            const remaining = Math.max(0, Math.floor((waitingBookingInfo.expiresAt - Date.now()) / 1000));
            setRemainingTime(remaining > 0 ? remaining : 120);
        }
    }, [showWaitingPopup, waitingBookingInfo?.bookingId]);

    // Polling to check booking status (backup for socket)
    useEffect(() => {
        if (!showWaitingPopup || !waitingBookingInfo?.bookingId) return;

        const bookingId = waitingBookingInfo.bookingId;
        const customerId = localStorage.getItem("userId") || "";

        const checkStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getBookingById/${bookingId}`);
                if (!res.ok) return;

                const data = await res.json();
                const booking = data.data || data;

                if (!booking) return;

                const status = (booking.status || '').toLowerCase();
                const vehicleName = booking.vehicleName || booking.VehicleName || waitingBookingInfo.vehicleName;
                const ownerName = booking.ownerName || 'Owner';

                console.log(`🔍 Polling booking ${bookingId}: status=${status}`);

                if (status === 'confirmed' || status === 'accepted') {
                    // Accepted!
                    addNotification({
                        type: 'booking_confirmed',
                        title: 'Booking Confirmed!',
                        message: `Your booking for ${vehicleName} has been accepted.`,
                        vehicleName: vehicleName,
                        bookingId: bookingId,
                        userId: customerId,
                    });
                    showCustomerAcceptedModal(vehicleName, ownerName);
                } else if (status === 'cancelled' || status === 'rejected') {
                    // Rejected!
                    addNotification({
                        type: 'booking_declined',
                        title: 'Booking Declined',
                        message: `Your booking for ${vehicleName} was declined.`,
                        vehicleName: vehicleName,
                        bookingId: bookingId,
                        userId: customerId,
                    });
                    showCustomerRejectedModal(vehicleName, ownerName);
                } else if (status === 'timeout') {
                    // Timeout!
                    showCustomerTimeoutModal(vehicleName);
                }
            } catch (err) {
                console.error("Error polling booking status:", err);
            }
        };

        const pollInterval = setInterval(checkStatus, 3000); // Check every 3 seconds
        return () => clearInterval(pollInterval);
    }, [showWaitingPopup, waitingBookingInfo?.bookingId, showCustomerAcceptedModal, showCustomerRejectedModal, showCustomerTimeoutModal, addNotification]);

    // Countdown timer
    useEffect(() => {
        if (!showWaitingPopup || !waitingBookingInfo) return;

        console.log('🕐 Starting countdown timer, remaining:', remainingTime);

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((waitingBookingInfo.expiresAt - Date.now()) / 1000));
            setRemainingTime(remaining);

            if (remaining <= 0) {
                console.log('🕐 Timer expired - showing timeout modal');
                clearInterval(interval);
                const vehicleName = waitingBookingInfo.vehicleName;
                showCustomerTimeoutModal(vehicleName);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [showWaitingPopup, waitingBookingInfo?.bookingId, waitingBookingInfo?.expiresAt, showCustomerTimeoutModal]);

    // "Cancel Waiting" used to only close this popup locally — the booking
    // stayed "Pending" in the database, so the auto-cancel cron would catch
    // it ~120s later and fire a second "Auto-Cancelled" notification on top
    // of a cancellation the customer already thought they'd made.
    const handleCancelWaiting = async () => {
        const bookingId = waitingBookingInfo?.bookingId;
        if (bookingId) {
            try {
                await fetch(`${API_BASE_URL}/updateBooking/${bookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify({ status: 'Cancelled' }),
                });
            } catch (err) {
                console.error('Error cancelling booking:', err);
            }
        }
        closeWaitingPopup();
    };

    if (!showWaitingPopup || !waitingBookingInfo) return null;

    // Circular progress variables
    const radius = 45;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const total = 120;
    const progress = Math.max(0, Math.min(1, remainingTime / total));
    const offset = circumference * (1 - progress);

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                style={{ backdropFilter: "blur(12px)" }}
            />

            {/* Popup card - slides up from bottom */}
            <div
                className="relative w-full bg-white rounded-t-3xl shadow-2xl pb-8 pt-6 px-6 animate-slideUp"
                style={{ maxWidth: "600px" }}
            >
                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
                    Waiting for response!
                </h2>

                {/* Vehicle Name */}
                {waitingBookingInfo.vehicleName && (
                    <p className="text-center text-sm text-gray-600 mb-2">
                        {waitingBookingInfo.vehicleName}
                    </p>
                )}

                {/* Grey line separator */}
                <div className="w-full h-px bg-gray-300 my-5" />

                {/* Progress bars (top mini indicators) */}
                <div className="flex justify-center gap-3 mb-8 px-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex-1 h-1.5 rounded-full transition-opacity duration-300"
                            style={{
                                background: "linear-gradient(to right, #1A2980, #26D0CE)",
                                opacity: i < Math.floor(progress * 4) ? 1 : 0.28,
                            }}
                        />
                    ))}
                </div>

                {/* Circular timer */}
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-3">
                        <svg
                            width="128"
                            height="128"
                            viewBox="0 0 128 128"
                            style={{ transform: "rotate(-90deg)" }}
                        >
                            <defs>
                                <linearGradient id="waitingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1A2980" />
                                    <stop offset="100%" stopColor="#26D0CE" />
                                </linearGradient>
                            </defs>

                            {/* Background circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="#E5E7EB"
                                strokeWidth={strokeWidth}
                                fill="none"
                            />

                            {/* Progress circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="url(#waitingGrad)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                fill="none"
                                style={{ transition: "stroke-dashoffset 0.45s ease" }}
                            />
                        </svg>

                        {/* Clock icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                <defs>
                                    <linearGradient id="waitingClockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#1A2980" />
                                        <stop offset="100%" stopColor="#26D0CE" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="url(#waitingClockGrad)"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                <path d="M12 6V12L16 14" stroke="url(#waitingClockGrad)" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Timer text */}
                    <p className="text-lg font-bold text-gray-800">{remainingTime} sec</p>
                </div>

                {/* Cancel button */}
                <div className="mt-6 px-4">
                    <button
                        onClick={handleCancelWaiting}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition font-medium"
                    >
                        Cancel Waiting
                    </button>
                </div>
            </div>
        </div>
    );
}
