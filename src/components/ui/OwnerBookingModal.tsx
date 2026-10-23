




// import React, { useEffect, useRef, useState } from 'react';
// import { Check, X, Loader2, Clock, Truck, AlertTriangle } from 'lucide-react';
// import io, { Socket } from 'socket.io-client';
// import { useBookingModalStore, PendingBooking } from '../../store/booking-modal.store';
// import { useNotificationStore } from '../../store/notification.store';
// import { API_BASE_URL, SOCKET_URL } from '../../services/api.service';

// const EXPIRY_TIME = 2 * 60 * 1000; // 120 seconds
// const WARNING_TIME = 19 * 1000; // 18 seconds before expiry (as per requirements)

// // Sound file paths
// const SOUND_NEW_BOOKING = "/sounds/new-booking.mp3"; // Owner: New booking
// const SOUND_WARNING = "/sounds/WhatsApp Audio 2025-11-26 at 12.29.55.mp3"; // Owner: 18 sec warning
// const SOUND_AUTO_CANCEL = "/sounds/WhatsApp Audio 2025-11-26 at 12.30.04.mp3"; // Owner: Auto-cancel sound

// // ============================================================================
// // GLOBAL SOUND MANAGER - Prevents double playback and manages audio lifecycle
// // ============================================================================
// class GlobalSoundManager {
//     private currentAudio: HTMLAudioElement | null = null;
//     private playedSounds: Map<string, Set<string>> = new Map(); // bookingId -> Set of sound types
//     private isPlaying: boolean = false;

//     /**
//      * Play a sound only once per booking
//      * @param soundUrl - URL of the sound file
//      * @param bookingId - Unique booking identifier
//      * @param soundType - Type of sound (new_booking, warning, auto_cancel)
//      * @returns Promise<boolean> - true if sound was played, false if already played
//      */
//     async playSound(soundUrl: string, bookingId: string, soundType: string): Promise<boolean> {
//         // Check if this sound has already been played for this booking
//         if (this.hasPlayed(bookingId, soundType)) {
//             console.log(`🔇 Sound already played: ${soundType} for booking ${bookingId}`);
//             return false;
//         }

//         // CRITICAL: Stop any currently playing sound BEFORE starting new one
//         this.stopCurrentSound();

//         try {
//             this.currentAudio = new Audio(soundUrl);
//             this.isPlaying = true;

//             // Mark as played BEFORE starting playback to prevent race conditions
//             this.markAsPlayed(bookingId, soundType);

//             console.log(`🔊 Starting to play ${soundType} sound for booking: ${bookingId}`);
//             await this.currentAudio.play();

//             // Clean up after playback
//             this.currentAudio.onended = () => {
//                 this.isPlaying = false;
//                 this.currentAudio = null;
//                 console.log(`✅ Finished playing ${soundType} sound`);
//             };

//             this.currentAudio.onerror = (error) => {
//                 console.error(`❌ Error playing ${soundType} sound:`, error);
//                 this.isPlaying = false;
//                 this.currentAudio = null;
//             };

//             return true;
//         } catch (error) {
//             console.error(`❌ Failed to play ${soundType} sound:`, error);
//             this.isPlaying = false;
//             this.currentAudio = null;
//             return false;
//         }
//     }

//     /**
//      * Stop the currently playing sound immediately
//      */
//     stopCurrentSound(): void {
//         if (this.currentAudio) {
//             try {
//                 this.currentAudio.pause();
//                 this.currentAudio.currentTime = 0;
//                 this.currentAudio.onended = null;
//                 this.currentAudio.onerror = null;
//                 this.currentAudio = null;
//                 this.isPlaying = false;
//                 console.log('🔇 Stopped current sound');
//             } catch (error) {
//                 console.error('Error stopping sound:', error);
//                 this.currentAudio = null;
//                 this.isPlaying = false;
//             }
//         }
//     }

//     /**
//      * Check if a sound has been played for a booking
//      */
//     private hasPlayed(bookingId: string, soundType: string): boolean {
//         const sounds = this.playedSounds.get(bookingId);
//         return sounds ? sounds.has(soundType) : false;
//     }

//     /**
//      * Mark a sound as played for a booking
//      */
//     private markAsPlayed(bookingId: string, soundType: string): void {
//         if (!this.playedSounds.has(bookingId)) {
//             this.playedSounds.set(bookingId, new Set());
//         }
//         this.playedSounds.get(bookingId)!.add(soundType);
//     }

//     /**
//      * Clear all played sounds for a specific booking (cleanup)
//      */
//     clearBooking(bookingId: string): void {
//         this.playedSounds.delete(bookingId);
//         console.log(`🧹 Cleared sound tracker for booking: ${bookingId}`);
//     }

//     /**
//      * Check if any sound is currently playing
//      */
//     isCurrentlyPlaying(): boolean {
//         return this.isPlaying;
//     }

//     /**
//      * Cleanup all sounds and reset manager
//      */
//     cleanup(): void {
//         this.stopCurrentSound();
//         this.playedSounds.clear();
//     }
// }

// // Global instance - singleton pattern
// const soundManager = new GlobalSoundManager();

// export default function OwnerBookingModal() {
//     const {
//         showOwnerModal,
//         setShowOwnerModal,
//         currentBooking,
//         setCurrentBooking,
//         bookingQueue,
//         setBookingQueue,
//         addBookingToQueue,
//         removeBookingFromQueue,
//         actionLoading,
//         setActionLoading
//     } = useBookingModalStore();

//     const socketRef = useRef<Socket | null>(null);
//     const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
//     const warningTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
//     const [socketConnected, setSocketConnected] = useState(false);
//     const ownerId = localStorage.getItem("userId") || "";

//     const { addNotification, updateNotificationStatus } = useNotificationStore();

