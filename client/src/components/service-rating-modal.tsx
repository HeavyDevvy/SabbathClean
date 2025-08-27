import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StarRating from "./star-rating";
import type { Booking, ServiceProvider } from "@shared/schema";

interface ServiceRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  provider: ServiceProvider;
}

export default function ServiceRatingModal({
  isOpen,
  onClose,
  booking,
  provider,
}: ServiceRatingModalProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    serviceQuality: 0,
    punctuality: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  
  const { toast } = useToast();

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reviews", {
        bookingId: booking.id,
        providerId: provider.id,
        rating: ratings.overall,
        serviceQuality: ratings.serviceQuality,
        punctuality: ratings.punctuality,
        professionalism: ratings.professionalism,
        comment: comment.trim() || null,
        wouldRecommend,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review helps improve our service.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (ratings.overall === 0) {
      toast({
        title: "Please provide a rating",
        description: "Please rate your overall experience before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitRatingMutation.mutate();
  };

  const getRatingCategory = (rating: number) => {
    if (rating === 5) return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (rating === 4) return { text: "Very Good", color: "bg-blue-100 text-blue-800" };
    if (rating === 3) return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
    if (rating === 2) return { text: "Fair", color: "bg-orange-100 text-orange-800" };
    if (rating === 1) return { text: "Poor", color: "bg-red-100 text-red-800" };
    return { text: "Not rated", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Rate Your Service Experience</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {provider.profileImage ? (
                    <img
                      src={provider.profileImage}
                      alt={`${provider.firstName} ${provider.lastName}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {provider.firstName} {provider.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Service: {booking.serviceName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(booking.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Overall Experience</Label>
            <div className="flex items-center space-x-4">
              <StarRating
                rating={ratings.overall}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, overall: rating }))}
                size="lg"
                data-testid="overall-rating"
              />
              {ratings.overall > 0 && (
                <Badge className={getRatingCategory(ratings.overall).color}>
                  {getRatingCategory(ratings.overall).text}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Rate Specific Aspects</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Service Quality</Label>
                <StarRating
                  rating={ratings.serviceQuality}
                  onRatingChange={(rating) => setRatings(prev => ({ ...prev, serviceQuality: rating }))}
                  showLabel={false}
                  data-testid="service-quality-rating"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Punctuality</Label>
                <StarRating
                  rating={ratings.punctuality}
                  onRatingChange={(rating) => setRatings(prev => ({ ...prev, punctuality: rating }))}
                  showLabel={false}
                  data-testid="punctuality-rating"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Professionalism</Label>
                <StarRating
                  rating={ratings.professionalism}
                  onRatingChange={(rating) => setRatings(prev => ({ ...prev, professionalism: rating }))}
                  showLabel={false}
                  data-testid="professionalism-rating"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Written Review */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-semibold">
              Share Your Experience (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience with this service provider..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
              data-testid="review-comment"
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Recommendation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Would you recommend this provider?</Label>
            <div className="flex space-x-4">
              <Button
                variant={wouldRecommend ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
                data-testid="recommend-yes"
              >
                Yes, I'd recommend
              </Button>
              <Button
                variant={!wouldRecommend ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
                data-testid="recommend-no"
              >
                No, I wouldn't
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitRatingMutation.isPending || ratings.overall === 0}
              className="flex-1"
              data-testid="button-submit-review"
            >
              {submitRatingMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}