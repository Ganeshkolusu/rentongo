
import axios from 'axios';

// ✅ Export API_BASE_URL so it can be used in components
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.rentongovehicle.com';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://api.rentongovehicle.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// For the handful of call sites that use raw fetch() instead of apiClient
// (e.g. FormData uploads), so they still carry the auth token.
export const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const payload = error.response?.data || { message: error.message };
    // Preserve the HTTP status on the rejected payload — callers that need
    // to branch on it (e.g. 403 "upgrade your plan") would otherwise lose
    // it, since this interceptor unwraps to the response body only.
    if (error.response?.status && typeof payload === "object") {
      payload.status = error.response.status;
    }
    return Promise.reject(payload);
  }
);


const utils = {
  validateDateFormat: (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date),
  validateTimeFormat: (time: string) => /^\d{2}\.\d{2}$/.test(time),

  extractResponseData: (response: any) => {
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response;
  },

  formatDateForBackend: (date: Date | string): string => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  formatTimeForBackend: (time: string): string => {
    return time.replace(':', '.');
  }
};

// ==================== CAR APIs ====================
export const carAPI = {
  createCar: async (carData: FormData) => {
    return apiClient.post('/createCar', carData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCarById: async (carId: string) => {
    return apiClient.get(`/getCarById/${carId}`);
  },

  updateCarById: async (carId: string, carData: FormData) => {
    console.log("🚀 API Service - Update Car Request");
    console.log("  Car ID:", carId);
    console.log("  Endpoint:", `/updateCar/${carId}`);

    console.log("📦 FormData being sent:");
    for (const [key, value] of carData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    try {
      const response = await apiClient.put(`/updateCar/${carId}`, carData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log("✅ Update Car Success:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Update Car Failed:", error);
      console.error("❌ Error Details:", error.response?.data);
      throw error;
    }
  },

  deleteCarById: async (carId: string) => {
    return apiClient.delete(`/deleteCar/${carId}`);
  },

  getNearbyCars: async (latitude: number, longitude: number, range?: number) => {
    return apiClient.get('/getNearbyCars', {
      params: { latitude, longitude, range: range || 10 },
    });
  },

  getMyVehicles: async (userId: string) => {
    return apiClient.get(`/myVehicles/${userId}`);
  },
};

// ==================== BIKE APIs ====================
export const bikeAPI = {
  createBike: async (bikeData: FormData) => {
    return apiClient.post('/createBike', bikeData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getBikeById: async (bikeId: string) => {
    return apiClient.get(`/getBikeById/${bikeId}`);
  },

  updateBikeById: async (bikeId: string, bikeData: FormData) => {
    console.log("🚀 API Service - Update Bike Request");
    console.log("  Bike ID:", bikeId);
    console.log("  Endpoint:", `/updateBike/${bikeId}`);

    console.log("📦 FormData being sent:");
    for (const [key, value] of bikeData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    try {
      const response = await apiClient.put(`/updateBike/${bikeId}`, bikeData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log("✅ Update Bike Success:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Update Bike Failed:", error);
      console.error("❌ Error Details:", error.response?.data);
      throw error;
    }
  },

  deleteBikeById: async (bikeId: string) => {
    return apiClient.delete(`/deleteBike/${bikeId}`);
  },

  getNearbyBikes: async (latitude: number, longitude: number, range?: number) => {
    return apiClient.get('/getNearbyBikes', {
      params: { latitude, longitude, range: range || 10 },
    });
  },

  getMyVehicles: async (userId: string) => {
    return apiClient.get(`/myVehicles/${userId}`);
  }
};

// ==================== REVIEW APIs ====================
export const reviewAPI = {
  createReview: async (reviewData: {
    carId?: string;
    vehicleId?: string;
    vehicleType?: 'car' | 'bike';
    bikeId?: string;
    userId: string;
    rating: number;
    comment: string;
  }) => {
    return apiClient.post('/addReview', reviewData);
  },

  getReviewsByCarId: async (vehicleId: string) => {
    return apiClient.get(`/getReviewById/${vehicleId}`);
  },

  getReviewsByBikeId: async (bikeId: string) => {
    return apiClient.get(`/getReviewById/${bikeId}`);
  },

  updateReviewById: async (reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }) => {
    return apiClient.put(`/updateReview/${reviewId}`, reviewData);
  },

  getAverageRating: async (vehicleId: string, vehicleType: 'car' | 'bike') => {
    const capitalizedType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
    return apiClient.get('/getAverageRating', {
      params: {
        vechileType: capitalizedType,
        vechileId: vehicleId
      }
    });
  },

  getUserRating: async (userId: string, vehicleId: string) => {
    return apiClient.get(`/reviews/user/${userId}/vehicle/${vehicleId}`);
  },

  deleteReview: async (reviewId: string) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};

// ==================== BOOKING APIs ====================
export const bookingAPI = {
  createBooking: async (bookingData: any) => {
    console.log("📦 API Service - Input bookingData:", bookingData);

    const backendPayload = bookingData.VechileId ? bookingData : {
      VechileId: bookingData.vehicleId,
      vechileType: bookingData.vehicleType,
      userId: bookingData.userId,
      contactNumber: bookingData.contactNumber || '',
      contactName: bookingData.contactName || '',
      latitude: bookingData.latitude || '',
      longitude: bookingData.longitude || '',
      FromDate: bookingData.startDate,
      ToDate: bookingData.endDate,
      FromTime: bookingData.startTime || '',
      ToTime: bookingData.endTime || '',
      totalPrice: String(bookingData.totalPrice),
      totalHours: bookingData.totalHours || '',
      pricePerDay: bookingData.pricePerDay || '',
      pricePerHour: bookingData.pricePerHour || '',
      pricePerKm: bookingData.pricePerKm || '',
      carName: bookingData.carName || '',
      carModel: bookingData.carModel || '',
      carBrand: bookingData.carBrand || '',
      CarNumber: bookingData.CarNumber || '',
      fuelType: bookingData.fuelType || '',
      transmissionType: bookingData.transmissionType || '',
      seatingCapacity: bookingData.seatingCapacity || '',
      pickupAddress: bookingData.pickupLocation || bookingData.pickupAddress || '',
      dropoffAddress: bookingData.dropoffLocation || bookingData.dropoffAddress || '',
      withDriver: bookingData.withDriver ? 'true' : '',
    };

    console.log("📦 API Service - Transformed payload:", backendPayload);

    const urlencoded = new URLSearchParams();
    Object.entries(backendPayload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlencoded.append(key, String(value));
      }
    });

    console.log("📦 API Service - URL Encoded body:", urlencoded.toString());

    return apiClient.post('/createBooking', urlencoded, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  getAllBookings: async (userId: string): Promise<any> => {
    // apiClient already attaches the auth token and points at the real API —
    // no need for a direct-fetch/CORS-proxy fallback chain that routes
    // booking/user data through an unaffiliated third-party proxy.
    return apiClient.get(`/getAllBookings?userId=${userId}`);
  },

  getBookingById: async (bookingId: string) => {
    return apiClient.get(`/getBookingById/${bookingId}`);
  },

  updateBooking: async (bookingId: string, bookingData: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }) => {
    return apiClient.put(`/bookings/${bookingId}`, bookingData);
  },

  getPendingBookingsOfOwner: async (ownerId: string) => {
    return apiClient.get(`/getPendingBookingsOfOwner/${ownerId}`);
  },

  confirmBooking: async (bookingId: string) => {
    return apiClient.post(`/confirmBooking/${bookingId}/conform`);
  },

  cancelBooking: async (bookingId: string) => {
    return apiClient.post(`/confirmBooking/${bookingId}/Cancelled`);
  },

  deleteBooking: async (bookingId: string) => {
    return apiClient.delete(`/deleteBooking/${bookingId}`);
  },

  getMyListingBookings: async (ownerId: string) => {
    return apiClient.get(`/bookings/owner/${ownerId}`);
  },
};

// ==================== AVAILABILITY APIs ====================
export const availabilityAPI = {
  createUnavailability: async (availabilityData: {
    userId?: string;
    VechileId: string;
    vechileType: 'Car' | 'Bike' | 'Auto';
    fromDate: string;
    toDate: string;
    fromTime?: string;
    toTime?: string;
    isNotAvailable?: boolean;
  }) => {
    console.log("🚫 Create Unavailability - Input data:", availabilityData);

    const urlencoded = new URLSearchParams();
    if (availabilityData.userId) urlencoded.append("userId", availabilityData.userId);
    urlencoded.append("VechileId", availabilityData.VechileId);
    urlencoded.append("vechileType", availabilityData.vechileType);
    urlencoded.append("fromDate", availabilityData.fromDate);
    urlencoded.append("toDate", availabilityData.toDate);
    urlencoded.append("fromTime", availabilityData.fromTime || "00:00");
    urlencoded.append("toTime", availabilityData.toTime || "23:59");
    urlencoded.append("isNotAvailable", String(availabilityData.isNotAvailable ?? true));

    console.log("🚫 Create Unavailability - Encoded Body:", urlencoded.toString());

    return apiClient.post("/createNotAvailability", urlencoded, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  getVehicleAvailability: async (
    VechileId: string,
    vechileType: 'Car' | 'Bike' | 'Auto',
    startDate: string,
    endDate: string
  ) => {
    console.log("📅 Get Vehicle Availability:", { VechileId, vechileType, startDate, endDate });

    return apiClient.get("/getVehicleAvailability", {
      params: {
        VechileId,
        vechileType,
        startDate,
        endDate,
      },
    });
  },

  getUnavailabilityById: async (availabilityId: string) => {
    console.log("📄 Get Unavailability By ID:", availabilityId);
    return apiClient.get(`/getNotAvailabilityById/${availabilityId}`);
  },

  updateUnavailability: async (
    availabilityId: string,
    availabilityData: {
      VechileId: string;
      vechileType: 'Car' | 'Bike' | 'Auto';
      fromDate: string;
      toDate: string;
      fromTime?: string;
      toTime?: string;
      isNotAvailable?: boolean;
    }
  ) => {
    console.log("🔄 Update Unavailability - Input data:", availabilityData);

    const urlencoded = new URLSearchParams();
    urlencoded.append("VechileId", availabilityData.VechileId);
    urlencoded.append("vechileType", availabilityData.vechileType);
    urlencoded.append("fromDate", availabilityData.fromDate);
    urlencoded.append("toDate", availabilityData.toDate);
    urlencoded.append("fromTime", availabilityData.fromTime || "00:00");
    urlencoded.append("toTime", availabilityData.toTime || "23:59");
    urlencoded.append("isNotAvailable", String(availabilityData.isNotAvailable ?? true));

    console.log("🔄 Update Unavailability - Encoded Body:", urlencoded.toString());

    return apiClient.put(`/updateNotAvailability/${availabilityId}`, urlencoded, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  deleteUnavailability: async (availabilityId: string) => {
    console.log("🗑️ Delete Unavailability - ID:", availabilityId);
    return apiClient.delete(`/deleteNotAvailability/${availabilityId}`);
  },
};

// ==================== USER APIs ====================
export const userAPI = {
  // Email OTP login/signup — no password, no Google Sign-In
  requestOtp: async (email: string) => {
    return apiClient.post('/auth/request-otp', { email });
  },

  verifyOtp: async (data: {
    email: string;
    otp: string;
    name?: string;
    fcmToken?: string;
    platform?: string;
  }) => {
    return apiClient.post('/auth/verify-otp', data);
  },

  getUserProfile: async (userId: string) => {
    return apiClient.get(`/users/${userId}`);
  },

  updateUserProfile: async (userId: string, userData: any) => {
    return apiClient.put(`/updateUser/${userId}`, userData);
  },
};

// ==================== NOTIFICATION APIs ====================
export const notificationAPI = {
  getNotifications: async (userId: string) => {
    console.log("🔔 Get Notifications for user:", userId);
    return apiClient.get(`/getNotifications/${userId}`);
  },

  getUnreadCount: async (userId: string) => {
    console.log("🔔 Get Unread Count for user:", userId);
    return apiClient.get(`/getUnreadNotificationsCount/${userId}`);
  },

  markAsRead: async (notificationId: string) => {
    console.log("🔔 Mark notification as read:", notificationId);
    return apiClient.put(`/markNotificationRead/${notificationId}`);
  },

  markAllAsRead: async (userId: string) => {
    console.log("🔔 Mark all notifications as read for user:", userId);
    return apiClient.put(`/markAllNotificationsRead/${userId}`);
  },

  deleteNotification: async (notificationId: string) => {
    console.log("🔔 Delete notification:", notificationId);
    return apiClient.delete(`/deleteNotification/${notificationId}`);
  },

  clearAllNotifications: async (userId: string) => {
    console.log("🔔 Clear all notifications for user:", userId);
    return apiClient.delete(`/clearAllNotifications/${userId}`);
  },
};

// ==================== SUPPORT TICKET INTERFACES ====================
export interface TicketFormData {
  issue: string;
  vehicle: string;
  description: string;
  name: string;
  mobile?: string;
  photos?: File[];
}

// ==================== SUPPORT TICKET APIs ====================
export const ticketAPI = {
  getTicketsByUser: async (userId: string) => {
    console.log("🎫 Get Tickets for user:", userId);
    return apiClient.get(`/getTicketsByUser/${userId}`);
  },

  createTicket: async (data: TicketFormData) => {
    console.log("🎫 Create Ticket:", data);

    const vehicleId = localStorage.getItem('vehicleId');
    const bookingId = localStorage.getItem('bookingId');

    if (!vehicleId || !bookingId) {
      throw new Error('No active vehicle/booking context — open a ticket from a specific booking.');
    }

    const body = new URLSearchParams();
    body.append("vehicleType", data.vehicle || 'Car');
    body.append("vehicleId", vehicleId);
    body.append("bookingId", bookingId);
    body.append("subject", data.issue);
    body.append("description", data.description);

    return apiClient.post('/createTicket', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  updateTicket: async (ticketId: string, ticketData: {
    status?: string;
    priority?: string;
    response?: string;
  }) => {
    console.log("🎫 Update Ticket:", ticketId, ticketData);
    return apiClient.put(`/updateTicket/${ticketId}`, ticketData);
  },

  deleteTicket: async (ticketId: string) => {
    console.log("🎫 Delete Ticket:", ticketId);
    return apiClient.delete(`/deleteTicket/${ticketId}`);
  },
};

// ==================== CHAT INTERFACES & SERVICE ====================
export interface ChatMessage {
  _id?: string;
  senderId: string;
  receiverId: string | null;
  message: string;
  files?: string[];
  seen?: boolean;
  timestamp: string;
}

export interface VehicleBooking {
  _id: string;
  vehicleId: string;
  vehicleType: string;
  userId: string;
}

export class ApiService {
  public apiUrl: string;

  constructor(apiUrl: string = API_BASE_URL) {
    this.apiUrl = apiUrl;
  }

  async getMessages(bookingId: string): Promise<ChatMessage[]> {
    try {
      console.log("📥 ApiService.getMessages - bookingId:", bookingId);

      const res = await fetch(`${this.apiUrl}/getMessages/${bookingId}`, {
        method: "GET",
        redirect: "follow",
        headers: authHeader(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("✅ ApiService.getMessages - Response:", data);

      return Array.isArray(data) ? data : data.messages || [];
    } catch (err) {
      console.error("❌ ApiService.getMessages - Error:", err);
      throw err;
    }
  }

  async sendMessage(
    bookingId: string,
    senderId: string,
    receiverId: string,
    message: string,
    files: File[] = []
  ): Promise<ChatMessage> {
    try {
      console.log("📤 ApiService.sendMessage - Params:", {
        bookingId,
        senderId,
        receiverId,
        message,
        filesCount: files.length
      });

      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("senderId", senderId);
      formData.append("receiverId", receiverId);
      formData.append("message", message);

      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        body: formData,
        redirect: "follow",
        headers: authHeader(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("✅ ApiService.sendMessage - Response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      return data.data;
    } catch (err) {
      console.error("❌ ApiService.sendMessage - Error:", err);
      throw err;
    }
  }

  async getMyVehicleBookings(
    userId: string,
    vehicleType: string,
    vehicleId: string
  ): Promise<VehicleBooking[]> {
    try {
      console.log("📥 ApiService.getMyVehicleBookings - Params:", {
        userId,
        vehicleType,
        vehicleId
      });

      const res = await fetch(
        `${this.apiUrl}/myVehicleBookings/${userId}?vechileType=${vehicleType}&VechileId=${vehicleId}`,
        {
          method: "GET",
          redirect: "follow",
          headers: authHeader(),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("✅ ApiService.getMyVehicleBookings - Response:", data);

      return data || [];
    } catch (err) {
      console.error("❌ ApiService.getMyVehicleBookings - Error:", err);
      throw err;
    }
  }
}

export const chatService = new ApiService(API_BASE_URL);

export const createTicket = ticketAPI.createTicket;









// ---- GET OWNER PENDING BOOKINGS ----
export const getOwnerPendingBookings = async (ownerId: string): Promise<any> => {
  return apiClient.get(`/getPendingBookingsOfOwner/${ownerId}`);
};

// ---- ACCEPT BOOKING ----
export const acceptBooking = async (bookingId: string): Promise<any> => {
  return apiClient.put(`/updateBookingStatus/${bookingId}`, {
    status: "Confirmed",
  });
};

// ---- REJECT BOOKING ----
export const rejectBooking = async (bookingId: string): Promise<any> => {
  return apiClient.put(`/updateBookingStatus/${bookingId}`, {
    status: "Declined",
  });
};

// ==================== OWNER SUBSCRIPTION APIs (Cashfree) ====================
export const subscriptionAPI = {
  getMyStatus: async (): Promise<any> => {
    return apiClient.get("/subscriptions/me");
  },

  createOrder: async (plan: "pro"): Promise<any> => {
    return apiClient.post("/subscriptions/create-order", { plan });
  },
};

// ✅ FINAL DEFAULT EXPORT - All APIs defined above
// ==================== SUPERADMIN APIs ====================
export const adminAPI = {
  getAllUsers: async (params?: { limit?: number; skip?: number }): Promise<any> => {
    return apiClient.get("/admin/users", { params });
  },
  getAllVehicles: async (params?: { vehicleType?: string; status?: string; limit?: number; skip?: number }): Promise<any> => {
    return apiClient.get("/admin/vehicles", { params });
  },
  getAllBookings: async (params?: { status?: string; limit?: number; skip?: number }): Promise<any> => {
    return apiClient.get("/admin/bookings", { params });
  },
  getAllSubscriptions: async (params?: { limit?: number; skip?: number }): Promise<any> => {
    return apiClient.get("/admin/subscriptions", { params });
  },
  getPlans: async (): Promise<any> => {
    return apiClient.get("/admin/plans");
  },
  updatePlan: async (planId: string, updates: { label?: string; price?: number; durationDays?: number; maxVehicles?: number | null; priority?: boolean }): Promise<any> => {
    return apiClient.put(`/admin/plans/${planId}`, updates);
  },
  // Reuses the existing (now admin-gated) vehicle-approval endpoints
  getPendingVehicles: async (vehicleType: "Car" | "Bike" | "Auto"): Promise<any> => {
    return apiClient.get(`/getPendingVehicles?vehicleType=${vehicleType}`);
  },
  updateVehicleStatus: async (vehicleType: "Car" | "Bike" | "Auto", vehicleId: string, status: string): Promise<any> => {
    return apiClient.post("/updateVehicleStatus", { vehicleType, vehicleId, status });
  },
  replaceVehiclePhoto: async (vehicleType: "Car" | "Bike" | "Auto", vehicleId: string, index: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiClient.put(`/admin/vehicles/${vehicleType}/${vehicleId}/photo/${index}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

const apiService = {
  car: carAPI,
  bike: bikeAPI,
  review: reviewAPI,
  booking: bookingAPI,
  availability: availabilityAPI,
  user: userAPI,
  notification: notificationAPI,
  ticket: ticketAPI,
  chat: chatService,
  subscription: subscriptionAPI,
  admin: adminAPI,
  utils: utils,
};

export default apiService;