//     // ============================================================================
//     // WARNING TIMER - Plays sound 18 seconds before expiry
//     // ============================================================================
//     useEffect(() => {
//         if (!currentBooking) return;

//         const bookingId = currentBooking._id || currentBooking.id || '';
//         const timeUntilWarning = (currentBooking.expiresAt || 0) - Date.now() - WARNING_TIME;

//         // Schedule warning sound 18 seconds before expiry
//         if (timeUntilWarning > 0 && !warningTimersRef.current[bookingId]) {
//             console.log(`⏰ Scheduling warning sound in ${timeUntilWarning}ms for booking ${bookingId}`);

//             warningTimersRef.current[bookingId] = setTimeout(() => {
//                 // Stop new booking sound if it's still playing
//                 soundManager.stopCurrentSound();

//                 // Play warning sound
//                 soundManager.playSound(SOUND_WARNING, bookingId, 'warning');
//                 console.log('⚠️ Playing 19-second warning sound');
//             }, timeUntilWarning);
//         }

//         // Monitor for auto-expiry
//         const interval = setInterval(() => {
//             const remaining = (currentBooking.expiresAt || 0) - Date.now();

//             if (remaining <= 0) {
//                 clearInterval(interval);
//                 expireBooking(bookingId);
//             }
//         }, 500);

//         return () => {
//             clearInterval(interval);
//             if (warningTimersRef.current[bookingId]) {
//                 clearTimeout(warningTimersRef.current[bookingId]);
//                 delete warningTimersRef.current[bookingId];
//             }
//         };
//     }, [currentBooking]);

//     // ============================================================================
//     // SOCKET INITIALIZATION
//     // ============================================================================
//     useEffect(() => {
//         if (!ownerId) {
//             console.log('⚠️ No ownerId found, socket not initialized');
//             return;
//         }

//         console.log('🔌 Initializing owner socket for:', ownerId);

//         socketRef.current = io(SOCKET_URL, {
//             query: { userId: ownerId },
//             transports: ['websocket', 'polling'],
//             reconnection: true,
//             reconnectionAttempts: 10,
//             reconnectionDelay: 1000,
//             timeout: 20000
//         });

//         socketRef.current.on('connect', () => {
//             console.log('✅ Socket connected for owner:', ownerId);
//             setSocketConnected(true);
//             fetchPendingBookings();
//         });

//         socketRef.current.on('disconnect', () => {
//             console.log('❌ Socket disconnected for owner:', ownerId);
//             setSocketConnected(false);
//         });

//         socketRef.current.on('reconnect', (attemptNumber: number) => {
//             console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
//             setSocketConnected(true);
//             fetchPendingBookings();
//         });

//         socketRef.current.on('new-booking-request', (data: PendingBooking) => {
//             console.log('🔔 New booking received via socket:', data);
//             handleNewBooking(data);
//         });

//         socketRef.current.on('booking-created', (data: PendingBooking) => {
//             console.log('🔔 Booking created event received:', data);
//             handleNewBooking(data);
//         });

//         return () => {
//             console.log('🔌 Cleaning up owner socket');
//             if (socketRef.current) socketRef.current.disconnect();
//             Object.values(timersRef.current).forEach(clearTimeout);
//             Object.values(warningTimersRef.current).forEach(clearTimeout);
//             soundManager.cleanup();
//         };
//     }, [ownerId]);

//     // ============================================================================
//     // POLLING BACKUP
//     // ============================================================================
//     useEffect(() => {
//         if (ownerId) {
//             fetchPendingBookings();

//             const pollInterval = setInterval(() => {
//                 fetchPendingBookings();
//             }, 5000);

//             return () => clearInterval(pollInterval);
//         }
//     }, [ownerId]);

//     // ============================================================================
//     // AUTO-SHOW MODAL
//     // ============================================================================
//     useEffect(() => {
//         if (!currentBooking && bookingQueue.length > 0) {
//             showNextBooking();
//         }
//     }, [currentBooking, bookingQueue]);

//     // ============================================================================
//     // FETCH PENDING BOOKINGS
//     // ============================================================================
//     const fetchPendingBookings = async () => {
//         try {
//             const res = await fetch(`${API_BASE_URL}/getPendingBookingsOfOwner/${ownerId}`);
//             if (!res.ok) {
//                 throw new Error('Failed to fetch bookings');
//             }

//             const data = await res.json();

//             let bookings: PendingBooking[] = [];
//             if (Array.isArray(data)) {
//                 bookings = data;
//             } else if (data.data && Array.isArray(data.data)) {
//                 bookings = data.data;
//             } else if (data.bookings && Array.isArray(data.bookings)) {
//                 bookings = data.bookings;
//             }

//             const pending = bookings.filter((b) => {
//                 const statusLower = (b.status || '').toLowerCase();
//                 return statusLower === 'pending' || statusLower === '';
//             });

//             const currentQueue = useBookingModalStore.getState().bookingQueue;
//             const currentIds = new Set(currentQueue.map(b => b._id || b.id));

//             const bookingsWithTime = pending.map((booking) => ({
//                 ...booking,
//                 receivedAt: new Date(booking.createdAt || booking.CreatedAt || Date.now()).getTime(),
//                 expiresAt: new Date(booking.createdAt || booking.CreatedAt || Date.now()).getTime() + EXPIRY_TIME
//             }));

//             // Check for NEW bookings - play sound ONCE for each new booking
//             const newBookings = bookingsWithTime.filter(b => !currentIds.has(b._id || b.id));

//             if (newBookings.length > 0) {
//                 console.log('🆕 Found', newBookings.length, 'new pending booking(s)');

//                 // Play sound ONCE for the first new booking only
//                 const firstNewBooking = newBookings[0];
//                 const bookingId = firstNewBooking._id || firstNewBooking.id || '';
//                 soundManager.playSound(SOUND_NEW_BOOKING, bookingId, 'new_booking');
//             }

