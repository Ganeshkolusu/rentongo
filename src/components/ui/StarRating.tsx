import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = "md",
  showNumber = false,
  className = "",
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Size classes for stars
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const starSize = sizeClasses[size];

  // Render full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={`${starSize} fill-yellow-400 text-yellow-400`}
      />
    );
  }

  // Render half star if needed
  if (hasHalfStar) {
    stars.push(
      <Star
        key="half"
        className={`${starSize} fill-yellow-400 text-yellow-400`}
        style={{ clipPath: "inset(0 50% 0 0)" }}
      />
    );
  }

  // Render empty stars
  const remainingStars = maxStars - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars}
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
