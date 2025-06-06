
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createReview, getReviewsForOffer, markReviewHelpful, DealReview } from '@/services/reviewService';

interface DealReviewsProps {
  offerId: string;
}

const DealReviews: React.FC<DealReviewsProps> = ({ offerId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [offerId]);

  const loadReviews = async () => {
    try {
      const data = await getReviewsForOffer(offerId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createReview({
        user_id: session.user.id,
        offer_id: offerId,
        rating,
        review_text: reviewText.trim() || undefined
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your review!"
      });

      setShowAddReview(false);
      setRating(0);
      setReviewText('');
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to vote on reviews",
        variant: "destructive"
      });
      return;
    }

    try {
      await markReviewHelpful(reviewId, isHelpful);
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!"
      });
      loadReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: string = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowAddReview(!showAddReview)}
              variant="outline"
              size="sm"
            >
              Write Review
            </Button>
          </div>
        </CardHeader>

        {/* Add Review Form */}
        {showAddReview && (
          <CardContent className="border-t pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                {renderStars(rating, true, 'w-6 h-6')}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this deal..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-20"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={loading || rating === 0}
                  size="sm"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => setShowAddReview(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.profiles?.avatar_url} />
                  <AvatarFallback>
                    {review.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">
                        {review.profiles?.name || 'Anonymous User'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleMarkHelpful(review.id, true)}
                        >
                          Mark as Helpful
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleMarkHelpful(review.id, false)}
                        >
                          Mark as Not Helpful
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {review.review_text && (
                    <p className="text-sm text-gray-700 mt-2">
                      {review.review_text}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleMarkHelpful(review.id, true)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Helpful ({review.helpful_count || 0})
                    </button>
                    
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                      <MessageCircle className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reviews.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to review this deal!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DealReviews;
