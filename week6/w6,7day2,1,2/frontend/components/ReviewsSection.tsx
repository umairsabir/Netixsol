'use client';

import { useState, useEffect } from 'react';
import { Star, Check, Loader2, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsSection({ productId, onReviewAdded }: { productId: string, onReviewAdded?: () => void }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/reviews/${productId}`, { rating, comment });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">All Reviews ({reviews.length})</h3>
          <p className="text-gray-400 font-medium">Real feedback from our verified community members.</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => user ? setShowForm(true) : toast.error('Please login to write a review')}
            className="bg-black hover:bg-zinc-800 rounded-full px-8 py-6 h-auto text-sm font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Write A Review
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-16 bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-black/5 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-xl font-black uppercase tracking-tight mb-8">Share Your Experience</h4>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about this product?"
                className="w-full bg-white border-2 border-transparent focus:border-black rounded-3xl p-6 min-h-[150px] outline-none transition-all text-gray-600 font-medium"
              />
            </div>
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-black hover:bg-zinc-800 rounded-full px-12 py-7 h-auto text-base font-black uppercase tracking-widest shadow-2xl disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </Button>
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-full px-8 py-7 h-auto text-sm font-black uppercase tracking-widest text-gray-400 hover:text-black"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
           <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-400 font-medium text-lg italic uppercase">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 transition-all hover:bg-gray-50/30 group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'}`} />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="font-extrabold text-lg uppercase tracking-tight">{review.name}</span>
                <div className="bg-green-500 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                </div>
              </div>

              <p className="text-gray-500 leading-relaxed font-medium mb-8">
                "{review.comment}"
              </p>

              <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                Posted On {format(new Date(review.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
