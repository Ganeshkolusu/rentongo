export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface BookingDetails {
  id: string;
  vehicleId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  ownerUserId: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking?: BookingDetails;
  error?: string;
}