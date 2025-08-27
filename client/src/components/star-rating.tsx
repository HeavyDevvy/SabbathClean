import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showLabel?: boolean;
  label?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  readonly = false,
  showLabel = true,
  label,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarState = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    return starIndex <= currentRating;
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return "No rating";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return `${rating}/5`;
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className="flex space-x-1"
        onMouseLeave={handleMouseLeave}
        data-testid="star-rating"
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1;
          const isActive = getStarState(starIndex);
          
          return (
            <button
              key={starIndex}
              type="button"
              className={`
                ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
                transition-all duration-150
                ${!readonly ? "hover:drop-shadow-sm" : ""}
              `}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              disabled={readonly}
              data-testid={`star-${starIndex}`}
              aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  transition-colors duration-150
                  ${
                    isActive
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-300"
                  }
                  ${!readonly && hoverRating >= starIndex ? "drop-shadow-sm" : ""}
                `}
              />
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label || getRatingText(hoverRating || rating)}
          {rating > 0 && !label && (
            <span className="ml-1 text-gray-500">({rating}/5)</span>
          )}
        </span>
      )}
    </div>
  );
}

// Component for displaying overall ratings with review count
interface OverallRatingProps {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
}

export function OverallRating({ rating, reviewCount, size = "md" }: OverallRatingProps) {
  return (
    <div className="flex items-center space-x-2">
      <StarRating rating={rating} size={size} readonly showLabel={false} />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
      </span>
    </div>
  );
}