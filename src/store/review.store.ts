import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  vehicleId: string;
  userName: string;
  rating: number;
  location: string;
  comment: string;
  timestamp: Date;
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'timestamp'>) => void;
  getReviewsByVehicleId: (vehicleId: string) => Review[];
  getAverageRating: (vehicleId: string) => number;
  getTotalReviewCount: (vehicleId: string) => number;
  getRatingDistribution: (vehicleId: string) => { stars: number; count: number; percentage: number }[];
}

export const useReviewStore = create<ReviewState>()(persist(
  (set, get) => ({
  reviews: [
    // {
    //   id: '1',
    //   vehicleId: '1',
    //   userName: 'Manoj Kumar',
    //   rating: 5,
    //   location: 'Kakinada',
    //   comment: 'Lorem ipsum is simply dummy text of the printing and typesetting industry.',
    //   timestamp: new Date(Date.now() - 86400000), // 1 day ago
    // },
    // {
    //   id: '2',
    //   vehicleId: '1',
    //   userName: 'Rajesh Singh',
    //   rating: 4,
    //   location: 'Rajahmundry',
    //   comment: 'Great service and well maintained vehicle. Highly recommend!',
    //   timestamp: new Date(Date.now() - 172800000), // 2 days ago
    // },
  ],

  addReview: (review) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString() + Math.random().toString(36),
      timestamp: new Date(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
    }));
  },

  getReviewsByVehicleId: (vehicleId: string) => {
    return get().reviews.filter((review) => review.vehicleId === vehicleId);
  },

  getAverageRating: (vehicleId: string) => {
    const vehicleReviews = get().reviews.filter((review) => review.vehicleId === vehicleId);
    if (vehicleReviews.length === 0) return 0;
    const sum = vehicleReviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / vehicleReviews.length).toFixed(1));
  },

  getTotalReviewCount: (vehicleId: string) => {
    return get().reviews.filter((review) => review.vehicleId === vehicleId).length;
  },

  getRatingDistribution: (vehicleId: string) => {
    const vehicleReviews = get().reviews.filter((review) => review.vehicleId === vehicleId);
    const total = vehicleReviews.length;
    
    if (total === 0) {
      return [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 }));
    }

    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = vehicleReviews.filter(review => review.rating === stars).length;
      const percentage = Math.round((count / total) * 100);
      return { stars, count, percentage };
    });

    return distribution;
  },
}),
{
  name: 'review-storage',
}
));
