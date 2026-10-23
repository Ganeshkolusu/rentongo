import { create } from 'zustand';

export interface PendingBooking {
  _id?: string;
  id?: string;
  userId?: string;
  customerId?: string;
  ownerId?: string;
  OwnerId?: string;
  contactName?: string;
  customerName?: string;
  vehicleName?: string;
  VehicleName?: string;
  vehicleId?: string;
  VechileId?: string; // Backend typo variant
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  CreatedAt?: string;
  receivedAt?: number;
  expiresAt?: number;
  // Booking date fields
  FromDate?: string;
  fromDate?: string;
  ToDate?: string;
  toDate?: string;
  FromTime?: string;
  fromTime?: string;
  ToTime?: string;
  toTime?: string;
}

interface BookingModalState {
  // Owner state
  showOwnerModal: boolean;
  currentBooking: PendingBooking | null;
  bookingQueue: PendingBooking[];
  modalState: 'confirm' | 'confirmed' | 'rejected';
  actionLoading: boolean;

  // Customer state
  showCustomerModal: boolean;
  customerModalType: 'accepted' | 'rejected' | 'timeout' | null;
  customerBookingInfo: {
    vehicleName?: string;
    ownerName?: string;
    bookingId?: string;
  } | null;

  // Customer waiting popup state
  showWaitingPopup: boolean;
  waitingBookingInfo: {
    bookingId: string;
    vehicleName?: string;
    expiresAt: number;
  } | null;

  // Owner actions
  setShowOwnerModal: (show: boolean) => void;
  setCurrentBooking: (booking: PendingBooking | null) => void;
  setBookingQueue: (queue: PendingBooking[]) => void;
  addBookingToQueue: (booking: PendingBooking) => void;
  removeBookingFromQueue: (bookingId: string) => void;
  setModalState: (state: 'confirm' | 'confirmed' | 'rejected') => void;
  setActionLoading: (loading: boolean) => void;

  // Customer actions
  showCustomerAcceptedModal: (vehicleName?: string, ownerName?: string) => void;
  showCustomerRejectedModal: (vehicleName?: string, ownerName?: string) => void;
  showCustomerTimeoutModal: (vehicleName?: string) => void;
  closeCustomerModal: () => void;

  // Customer waiting popup actions
  showCustomerWaitingPopup: (bookingId: string, vehicleName?: string) => void;
  closeWaitingPopup: () => void;
}

const EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes

export const useBookingModalStore = create<BookingModalState>((set, get) => ({
  // Owner initial state
  showOwnerModal: false,
  currentBooking: null,
  bookingQueue: [],
  modalState: 'confirm',
  actionLoading: false,

  // Customer initial state
  showCustomerModal: false,
  customerModalType: null,
  customerBookingInfo: null,

  // Customer waiting popup initial state
  showWaitingPopup: false,
  waitingBookingInfo: null,

  // Owner actions
  setShowOwnerModal: (show) => set({ showOwnerModal: show }),

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  setBookingQueue: (queue) => set({ bookingQueue: queue }),

  addBookingToQueue: (booking) => {
    const bookingWithTime: PendingBooking = {
      ...booking,
      receivedAt: Date.now(),
      expiresAt: Date.now() + EXPIRY_TIME
    };

    set((state) => ({
      bookingQueue: [...state.bookingQueue, bookingWithTime].sort(
        (a, b) => (a.receivedAt || 0) - (b.receivedAt || 0)
      )
    }));
  },

  removeBookingFromQueue: (bookingId) => {
    set((state) => ({
      bookingQueue: state.bookingQueue.filter(
        (b) => (b._id || b.id) !== bookingId
      ),
      currentBooking:
        state.currentBooking &&
        (state.currentBooking._id || state.currentBooking.id) === bookingId
          ? null
          : state.currentBooking
    }));
  },

  setModalState: (modalState) => set({ modalState }),

  setActionLoading: (actionLoading) => set({ actionLoading }),

  // Customer actions
  showCustomerAcceptedModal: (vehicleName, ownerName) => set({
    showCustomerModal: true,
    customerModalType: 'accepted',
    customerBookingInfo: { vehicleName, ownerName },
    // Close waiting popup when accepted
    showWaitingPopup: false,
    waitingBookingInfo: null
  }),

  showCustomerRejectedModal: (vehicleName, ownerName) => set({
    showCustomerModal: true,
    customerModalType: 'rejected',
    customerBookingInfo: { vehicleName, ownerName },
    // Close waiting popup when rejected
    showWaitingPopup: false,
    waitingBookingInfo: null
  }),

  showCustomerTimeoutModal: (vehicleName) => set({
    showCustomerModal: true,
    customerModalType: 'timeout',
    customerBookingInfo: { vehicleName },
    // Close waiting popup when timeout
    showWaitingPopup: false,
    waitingBookingInfo: null
  }),

  closeCustomerModal: () => set({
    showCustomerModal: false,
    customerModalType: null,
    customerBookingInfo: null
  }),

  // Customer waiting popup actions
  showCustomerWaitingPopup: (bookingId, vehicleName) => set({
    showWaitingPopup: true,
    waitingBookingInfo: {
      bookingId,
      vehicleName,
      expiresAt: Date.now() + EXPIRY_TIME
    }
  }),

  closeWaitingPopup: () => set({
    showWaitingPopup: false,
    waitingBookingInfo: null
  })
}));
