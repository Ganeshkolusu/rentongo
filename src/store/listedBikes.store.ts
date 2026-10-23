import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ListedBike {
  id: string;
  vehicleName: string;
  vehicleNumber:string;
  engineCapacity?: string;
  farePrice: string;
  transmission?: string;
  
  fuel?: string;
  photos: string[];
  rating?: number;
  description?: string;
  state?: string;
  city?: string;
  pincode?: string;
  street?: string;
  drivingLicense: boolean;
  aadharCard: boolean;
  depositVehicle: boolean;
  depositMoney: string;
  createdAt?: Date;
}

interface ListedBikesState {
  bikes: ListedBike[];
  addBike: (bike: Omit<ListedBike, 'id' | 'rating' | 'createdAt'>) => void;
  updateBike: (id: string, bike: Partial<ListedBike>) => void;
  deleteBike: (id: string) => void;
  getBikeById: (id: string) => ListedBike | undefined;
}

export const useListedBikesStore = create<ListedBikesState>()(
  persist(
    (set, get) => ({
      bikes: [],

      addBike: (bike) => {
        const newBike: ListedBike = {
          ...bike,
          id: Date.now().toString() + Math.random().toString(36),
          rating: 0,
          createdAt: new Date(),
          drivingLicense: bike.drivingLicense ?? false,
          aadharCard: bike.aadharCard ?? false,
          depositVehicle: bike.depositVehicle ?? false,
          depositMoney: bike.depositMoney || "0",
          transmission: bike.transmission || "Manual",
          fuel: bike.fuel || "Petrol",
          engineCapacity: bike.engineCapacity || "",
          photos: bike.photos?.length ? bike.photos : [],
        };

        set((state) => ({
          bikes: [newBike, ...state.bikes],
        }));
      },

      updateBike: (id, updatedBike) => {
        set((state) => ({
          bikes: state.bikes.map((bike) =>
            bike.id === id
              ? {
                  ...bike,
                  ...updatedBike,
                  drivingLicense:
                    updatedBike.drivingLicense ?? bike.drivingLicense,
                  aadharCard: updatedBike.aadharCard ?? bike.aadharCard,
                  depositVehicle:
                    updatedBike.depositVehicle ?? bike.depositVehicle,
                  depositMoney: updatedBike.depositMoney ?? bike.depositMoney,
                  transmission:
                    updatedBike.transmission ?? bike.transmission,
                  fuel: updatedBike.fuel ?? bike.fuel,
                  engineCapacity:
                    updatedBike.engineCapacity ?? bike.engineCapacity,
                  photos:
                    updatedBike.photos?.length
                      ? updatedBike.photos
                      : bike.photos,
                }
              : bike
          ),
        }));
      },

      deleteBike: (id) => {
        set((state) => ({
          bikes: state.bikes.filter((bike) => bike.id !== id),
        }));
      },

      getBikeById: (id) => {
        return get().bikes.find((bike) => bike.id === id);
      },
    }),
    {
      name: 'listed-bikes-storage', // persisted key name
    }
  )
);

/**
 * ✅ Helper shortcut — safe for direct import (optional)
 * Use: import { useListedBikesStore, updateBike } from '../store/listedBikes.store';
 */
export const updateBikeInStore = (id: string, data: Partial<ListedBike>) =>
  useListedBikesStore.getState().updateBike(id, data);