import { useState } from "react";
import { Star, User, MessageCircle, Clock, Shield, MapPin, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CustomerRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  customer: any;
}

interface RatingCategories {
  communication: number;
  courtesy: number;
  cleanliness: number;
  accessibility: number;
  instructions: number;
}

export default function CustomerRatingModal({ 
  isOpen, 
  onClose, 
  booking, 
  customer 
}: CustomerRatingModalProps) {
  const [overallRating, setOverallRating] = useState(5);
  const [ratings, setRatings] = useState<RatingCategories>({
    communication: 5,
    courtesy: 5,
    cleanliness: 5,
    accessibility: 5,
    instructions: 5,
  });
  const [comment, setComment] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ratingCategories = [
    {
      key: 'communication' as keyof RatingCategories,
      label: 'Communication',
      description: 'How well did the customer communicate their needs?',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      key: 'courtesy' as keyof RatingCategories,
      label: 'Courtesy & Respect',
      description: 'Was the customer polite and respectful?',
      icon: User,
      color: 'text-green-600'
    },
    {
      key: 'cleanliness' as keyof RatingCategories,
      label: 'Property Condition',
      description: 'How clean and organized was the work environment?',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      key: 'accessibility' as keyof RatingCategories,
      label: 'Property Access',
      description: 'How easy was it to access the property and work areas?',
      icon: MapPin,
      color: 'text-orange-600'
    },
    {
      key: 'instructions' as keyof RatingCategories,
      label: 'Instructions & Requirements',
      description: 'Were the customer\'s instructions clear and helpful?',
      icon: FileText,
      color: 'text-indigo-600'
    }
  ];

  const submitRatingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/customer-reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Your customer review has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRatingChange = (category: keyof RatingCategories, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
    
    // Update overall rating based on average
    const newRatings = { ...ratings, [category]: rating };
    const average = Object.values(newRatings).reduce((sum, r) => sum + r, 0) / Object.values(newRatings).length;
    setOverallRating(Math.round(average));
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide at least an overall rating.",
        variant: "destructive",
      });
      return;
    }

    const reviewData = {
      bookingId: booking.id,
      customerId: customer.id,
      providerId: booking.providerId,
      rating: overallRating,
      communication: ratings.communication,
      courtesy: ratings.courtesy,
      cleanliness: ratings.cleanliness,
      accessibility: ratings.accessibility,
      instructions: ratings.instructions,
      comment: comment.trim(),
      wouldWorkAgain,
      isPrivate
    };

    submitRatingMutation.mutate(reviewData);
  };

  const StarRating = ({ rating, onRatingChange, size = "md" }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5", 
      lg: "h-6 w-6"
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} cursor-pointer transition-colors ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-200"
            }`}
            onClick={() => onRatingChange?.(star)}
            data-testid={`star-rating-${star}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Rate Your Customer Experience</h3>
              <p className="text-sm text-gray-600">Share your experience working with this customer</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={customer.profileImage} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {customer.firstName?.[0]}{customer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{customer.firstName} {customer.lastName}</h4>
                <p className="text-sm text-gray-600">{booking.address}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {booking.serviceType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {booking.bookingNumber}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="text-center space-y-3">
            <Label className="text-lg font-medium">Overall Customer Experience</Label>
            <div className="flex justify-center">
              <StarRating 
                rating={overallRating} 
                onRatingChange={setOverallRating}
                size="lg"
              />
            </div>
            <p className="text-sm text-gray-600">
              {overallRating === 5 && "Excellent customer - would love to work with again!"}
              {overallRating === 4 && "Great customer - professional and easy to work with"}
              {overallRating === 3 && "Good customer - standard professional interaction"}
              {overallRating === 2 && "Fair customer - some challenges but manageable"}
              {overallRating === 1 && "Difficult customer - would prefer not to work with again"}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Detailed Ratings</Label>
            {ratingCategories.map(({ key, label, description, icon: Icon, color }) => (
              <div key={key} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{label}</h5>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <StarRating 
                        rating={ratings[key]} 
                        onRatingChange={(rating) => handleRatingChange(key, rating)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share any additional feedback about working with this customer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              data-testid="comment-textarea"
            />
          </div>

          {/* Work Again & Privacy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Would you work with this customer again?</Label>
                <p className="text-sm text-gray-600">This helps us improve our matching</p>
              </div>
              <Switch
                checked={wouldWorkAgain}
                onCheckedChange={setWouldWorkAgain}
                data-testid="would-work-again-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Private Feedback</Label>
                <p className="text-sm text-gray-600">Keep this review private (not shown to customer)</p>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                data-testid="private-feedback-switch"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitRatingMutation.isPending}
              className="flex-1"
              data-testid="submit-review-button"
            >
              {submitRatingMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}