//             setBookingQueue(bookingsWithTime);

//             bookingsWithTime.forEach((booking) => {
//                 startExpiryTimer(booking);
//             });

//             const hasCurrentBooking = useBookingModalStore.getState().currentBooking;

//             if (bookingsWithTime.length > 0 && !hasCurrentBooking) {
//                 const nextBooking = bookingsWithTime[0];
//                 setCurrentBooking(nextBooking);
//                 setShowOwnerModal(true);
//             }

//         } catch (error) {
//             console.error('Error fetching bookings:', error);
//         }
//     };

//     // ============================================================================
//     // HANDLE NEW BOOKING
//     // ============================================================================
//     // HANDLE NEW BOOKING
//     // ============================================================================
//     // ============================================================================
//     // HANDLE NEW BOOKING
//     // ============================================================================
//     const handleNewBooking = (booking: PendingBooking) => {
//         const bookingOwnerId = booking.ownerId || booking.OwnerId;
//         if (bookingOwnerId !== ownerId) {
//             console.log('Skipping booking - not for this owner');
//             return;
//         }

//         const bookingId = booking._id || booking.id || '';

//         const existingBooking = bookingQueue.find(b =>
//             (b._id || b.id) === bookingId
//         );

//         if (existingBooking) {
//             console.log('⚠️ Booking already in queue, skipping');
//             return;
//         }

//         console.log('🆕 New booking received via socket');

//         // Stop any currently playing sound and play new booking sound
//         soundManager.stopCurrentSound();
//         soundManager.playSound(SOUND_NEW_BOOKING, bookingId, 'new_booking');

//         const bookingWithTime: PendingBooking = {
//             ...booking,
//             receivedAt: Date.now(),
//             expiresAt: Date.now() + EXPIRY_TIME
//         };
//         const vehicleName = booking.vehicleName || booking.VehicleName || 'your vehicle';
//         const customerName = booking.contactName || booking.customerName || 'A customer';

//         addNotification({
//             type: 'new_booking',
//             title: 'Your car has been booked?',
//             message: `${customerName} requested to book ${vehicleName}.`,
//             vehicleName: vehicleName,
//             vehicleId: booking.VechileId || booking.vehicleId,
//             bookingId: bookingId,
//             userId: ownerId,
//             bookingStatus: 'Pending',
//             customerName: customerName,
//             fromDate: booking.FromDate || booking.fromDate,
//             toDate: booking.ToDate || booking.toDate,
//             totalPrice: booking.totalPrice,
//         });

//         addBookingToQueue(bookingWithTime);
//         startExpiryTimer(bookingWithTime);

//         if (!currentBooking) {
//             setCurrentBooking(bookingWithTime);
//             setShowOwnerModal(true);
//         }
//     };

//     // ============================================================================
//     // EXPIRY TIMER
//     // ============================================================================
//     const startExpiryTimer = (booking: PendingBooking) => {
//         const bookingId = booking._id || booking.id || '';

//         if (timersRef.current[bookingId]) {
//             clearTimeout(timersRef.current[bookingId]);
//         }

//         const timeUntilExpiry = (booking.expiresAt || 0) - Date.now();

//         if (timeUntilExpiry > 0) {
//             console.log(`⏰ Setting expiry timer for ${bookingId}: ${timeUntilExpiry}ms`);
//             timersRef.current[bookingId] = setTimeout(() => {
//                 expireBooking(bookingId);
//             }, timeUntilExpiry);
//         } else {
//             console.log(`⚠️ Booking ${bookingId} already expired`);
//             expireBooking(bookingId);
//         }
//     };

//     // ============================================================================
//     // EXPIRE BOOKING
//     // ============================================================================
//     const expireBooking = async (bookingId: string) => {
//         console.log('⏱️ AUTO-CANCELLING booking (timeout):', bookingId);

//         const expiredBooking = bookingQueue.find(b => (b._id || b.id) === bookingId) || currentBooking;
//         const customerId = expiredBooking?.userId || expiredBooking?.customerId;
//         const vehicleName = expiredBooking?.vehicleName || expiredBooking?.VehicleName;

//         // Play auto-cancel sound (will automatically stop any playing sound)
//         await soundManager.playSound(SOUND_AUTO_CANCEL, bookingId, 'auto_cancel');

//         try {
//             await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Cancelled`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             updateNotificationStatus(bookingId, 'Expired');

//             if (socketRef.current?.connected && customerId) {
//                 socketRef.current.emit('booking-status-update', {
//                     bookingId,
//                     customerId,
//                     status: 'timeout',
//                     ownerId,
//                     vehicleName
//                 });
//             }

//             removeBookingFromQueue(bookingId);

//             if (currentBooking && (currentBooking._id || currentBooking.id) === bookingId) {
//                 setCurrentBooking(null);
//                 setShowOwnerModal(false);
//             }

//             if (timersRef.current[bookingId]) {
//                 clearTimeout(timersRef.current[bookingId]);
//                 delete timersRef.current[bookingId];
//             }

//             if (warningTimersRef.current[bookingId]) {
//                 clearTimeout(warningTimersRef.current[bookingId]);
//                 delete warningTimersRef.current[bookingId];
//             }

//             // Cleanup sound tracker after delay
//             setTimeout(() => {
//                 soundManager.clearBooking(bookingId);
//             }, 5000);

//         } catch (error) {
//             console.error('Error expiring booking:', error);
//         }
//     };

//     // ============================================================================
//     // SHOW NEXT BOOKING
//     // ============================================================================
//     const showNextBooking = () => {
//         if (bookingQueue.length === 0) return;

