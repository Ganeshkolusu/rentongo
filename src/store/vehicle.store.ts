import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VehicleData {
  id: string;
  name: string;
  number:string;
  price: string;
  transmission: string;
  seats: string;
  fuel: string;
    engineCapacity?: string;
  ac: boolean;
  rating: string;
  image: string;
  description: string;
   type: "car" | "auto" | "bike"; 
  location: {
    state: string;
    district: string;
    city: string;
    pincode: string;
    street: string;
     
  };
  documents: {
    drivingLicense: boolean;
    aadharCard: boolean;
    depositVehicle: boolean;
    depositMoney: string;
  };
  createdAt: number;
}

interface VehicleStore {
  vehicles: VehicleData[];
  addVehicle: (vehicle: Omit<VehicleData, 'id' | 'createdAt'>) => void;
  updateVehicle: (id: string, updates: Partial<VehicleData>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleById: (id: string) => VehicleData | undefined;
  getVehicleByName: (name: string) => VehicleData | undefined;
}

export const useVehicleStore = create<VehicleStore>()(persist(
  (set, get) => ({
    vehicles: [],
    
    addVehicle: (vehicle) => {
      const newVehicle: VehicleData = {
        ...vehicle,
        id: Date.now().toString() + Math.random().toString(36),
        createdAt: Date.now(),
      };
      set((state) => ({ vehicles: [...state.vehicles, newVehicle] }));
    },
    
    updateVehicle: (id, updates) => {
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === id ? { ...vehicle, ...updates } : vehicle
        ),
      }));
    },
    
    deleteVehicle: (id) => {
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id),
      }));
    },
    
    getVehicleById: (id) => {
      return get().vehicles.find((vehicle) => vehicle.id === id);
    },
    
    getVehicleByName: (name) => {
      return get().vehicles.find((vehicle) => vehicle.name === name);
    },
  }),
  {
    name: 'vehicle-storage',
  }
));