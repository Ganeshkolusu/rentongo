import { useNotificationStore } from '../../store/notification.store';
import { BookingStatus } from './bookings.types';

// Simulated API endpoint for now
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000/api';

export interface CreateBookingParams {
  vehicleId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  userId: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const bookingsApi = {
  createBooking: async (params: CreateBookingParams): Promise<Booking> => {
    try {
      // In production, this would be a real API call
      const response = {
        id: Date.now().toString(),
        ...params,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add booking confirmation notification
      useNotificationStore.getState().addNotification({
        type: 'booking_confirmed',
        title: 'Car Booking Request',
        message: `your car has been booked?`,
        vehicleId: params.vehicleId,
        vehicleName: params.vehicleName,
        bookingId: response.id
      });

      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  confirmBooking: async (bookingId: string): Promise<void> => {
    try {
      // In production, this would be a real API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      useNotificationStore.getState().addNotification({
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed by the owner.',
        bookingId
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  },

  completeRide: async (bookingId: string, vehicleId: string, vehicleName: string): Promise<void> => {
    try {
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      useNotificationStore.getState().addNotification({
        type: 'ride_completed',
        title: 'Ride Completed',
        message: 'Your Ride as been completed please give feedback.',
        vehicleId,
        vehicleName,
        bookingId,
        requiresFeedback: true
      });
    } catch (error) {
      console.error('Error completing ride:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      useNotificationStore.getState().addNotification({
        type: 'booking_declined',
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled.',
        bookingId
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};