//         const nextBooking = bookingQueue[0];
//         setCurrentBooking(nextBooking);
//         setShowOwnerModal(true);
//     };

//     // ============================================================================
//     // HANDLE CONFIRM
//     // ============================================================================
//     const handleConfirm = async () => {
//         if (!currentBooking) return;

//         const bookingId = currentBooking._id || currentBooking.id || '';
//         const customerId = currentBooking.userId || currentBooking.customerId;
//         const vehicleName = currentBooking.vehicleName || currentBooking.VehicleName;

//         // Stop all sounds
//         soundManager.stopCurrentSound();

//         setActionLoading(true);

//         try {
//             const res = await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Confirmed`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (!res.ok) throw new Error('Failed to confirm booking');

//             console.log('✅ Booking confirmed:', bookingId);

//             updateNotificationStatus(bookingId, 'Confirmed');

//             if (socketRef.current?.connected && customerId) {
//                 socketRef.current.emit('booking-status-update', {
//                     bookingId,
//                     customerId,
//                     status: 'accepted',
//                     ownerId,
//                     vehicleName
//                 });
//             }

//             if (timersRef.current[bookingId]) {
//                 clearTimeout(timersRef.current[bookingId]);
//                 delete timersRef.current[bookingId];
//             }

//             if (warningTimersRef.current[bookingId]) {
//                 clearTimeout(warningTimersRef.current[bookingId]);
//                 delete warningTimersRef.current[bookingId];
//             }

//             soundManager.clearBooking(bookingId);

//             removeBookingFromQueue(bookingId);
//             setCurrentBooking(null);
//             setShowOwnerModal(false);
//             setActionLoading(false);

//         } catch (error: any) {
//             console.error('Error confirming booking:', error);
//             alert(`Error: ${error.message}`);
//             setActionLoading(false);
//         }
//     };

//     // ============================================================================
//     // HANDLE REJECT
//     // ============================================================================
//     const handleReject = async () => {
//         if (!currentBooking) return;

//         const bookingId = currentBooking._id || currentBooking.id || '';
//         const customerId = currentBooking.userId || currentBooking.customerId;
//         const vehicleName = currentBooking.vehicleName || currentBooking.VehicleName;

//         // Stop all sounds
//         soundManager.stopCurrentSound();

//         setActionLoading(true);

//         try {
//             const res = await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Cancelled`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (!res.ok) throw new Error('Failed to reject booking');

//             console.log('❌ Booking rejected:', bookingId);

//             updateNotificationStatus(bookingId, 'Rejected');

//             if (socketRef.current?.connected && customerId) {
//                 socketRef.current.emit('booking-status-update', {
//                     bookingId,
//                     customerId,
//                     status: 'rejected',
//                     ownerId,
//                     vehicleName
//                 });
//             }

//             if (timersRef.current[bookingId]) {
//                 clearTimeout(timersRef.current[bookingId]);
//                 delete timersRef.current[bookingId];
//             }

//             if (warningTimersRef.current[bookingId]) {
//                 clearTimeout(warningTimersRef.current[bookingId]);
//                 delete warningTimersRef.current[bookingId];
//             }

//             soundManager.clearBooking(bookingId);

//             removeBookingFromQueue(bookingId);
//             setCurrentBooking(null);
//             setShowOwnerModal(false);
//             setActionLoading(false);

//         } catch (error: any) {
//             console.error('Error rejecting booking:', error);
//             alert(`Error: ${error.message}`);
//             setActionLoading(false);
//         }
//     };

//     // ============================================================================
//     // TIME DISPLAY
//     // ============================================================================
//     const getRemainingTime = (booking: PendingBooking) => {
//         const now = Date.now();
//         const remaining = (booking.expiresAt || 0) - now;

//         if (remaining <= 0) return '00:00';

//         const minutes = Math.floor(remaining / 60000);
//         const seconds = Math.floor((remaining % 60000) / 1000);

//         return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//     };

//     const TimeDisplay = ({ booking }: { booking: PendingBooking }) => {
//         const [time, setTime] = useState(getRemainingTime(booking));

//         useEffect(() => {
//             const interval = setInterval(() => {
//                 setTime(getRemainingTime(booking));
//             }, 1000);

//             return () => clearInterval(interval);
//         }, [booking]);

//         const remaining = (booking.expiresAt || 0) - Date.now();
//         const isExpiring = remaining < 30000;
//         const isCritical = remaining < 10000;

//         return (
//             <span className={`font-mono font-bold text-xl ${isCritical ? 'text-red-600 animate-pulse' : isExpiring ? 'text-orange-600 animate-pulse' : 'text-blue-600'}`}>
//                 {time}
//             </span>
//         );
//     };

//     if (!ownerId || !showOwnerModal || !currentBooking) return null;

//     const remaining = (currentBooking.expiresAt || 0) - Date.now();
//     const isCritical = remaining < 10000;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
//             <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn ${isCritical ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}>
//                 <button
//                     onClick={() => {
//                         soundManager.stopCurrentSound();
//                         setShowOwnerModal(false);
//                         setCurrentBooking(null);
//                     }}
//                     className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//                     disabled={actionLoading}
//                 >
//                     <X size={24} />
//                 </button>

//                 <div className="text-center">
//                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isCritical ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
//                         <Truck className={isCritical ? 'text-red-600' : 'text-blue-600'} size={48} />
//                     </div>

//                     <h2 className="text-2xl font-semibold mb-2">
//                         You've got a new booking!
//                     </h2>

//                     <div className={`flex items-center justify-center gap-2 mb-6 p-3 rounded-xl ${isCritical ? 'bg-red-50' : 'bg-gray-50'}`}>
//                         <Clock size={24} className={isCritical ? 'text-red-600' : 'text-orange-600'} />
//                         <TimeDisplay booking={currentBooking} />
//                         <span className="text-sm text-gray-500">remaining</span>
//                     </div>

