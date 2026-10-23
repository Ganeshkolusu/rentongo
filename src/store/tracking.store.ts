import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL, authHeader } from '../services/api.service';

let trackingSocket: Socket | null = null;
let watchId: number | null = null;

export interface TrackedPoint {
  latitude: number;
  longitude: number;
  recordedAt?: string;
}

interface TrackingState {
  isConnected: boolean;
  isSharing: boolean;
  sharingBookingId: string | null;
  isWatching: boolean;
  watchingBookingId: string | null;
  latestLocation: TrackedPoint | null;
  path: TrackedPoint[];
  error: string | null;

  // Owner side: broadcast this device's live location for a booking
  startSharing: (bookingId: string, userId: string, source?: 'renterApp' | 'driverApp') => void;
  stopSharing: () => void;

  // Customer side: watch another party's live location for a booking
  startWatching: (bookingId: string) => Promise<void>;
  stopWatching: () => void;
}

const ensureSocket = (): Socket => {
  if (!trackingSocket) {
    trackingSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return trackingSocket;
};

export const useTrackingStore = create<TrackingState>((set, get) => ({
  isConnected: false,
  isSharing: false,
  sharingBookingId: null,
  isWatching: false,
  watchingBookingId: null,
  latestLocation: null,
  path: [],
  error: null,

  startSharing: (bookingId, userId, source = 'renterApp') => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation is not supported on this device/browser' });
      return;
    }

    const socket = ensureSocket();
    socket.emit('joinBooking', bookingId);

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: TrackedPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        socket.emit('updateLocation', {
          bookingId,
          userId,
          source,
          latitude: point.latitude,
          longitude: point.longitude,
        });
        set({ latestLocation: point });
      },
      (geoError) => {
        set({ error: geoError.message });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    set({ isSharing: true, sharingBookingId: bookingId, error: null });
  },

  stopSharing: () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    set({ isSharing: false, sharingBookingId: null });
  },

  startWatching: async (bookingId) => {
    const socket = ensureSocket();
    socket.emit('joinBooking', bookingId);

    socket.off('locationUpdate');
    socket.on('locationUpdate', (point: TrackedPoint) => {
      const state = get();
      if (state.watchingBookingId !== bookingId) return;
      set({
        latestLocation: point,
        path: [...state.path, point].slice(-200),
      });
    });

    socket.off('connect');
    socket.on('connect', () => set({ isConnected: true }));
    socket.off('disconnect');
    socket.on('disconnect', () => set({ isConnected: false }));

    set({ isWatching: true, watchingBookingId: bookingId, path: [], latestLocation: null, error: null });

    // Seed with the last known point so the map isn't empty before the first live ping
    try {
      const res = await fetch(`${API_BASE_URL}/getLatestLocation/${bookingId}`, {
        headers: { ...authHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.point) {
          set({
            latestLocation: {
              latitude: data.point.latitude,
              longitude: data.point.longitude,
              recordedAt: data.point.recordedAt,
            },
          });
        }
      }
    } catch {
      // No prior location yet — fine, wait for the first live update
    }
  },

  stopWatching: () => {
    if (trackingSocket) {
      trackingSocket.off('locationUpdate');
    }
    set({ isWatching: false, watchingBookingId: null });
  },
}));
