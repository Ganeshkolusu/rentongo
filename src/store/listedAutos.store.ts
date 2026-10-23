// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export interface ListedAuto {
//   id: string;
//   vehicleNumber: string;
//   ownerName: string;
//   contactNumber: string;
//   farePrice: string;
//   description: string;
//   photos: string[]; // Array of photo URLs
//   rating: number;
//   createdAt: Date;
// }

// interface ListedAutosState {
//   autos: ListedAuto[];
//   addAuto: (auto: Omit<ListedAuto, 'id' | 'rating' | 'createdAt'>) => void;
//   updateAuto: (id: string, auto: Partial<ListedAuto>) => void;
//   deleteAuto: (id: string) => void;
//   getAutoById: (id: string) => ListedAuto | undefined;
// }

// export const useListedAutosStore = create<ListedAutosState>()(
//   persist(
//     (set, get) => ({
//       autos: [],

//       addAuto: (auto) => {
//         const newAuto: ListedAuto = {
//           ...auto,
//           id: Date.now().toString() + Math.random().toString(36),
//           rating: 0,
//           createdAt: new Date(),
//         };

//         set((state) => ({
//           autos: [newAuto, ...state.autos],
//         }));
//       },

//       updateAuto: (id, updatedAuto) => {
//         set((state) => ({
//           autos: state.autos.map((auto) =>
//             auto.id === id ? { ...auto, ...updatedAuto } : auto
//           ),
//         }));
//       },

//       deleteAuto: (id) => {
//         set((state) => ({
//           autos: state.autos.filter((auto) => auto.id !== id),
//         }));
//       },

//       getAutoById: (id) => {
//         return get().autos.find((auto) => auto.id === id);
//       },
//     }),
//     {
//       name: 'listed-autos-storage',
//     }
//   )
// );
export default {};