//                     {isCritical && (
//                         <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex items-center justify-center gap-2">
//                             <AlertTriangle size={20} />
//                             <span className="font-semibold">Hurry! Time is running out!</span>
//                         </div>
//                     )}

//                     <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
//                         <p className="font-bold text-lg text-gray-800 mb-2">
//                             {currentBooking.vehicleName || currentBooking.VehicleName || 'Vehicle'}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                             Customer: {currentBooking.contactName || currentBooking.customerName || 'N/A'}
//                         </p>
//                         {currentBooking.totalPrice && (
//                             <p className="text-sm text-gray-600">
//                                 Total: ₹{currentBooking.totalPrice}
//                             </p>
//                         )}
//                     </div>

//                     <button
//                         onClick={handleConfirm}
//                         disabled={actionLoading}
//                         className="w-full py-3 rounded-xl text-white font-semibold
//                        bg-gradient-to-r from-green-600 to-green-400 hover:opacity-90 mb-4
//                        disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                         {actionLoading ? (
//                             <Loader2 className="animate-spin" size={20} />
//                         ) : (
//                             <>
//                                 <Check size={20} />
//                                 Accept Booking
//                             </>
//                         )}
//                     </button>

//                     <button
//                         onClick={handleReject}
//                         disabled={actionLoading}
//                         className="w-full py-3 rounded-xl font-semibold
//                        border border-red-500 text-red-600 hover:bg-red-50
//                        disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                         {actionLoading ? (
//                             <Loader2 className="animate-spin" size={20} />
//                         ) : (
//                             <>
//                                 <X size={20} />
//                                 Reject Booking
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: scale(0.9);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//         </div>
//     );
// }

















import React, { useEffect, useRef, useState } from 'react';
import { Check, X, Loader2, Clock, Truck, AlertTriangle } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useBookingModalStore, PendingBooking } from '../../store/booking-modal.store';
import { useNotificationStore } from '../../store/notification.store';
import { API_BASE_URL, SOCKET_URL } from '../../services/api.service';

const EXPIRY_TIME = 2 * 60 * 1000; // 120 seconds
const WARNING_TIME = 20 * 1000; // 20 seconds before expiry

// Sound file paths
const SOUND_NEW_BOOKING = "/sounds/new-booking.mp3";
const SOUND_WARNING = "/sounds/WhatsApp Audio 2025-11-26 at 12.29.55.mp3";
const SOUND_AUTO_CANCEL = "/sounds/WhatsApp Audio 2025-11-26 at 12.30.04.mp3";

// ============================================================================
// GLOBAL SOUND MANAGER - Fixed version with proper tracking
// ============================================================================
class GlobalSoundManager {
    private currentAudio: HTMLAudioElement | null = null;
    private playedSounds: Map<string, Set<string>> = new Map();
    private isPlaying: boolean = false;

    /**
     * Play new booking sound (always plays, no tracking)
     */
    async playNewBookingSound(bookingId: string): Promise<void> {
        console.log(`🔊 Playing NEW BOOKING sound for: ${bookingId}`);
        this.stopCurrentSound();

        try {
            const audio = new Audio(SOUND_NEW_BOOKING);
            this.currentAudio = audio;
            this.isPlaying = true;

            let playCount = 0;
            const maxPlays = 2; // Play twice

            const playNext = () => {
                playCount++;
                if (playCount < maxPlays) {
                    audio.currentTime = 0;
                    audio.play().catch(err => console.log("Audio play failed:", err));
                } else {
                    this.isPlaying = false;
                    this.currentAudio = null;
                    console.log(`✅ Finished playing new booking sound (${maxPlays} times)`);
                }
            };

            audio.onended = playNext;
            audio.onerror = () => {
                console.error("❌ Error playing new booking sound");
                this.isPlaying = false;
                this.currentAudio = null;
            };

            await audio.play();

        } catch (error) {
            console.error("❌ Failed to play new booking sound:", error);
            this.isPlaying = false;
            this.currentAudio = null;
        }
    }

    /**
     * Play warning sound (plays only once per booking)
     */
    async playWarningSound(bookingId: string): Promise<boolean> {
        if (this.hasPlayed(bookingId, 'warning')) {
            console.log(`🔇 Warning sound already played for: ${bookingId}`);
            return false;
        }

        console.log(`⚠️ Playing WARNING sound for: ${bookingId}`);
        this.stopCurrentSound();

        try {
            this.currentAudio = new Audio(SOUND_WARNING);
            this.isPlaying = true;
            this.markAsPlayed(bookingId, 'warning');

            this.currentAudio.onended = () => {
                this.isPlaying = false;
                this.currentAudio = null;
                console.log("✅ Finished playing warning sound");
            };

            this.currentAudio.onerror = () => {
                console.error("❌ Error playing warning sound");
                this.isPlaying = false;
                this.currentAudio = null;
            };

            await this.currentAudio.play();
            return true;

        } catch (error) {
            console.error("❌ Failed to play warning sound:", error);
            this.isPlaying = false;
            this.currentAudio = null;
            return false;
        }
    }

    /**
     * Play auto-cancel sound (plays only once per booking)
     */
    async playAutoCancelSound(bookingId: string): Promise<boolean> {
        if (this.hasPlayed(bookingId, 'auto_cancel')) {
            console.log(`🔇 Auto-cancel sound already played for: ${bookingId}`);
            return false;
        }

        console.log(`🚫 Playing AUTO-CANCEL sound for: ${bookingId}`);
        this.stopCurrentSound();

        try {
            this.currentAudio = new Audio(SOUND_AUTO_CANCEL);
            this.isPlaying = true;
            this.markAsPlayed(bookingId, 'auto_cancel');

            this.currentAudio.onended = () => {
                this.isPlaying = false;
                this.currentAudio = null;
                console.log("✅ Finished playing auto-cancel sound");
            };

            this.currentAudio.onerror = () => {
                console.error("❌ Error playing auto-cancel sound");
                this.isPlaying = false;
                this.currentAudio = null;
            };

            await this.currentAudio.play();
            return true;

        } catch (error) {
            console.error("❌ Failed to play auto-cancel sound:", error);
            this.isPlaying = false;
            this.currentAudio = null;
            return false;
        }
    }

