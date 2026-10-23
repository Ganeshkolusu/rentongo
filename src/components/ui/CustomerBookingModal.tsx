import React, { useEffect, useRef } from 'react';
import { Check, X, XCircle, Clock } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useBookingModalStore } from '../../store/booking-modal.store';
import { useNotificationStore } from '../../store/notification.store';
import { SOCKET_URL } from '../../services/api.service';

const SOUND_2_REJECTION = "/sounds/WhatsApp Audio 2025-11-26 at 12.30.04.mp3"; // Customer: Rejection

// Customer Booking Status Modal Component
export default function CustomerBookingModal() {
    const {
        showCustomerModal,
        customerModalType,
        customerBookingInfo,
        closeCustomerModal
    } = useBookingModalStore();

    const { addNotification } = useNotificationStore();

    const socketRef = useRef<Socket | null>(null);
    const rejectionAudioRef = useRef<HTMLAudioElement | null>(null);
    const customerId = localStorage.getItem("userId") || "";

    // Play Sound 3: Rejection/Timeout sound for customer
    const playRejectionSound = () => {
        try {
            if (!rejectionAudioRef.current) {
                rejectionAudioRef.current = new Audio(SOUND_2_REJECTION);
            }
            rejectionAudioRef.current.currentTime = 0;
            rejectionAudioRef.current.play().catch(err => console.log("Rejection audio play failed:", err));
        } catch (error) {
            console.log("Could not play rejection sound:", error);
        }
    };

    // Initialize Socket.io for customer
    useEffect(() => {
        if (!customerId) return;

        socketRef.current = io(SOCKET_URL, {
            query: { userId: customerId },
            transports: ['polling', 'websocket'],
            reconnection: true
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Global Socket connected for customer:', customerId);
        });

        socketRef.current.on('booking-status-update', (data: {
            bookingId: string;
            customerId?: string;
            status: 'accepted' | 'rejected' | 'timeout';
            vehicleName?: string;
            ownerName?: string;
        }) => {
            console.log('🔔 Booking status update received (customer):', data);

            // Only process if this event is meant for this customer
            if (data.customerId && data.customerId !== customerId) {
                console.log('Ignoring status update - not for this customer');
                return;
            }

            // Get the current waiting booking info
            const currentWaitingBooking = useBookingModalStore.getState().waitingBookingInfo;
            const isWaitingPopupOpen = useBookingModalStore.getState().showWaitingPopup;

            // Only process if we have a waiting popup open
            if (!isWaitingPopupOpen && !currentWaitingBooking) {
                console.log('Ignoring status update - no waiting popup open');
                return;
            }

            // If we have a specific booking we're waiting for, check if this event is for that booking
            if (currentWaitingBooking && currentWaitingBooking.bookingId &&
                data.bookingId && currentWaitingBooking.bookingId !== data.bookingId) {
                console.log('Ignoring status update - not for current waiting booking');
                return;
            }

            // Close waiting popup and show appropriate result modal
            if (data.status === 'accepted') {
                // Add notification for customer - booking accepted
                addNotification({
                    type: 'booking_confirmed',
                    title: 'Booking Confirmed!',
                    message: `Your booking for ${data.vehicleName || 'the vehicle'} has been accepted by the owner.`,
                    vehicleName: data.vehicleName,
                    bookingId: data.bookingId,
                    userId: customerId, // Include userId for backend sync
                });

                useBookingModalStore.getState().showCustomerAcceptedModal(
                    data.vehicleName,
                    data.ownerName
                );
            } else if (data.status === 'rejected') {
                // Add notification for customer - booking rejected
                addNotification({
                    type: 'booking_declined',
                    title: 'Booking Declined',
                    message: `Your booking for ${data.vehicleName || 'the vehicle'} was declined by the owner.`,
                    vehicleName: data.vehicleName,
                    bookingId: data.bookingId,
                    userId: customerId, // Include userId for backend sync
                });

                // Play Sound 3: Rejection buzzer for customer
                playRejectionSound();
                useBookingModalStore.getState().showCustomerRejectedModal(
                    data.vehicleName,
                    data.ownerName
                );
            } else if (data.status === 'timeout') {
                // Add notification for customer - booking timed out
                addNotification({
                    type: 'booking_timeout',
                    title: 'Booking Auto-Cancelled',
                    message: `Your booking for ${data.vehicleName || 'the vehicle'} was auto-cancelled because the owner did not respond in time.`,
                    vehicleName: data.vehicleName,
                    bookingId: data.bookingId,
                    userId: customerId, // Include userId for backend sync
                });

                // Play Sound 3: Timeout buzzer for customer (same as rejection)
                playRejectionSound();
                useBookingModalStore.getState().showCustomerTimeoutModal(
                    data.vehicleName
                );
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [customerId]);

    // Play rejection sound when modal shows with rejected or timeout type
    useEffect(() => {
        if (showCustomerModal && (customerModalType === 'rejected' || customerModalType === 'timeout')) {
            console.log('🔊 Playing rejection sound for customer modal type:', customerModalType);
            playRejectionSound();
        }
    }, [showCustomerModal, customerModalType]);

    if (!showCustomerModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999] p-4">
            {/* Accepted Modal - Matching Figma Design */}
            {customerModalType === 'accepted' && (
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-fadeIn">
                    <div className="text-center">
                        {/* Blue circle with white checkmark */}
                        <div className="w-24 h-24 bg-[#4AC9E3] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="text-white" size={48} strokeWidth={3} />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Your booking is confirmed
                        </h2>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            with the owner
                        </h3>

                        <p className="text-gray-500 text-sm mb-8">
                            Please meet at the pickup point and complete the process offline.
                        </p>



                        <button
                            onClick={closeCustomerModal}
                            className="w-full py-3 rounded-xl text-white font-semibold
                         bg-[#4AC9E3] hover:bg-[#3BB8D2] transition-colors"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}

            {/* Rejected Modal */}
            {customerModalType === 'rejected' && (
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 relative animate-fadeIn">
                    <button
                        onClick={closeCustomerModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                            <XCircle className="text-red-600" size={48} />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Booking Declined
                        </h2>

                        <p className="text-gray-600 text-lg mb-6">
                            Unfortunately, your booking request was not accepted by the owner. Please try another vehicle.
                        </p>

                        {customerBookingInfo?.vehicleName && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                                <p className="text-red-800 font-bold text-lg">
                                    {customerBookingInfo.vehicleName}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={closeCustomerModal}
                            className="w-full py-3 rounded-xl text-white font-semibold
                         bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90"
                        >
                            Browse Other Vehicles
                        </button>
                    </div>
                </div>
            )}

            {/* Timeout/Autocancelled Modal */}
            {customerModalType === 'timeout' && (
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 relative animate-fadeIn">
                    <button
                        onClick={closeCustomerModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                            <Clock className="text-orange-600" size={48} />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Booking Autocancelled
                        </h2>

                        <p className="text-gray-600 text-lg mb-6">
                            The owner did not respond within the time limit. Your booking has been automatically cancelled. Please try booking again or choose another vehicle.
                        </p>

                        {customerBookingInfo?.vehicleName && (
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
                                <p className="text-orange-800 font-bold text-lg">
                                    {customerBookingInfo.vehicleName}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={closeCustomerModal}
                            className="w-full py-3 rounded-xl text-white font-semibold
                         bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90"
                        >
                            Browse Other Vehicles
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
