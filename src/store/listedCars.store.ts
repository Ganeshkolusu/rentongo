import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ListedCar {
  id: string;
  carName: string;
  carNumber:string;
  // vehicleNumber: string;
  model: string;
  fuel: string;
  transmission: string;
  totalKmVehicle: string;
  acAvailable: boolean;
  description: string;
  rentPrice: string;
  ownerName: string;
  contactNumber: string;
  drivingLicense: boolean;
  aadharCard: boolean;
  depositVehicle: boolean;
  depositMoney: string;
  state: string;
  city: string;
  pincode: string;
  street: string;
  doorNumber: string;
  photos: string[]; // Array of photo URLs
  rating: number;
  createdAt: Date;
}

interface ListedCarsState {
  cars: ListedCar[];
  addCar: (car: Omit<ListedCar, 'id' | 'rating' | 'createdAt'>) => void;
  updateCar: (id: string, car: Partial<ListedCar>) => void;
  deleteCar: (id: string) => void;
  getCarById: (id: string) => ListedCar | undefined;
}

export const useListedCarsStore = create<ListedCarsState>()(
  persist(
    (set, get) => ({
      cars: [],

      addCar: (car) => {
        const newCar: ListedCar = {
          ...car,
          id: Date.now().toString() + Math.random().toString(36),
          rating: 0,
          createdAt: new Date(),
        };

        set((state) => ({
          cars: [newCar, ...state.cars],
        }));
      },

      updateCar: (id, updatedCar) => {
        set((state) => ({
          cars: state.cars.map((car) =>
            car.id === id ? { ...car, ...updatedCar } : car
          ),
        }));
      },

      deleteCar: (id) => {
        set((state) => ({
          cars: state.cars.filter((car) => car.id !== id),
        }));
      },

      getCarById: (id) => {
        return get().cars.find((car) => car.id === id);
      },
    }),
    {
      name: 'listed-cars-storage',
    }
  )
);