    /**
     * Stop any currently playing sound
     */
    stopCurrentSound(): void {
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio.onended = null;
                this.currentAudio.onerror = null;
                this.currentAudio = null;
                this.isPlaying = false;
                console.log('🔇 Stopped current sound');
            } catch (error) {
                console.error('Error stopping sound:', error);
                this.currentAudio = null;
                this.isPlaying = false;
            }
        }
    }

    private hasPlayed(bookingId: string, soundType: string): boolean {
        const sounds = this.playedSounds.get(bookingId);
        return sounds ? sounds.has(soundType) : false;
    }

    private markAsPlayed(bookingId: string, soundType: string): void {
        if (!this.playedSounds.has(bookingId)) {
            this.playedSounds.set(bookingId, new Set());
        }
        this.playedSounds.get(bookingId)!.add(soundType);
    }

    clearBooking(bookingId: string): void {
        this.playedSounds.delete(bookingId);
        console.log(`🧹 Cleared sound tracker for booking: ${bookingId}`);
    }

    cleanup(): void {
        this.stopCurrentSound();
        this.playedSounds.clear();
    }
}

// Global instance
const soundManager = new GlobalSoundManager();

export default function OwnerBookingModal() {
    const {
        showOwnerModal,
        setShowOwnerModal,
        currentBooking,
        setCurrentBooking,
        bookingQueue,
        setBookingQueue,
        addBookingToQueue,
        removeBookingFromQueue,
        actionLoading,
        setActionLoading
    } = useBookingModalStore();

    const socketRef = useRef<Socket | null>(null);
    const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const warningTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const [socketConnected, setSocketConnected] = useState(false);
    const ownerId = localStorage.getItem("userId") || "";

    const { addNotification, updateNotificationStatus } = useNotificationStore();

    // ============================================================================
    // WARNING AND EXPIRY MONITORING
    // ============================================================================
    useEffect(() => {
        if (!currentBooking) return;

        const bookingId = currentBooking._id || currentBooking.id || '';

        const interval = setInterval(() => {
            const remaining = (currentBooking.expiresAt || 0) - Date.now();

            // Play warning sound at 20 seconds
            if (remaining <= WARNING_TIME && remaining > (WARNING_TIME - 1000)) {
                soundManager.playWarningSound(bookingId);
            }

            // Auto-expire at 0
            if (remaining <= 0) {
                clearInterval(interval);
                expireBooking(bookingId);
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [currentBooking]);

    // ============================================================================
    // SOCKET INITIALIZATION
    // ============================================================================
    useEffect(() => {
        if (!ownerId) {
            console.log('⚠️ No ownerId found, socket not initialized');
            return;
        }

        console.log('🔌 Initializing owner socket for:', ownerId);

        socketRef.current = io(SOCKET_URL, {
            query: { userId: ownerId },
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected for owner:', ownerId);
            setSocketConnected(true);
            fetchPendingBookings();
        });

        socketRef.current.on('disconnect', () => {
            console.log('❌ Socket disconnected for owner:', ownerId);
            setSocketConnected(false);
        });

        socketRef.current.on('reconnect', (attemptNumber: number) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            setSocketConnected(true);
            fetchPendingBookings();
        });

        socketRef.current.on('new-booking-request', (data: PendingBooking) => {
            console.log('🔔 New booking received via socket:', data);
            handleNewBooking(data);
        });

        socketRef.current.on('booking-created', (data: PendingBooking) => {
            console.log('🔔 Booking created event received:', data);
            handleNewBooking(data);
        });

        return () => {
            console.log('🔌 Cleaning up owner socket');
            if (socketRef.current) socketRef.current.disconnect();
            Object.values(timersRef.current).forEach(clearTimeout);
            Object.values(warningTimersRef.current).forEach(clearTimeout);
            soundManager.cleanup();
        };
    }, [ownerId]);

    // ============================================================================
    // POLLING BACKUP
    // ============================================================================
    useEffect(() => {
        if (ownerId) {
            fetchPendingBookings();

            const pollInterval = setInterval(() => {
                fetchPendingBookings();
            }, 5000);

            return () => clearInterval(pollInterval);
        }
    }, [ownerId]);

    // ============================================================================
    // AUTO-SHOW MODAL
    // ============================================================================
    useEffect(() => {
        if (!currentBooking && bookingQueue.length > 0) {
            showNextBooking();
        }
    }, [currentBooking, bookingQueue]);

    // ============================================================================
    // FETCH PENDING BOOKINGS
    // ============================================================================
    const fetchPendingBookings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/getPendingBookingsOfOwner/${ownerId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await res.json();

            let bookings: PendingBooking[] = [];
            if (Array.isArray(data)) {
                bookings = data;
            } else if (data.data && Array.isArray(data.data)) {
                bookings = data.data;
            } else if (data.bookings && Array.isArray(data.bookings)) {
                bookings = data.bookings;
            }

            const pending = bookings.filter((b) => {
                const statusLower = (b.status || '').toLowerCase();
                return statusLower === 'pending' || statusLower === '';
            });

            const currentQueue = useBookingModalStore.getState().bookingQueue;
            const currentIds = new Set(currentQueue.map(b => b._id || b.id));

            const bookingsWithTime = pending.map((booking) => ({
                ...booking,
                receivedAt: new Date(booking.createdAt || booking.CreatedAt || Date.now()).getTime(),
                expiresAt: new Date(booking.createdAt || booking.CreatedAt || Date.now()).getTime() + EXPIRY_TIME
            }));

            // Check for NEW bookings - play sound for EVERY new booking found
            const newBookings = bookingsWithTime.filter(b => !currentIds.has(b._id || b.id));

            if (newBookings.length > 0) {
                console.log('🆕 Found', newBookings.length, 'new pending booking(s)');

                // Play sound for the first new booking
                const firstNewBooking = newBookings[0];
                const bookingId = firstNewBooking._id || firstNewBooking.id || '';

                // ALWAYS play the sound, regardless of website state
                await soundManager.playNewBookingSound(bookingId);
            }

            setBookingQueue(bookingsWithTime);

            bookingsWithTime.forEach((booking) => {
                startExpiryTimer(booking);
            });

            const hasCurrentBooking = useBookingModalStore.getState().currentBooking;

            if (bookingsWithTime.length > 0 && !hasCurrentBooking) {
                const nextBooking = bookingsWithTime[0];
                setCurrentBooking(nextBooking);
                setShowOwnerModal(true);
            }

        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    // ============================================================================
    // HANDLE NEW BOOKING (from socket)
    // ============================================================================
    const handleNewBooking = async (booking: PendingBooking) => {
        const bookingOwnerId = booking.ownerId || booking.OwnerId;
        if (bookingOwnerId !== ownerId) {
            console.log('Skipping booking - not for this owner');
            return;
        }

        const bookingId = booking._id || booking.id || '';

        const existingBooking = bookingQueue.find(b =>
            (b._id || b.id) === bookingId
        );

        if (existingBooking) {
            console.log('⚠️ Booking already in queue, skipping');
            return;
        }

        console.log('🆕 New booking received via socket');

        // ALWAYS play new booking sound
        await soundManager.playNewBookingSound(bookingId);

        const bookingWithTime: PendingBooking = {
            ...booking,
            receivedAt: Date.now(),
            expiresAt: Date.now() + EXPIRY_TIME
        };

        const vehicleName = booking.vehicleName || booking.VehicleName || 'your vehicle';
        const customerName = booking.contactName || booking.customerName || 'A customer';

        addNotification({
            type: 'new_booking',
            title: 'Your car has been booked?',
            message: `${customerName} requested to book ${vehicleName}.`,
            vehicleName: vehicleName,
            vehicleId: booking.VechileId || booking.vehicleId,
            bookingId: bookingId,
            userId: ownerId,
            bookingStatus: 'Pending',
            customerName: customerName,
            fromDate: booking.FromDate || booking.fromDate,
            toDate: booking.ToDate || booking.toDate,
            totalPrice: booking.totalPrice,
        });

        addBookingToQueue(bookingWithTime);
        startExpiryTimer(bookingWithTime);

        if (!currentBooking) {
            setCurrentBooking(bookingWithTime);
            setShowOwnerModal(true);
        }
    };

    // ============================================================================
    // EXPIRY TIMER
    // ============================================================================
    const startExpiryTimer = (booking: PendingBooking) => {
        const bookingId = booking._id || booking.id || '';

        if (timersRef.current[bookingId]) {
            clearTimeout(timersRef.current[bookingId]);
        }

        const timeUntilExpiry = (booking.expiresAt || 0) - Date.now();

        if (timeUntilExpiry > 0) {
            console.log(`⏰ Setting expiry timer for ${bookingId}: ${timeUntilExpiry}ms`);
            timersRef.current[bookingId] = setTimeout(() => {
                expireBooking(bookingId);
            }, timeUntilExpiry);
        } else {
            console.log(`⚠️ Booking ${bookingId} already expired`);
            expireBooking(bookingId);
        }
    };

    // ============================================================================
    // EXPIRE BOOKING
    // ============================================================================
    const expireBooking = async (bookingId: string) => {
        console.log('⏱️ AUTO-CANCELLING booking (timeout):', bookingId);

        const expiredBooking = bookingQueue.find(b => (b._id || b.id) === bookingId) || currentBooking;
        const customerId = expiredBooking?.userId || expiredBooking?.customerId;
        const vehicleName = expiredBooking?.vehicleName || expiredBooking?.VehicleName;

        // Play auto-cancel sound
        await soundManager.playAutoCancelSound(bookingId);

        try {
            await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Cancelled`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            updateNotificationStatus(bookingId, 'Expired');

            if (socketRef.current?.connected && customerId) {
                socketRef.current.emit('booking-status-update', {
                    bookingId,
                    customerId,
                    status: 'timeout',
                    ownerId,
                    vehicleName
                });
            }

            removeBookingFromQueue(bookingId);

            if (currentBooking && (currentBooking._id || currentBooking.id) === bookingId) {
                setCurrentBooking(null);
                setShowOwnerModal(false);
            }

            if (timersRef.current[bookingId]) {
                clearTimeout(timersRef.current[bookingId]);
                delete timersRef.current[bookingId];
            }

            if (warningTimersRef.current[bookingId]) {
                clearTimeout(warningTimersRef.current[bookingId]);
                delete warningTimersRef.current[bookingId];
            }

            setTimeout(() => {
                soundManager.clearBooking(bookingId);
            }, 5000);

        } catch (error) {
            console.error('Error expiring booking:', error);
        }
    };

    // ============================================================================
    // SHOW NEXT BOOKING
    // ============================================================================
    const showNextBooking = () => {
        if (bookingQueue.length === 0) return;

        const nextBooking = bookingQueue[0];
        setCurrentBooking(nextBooking);
        setShowOwnerModal(true);
    };

    // ============================================================================
    // HANDLE CONFIRM
    // ============================================================================
    const handleConfirm = async () => {
        if (!currentBooking) return;

        const bookingId = currentBooking._id || currentBooking.id || '';
        const customerId = currentBooking.userId || currentBooking.customerId;
        const vehicleName = currentBooking.vehicleName || currentBooking.VehicleName;

        soundManager.stopCurrentSound();
        setActionLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Confirmed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to confirm booking');

            console.log('✅ Booking confirmed:', bookingId);

            updateNotificationStatus(bookingId, 'Confirmed');

            if (socketRef.current?.connected && customerId) {
                socketRef.current.emit('booking-status-update', {
                    bookingId,
                    customerId,
                    status: 'accepted',
                    ownerId,
                    vehicleName
                });
            }

            if (timersRef.current[bookingId]) {
                clearTimeout(timersRef.current[bookingId]);
                delete timersRef.current[bookingId];
            }

            if (warningTimersRef.current[bookingId]) {
                clearTimeout(warningTimersRef.current[bookingId]);
                delete warningTimersRef.current[bookingId];
            }

            soundManager.clearBooking(bookingId);

            removeBookingFromQueue(bookingId);
            setCurrentBooking(null);
            setShowOwnerModal(false);
            setActionLoading(false);

        } catch (error: any) {
            console.error('Error confirming booking:', error);
            alert(`Error: ${error.message}`);
            setActionLoading(false);
        }
    };

    // ============================================================================
    // HANDLE REJECT
    // ============================================================================
    const handleReject = async () => {
        if (!currentBooking) return;

        const bookingId = currentBooking._id || currentBooking.id || '';
        const customerId = currentBooking.userId || currentBooking.customerId;
        const vehicleName = currentBooking.vehicleName || currentBooking.VehicleName;

        soundManager.stopCurrentSound();
        setActionLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/confirmBooking/${bookingId}/Cancelled`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to reject booking');

            console.log('❌ Booking rejected:', bookingId);

            updateNotificationStatus(bookingId, 'Rejected');

            if (socketRef.current?.connected && customerId) {
                socketRef.current.emit('booking-status-update', {
                    bookingId,
                    customerId,
                    status: 'rejected',
                    ownerId,
                    vehicleName
                });
            }

            if (timersRef.current[bookingId]) {
                clearTimeout(timersRef.current[bookingId]);
                delete timersRef.current[bookingId];
            }

            if (warningTimersRef.current[bookingId]) {
                clearTimeout(warningTimersRef.current[bookingId]);
                delete warningTimersRef.current[bookingId];
            }

            soundManager.clearBooking(bookingId);

            removeBookingFromQueue(bookingId);
            setCurrentBooking(null);
            setShowOwnerModal(false);
            setActionLoading(false);

        } catch (error: any) {
            console.error('Error rejecting booking:', error);
            alert(`Error: ${error.message}`);
            setActionLoading(false);
        }
    };

    // ============================================================================
    // TIME DISPLAY
    // ============================================================================
    const getRemainingTime = (booking: PendingBooking) => {
        const now = Date.now();
        const remaining = (booking.expiresAt || 0) - now;

        if (remaining <= 0) return '00:00';

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const TimeDisplay = ({ booking }: { booking: PendingBooking }) => {
        const [time, setTime] = useState(getRemainingTime(booking));

        useEffect(() => {
            const interval = setInterval(() => {
                setTime(getRemainingTime(booking));
            }, 1000);

            return () => clearInterval(interval);
        }, [booking]);

        const remaining = (booking.expiresAt || 0) - Date.now();
        const isExpiring = remaining < 30000;
        const isCritical = remaining < 10000;

        return (
            <span className={`font-mono font-bold text-xl ${isCritical ? 'text-red-600 animate-pulse' : isExpiring ? 'text-orange-600 animate-pulse' : 'text-blue-600'}`}>
                {time}
            </span>
        );
    };

    if (!ownerId || !showOwnerModal || !currentBooking) return null;

    const remaining = (currentBooking.expiresAt || 0) - Date.now();
    const isCritical = remaining < 10000;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn ${isCritical ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}>
                <button
                    onClick={() => {
                        soundManager.stopCurrentSound();
                        setShowOwnerModal(false);
                        setCurrentBooking(null);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={actionLoading}
                >
                    <X size={24} />
                </button>

                <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isCritical ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
                        <Truck className={isCritical ? 'text-red-600' : 'text-blue-600'} size={48} />
                    </div>

                    <h2 className="text-2xl font-semibold mb-2">
                        You've got a new booking!
                    </h2>

                    <div className={`flex items-center justify-center gap-2 mb-6 p-3 rounded-xl ${isCritical ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <Clock size={24} className={isCritical ? 'text-red-600' : 'text-orange-600'} />
                        <TimeDisplay booking={currentBooking} />
                        <span className="text-sm text-gray-500">remaining</span>
                    </div>

                    {isCritical && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex items-center justify-center gap-2">
                            <AlertTriangle size={20} />
                            <span className="font-semibold">Hurry! Time is running out!</span>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <p className="font-bold text-lg text-gray-800 mb-2">
                            {currentBooking.vehicleName || currentBooking.VehicleName || 'Vehicle'}
                        </p>
                        <p className="text-sm text-gray-600">
                            Customer: {currentBooking.contactName || currentBooking.customerName || 'N/A'}
                        </p>
                        {currentBooking.totalPrice && (
                            <p className="text-sm text-gray-600">
                                Total: ₹{currentBooking.totalPrice}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-green-600 to-green-400 hover:opacity-90 mb-4
                       disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {actionLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Check size={20} />
                                Accept Booking
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl font-semibold
                       border border-red-500 text-red-600 hover:bg-red-50
                       disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {actionLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <X size={20} />
                                Reject Booking
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}