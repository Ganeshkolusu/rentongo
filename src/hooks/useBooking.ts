import { useState } from 'react';
import { bookingsApi } from '../features/bookings/bookings.api';
import { useNavigate } from 'react-router-dom';

export const useBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createBooking = async (params: {
    vehicleId: string;
    vehicleName: string;
    startDate: Date;
    endDate: Date;
    userId: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const booking = await bookingsApi.createBooking(params);
      // Navigate to bookings page after successful booking
      navigate('/my-bookings');
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingsApi.confirmBooking(bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeRide = async (params: {
    bookingId: string;
    vehicleId: string;
    vehicleName: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingsApi.completeRide(
        params.bookingId,
        params.vehicleId,
        params.vehicleName
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete ride');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingsApi.cancelBooking(bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBooking,
    confirmBooking,
    completeRide,
    cancelBooking,
    isLoading,
    error,
  };
};