import React from 'react';
import { Plus, Star, ArrowLeft, ArrowRight } from 'lucide-react';

interface Review {
  id: string;
  user: {
    name: string;
    profilePic?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  movieId: string;
  reviews: Review[];
  onReviewAdded?: () => void;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex flex-row items-center gap-[4px] px-[10px] py-[6px] bg-bg-custom border border-border-darker rounded-[51px]">
       <div className="flex flex-row gap-[2px]">
          {[1,2,3,4,5].map(star => (
             <Star 
               key={star} 
               size={16} 
               fill={star <= rating ? "#E60000" : "none"} 
               stroke={star <= rating ? "#E60000" : "#999999"} 
             />
          ))}
       </div>
       <span className="text-text-p font-medium text-[12px] xl:text-[14px] ml-[2px]">{rating}</span>
    </div>
  );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ movieId, reviews, onReviewAdded }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [newRating, setNewRating] = React.useState(5);
  const [newContent, setNewContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const api = (await import('../../lib/axios')).default;
      await api.post('/reviews', { movieId, rating: newRating, content: newContent });
      setNewContent('');
      setShowForm(false);
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Failed to post review:', error);
      alert('Failed to post review. Please login and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-surface border border-border-darker rounded-[12px] p-[24px] xl:p-[40px] flex flex-col gap-[30px] xl:gap-[40px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-[16px]">
        <h3 className="text-text-s font-medium text-[16px] xl:text-[18px]">Reviews</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-[4px] px-[16px] py-[12px] xl:px-[20px] xl:py-[14px] bg-bg-custom border border-border-darker rounded-[8px] text-text-p hover:bg-border-darker transition-colors font-medium text-[14px] xl:text-[16px] cursor-pointer"
        >
          {showForm ? <Plus className="w-[16px] h-[16px] rotate-45" /> : <Plus className="w-[16px] h-[16px]" />}
          {showForm ? 'Cancel' : 'Add Your Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-custom border border-border-darker rounded-[10px] p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col gap-2">
             <label className="text-text-s text-[14px]">Rating</label>
             <div className="flex gap-2">
               {[1,2,3,4,5].map(star => (
                 <button 
                   key={star} 
                   type="button" 
                   onClick={() => setNewRating(star)}
                   className="text-text-p hover:scale-110 transition-transform"
                 >
                   <Star size={24} fill={star <= newRating ? "#E60000" : "none"} stroke={star <= newRating ? "#E60000" : "#999999"} />
                 </button>
               ))}
             </div>
           </div>
           <div className="flex flex-col gap-2">
             <label className="text-text-s text-[14px]">Your Feedback</label>
             <textarea 
               value={newContent}
               onChange={(e) => setNewContent(e.target.value)}
               placeholder="What did you think of this movie?"
               rows={4}
               className="bg-bg-darker border border-border-darker rounded-[8px] p-4 text-text-p text-[14px] outline-none focus:border-primary resize-none"
             />
           </div>
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="bg-primary text-text-p font-semibold py-3 rounded-[8px] hover:bg-red-700 transition-colors disabled:opacity-50"
           >
             {isSubmitting ? 'Posting...' : 'Post Review'}
           </button>
        </form>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        {reviews.length === 0 ? (
          <div className="md:col-span-2 py-10 text-center text-text-s bg-bg-custom border border-border-darker border-dashed rounded-[10px]">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : reviews.map(review => (
          <div key={review.id} className="bg-bg-custom border border-border-darker rounded-[10px] p-[30px] xl:p-[40px] flex flex-col gap-[20px]">
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-[16px]">
                <div className="flex flex-col gap-[4px]">
                   <h4 className="text-text-p font-medium text-[16px] xl:text-[20px]">{review.user.name}</h4>
                   <span className="text-text-s text-[12px] xl:text-[14px]">
                     {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                   </span>
                </div>
                <StarRating rating={review.rating} />
             </div>
             <p className="text-text-s text-[14px] xl:text-[16px] leading-[150%]">{review.content}</p>
          </div>
        ))}
      </div>

      {/* Pagination (Simplified placeholder for now) */}
      {reviews.length > 2 && (
        <div className="flex flex-row items-center justify-center gap-[10px] w-full mt-[-10px] xl:mt-[0px]">
            <button className="w-[44px] h-[44px] xl:w-[56px] xl:h-[56px] rounded-full bg-bg-custom border border-border-darker flex justify-center items-center text-text-p hover:bg-border-darker transition-colors cursor-pointer">
              <ArrowLeft className="w-[20px] h-[20px] xl:w-[28px] xl:h-[28px]" />
            </button>
            <div className="flex flex-row gap-[5px] items-center mx-[10px]">
               <div className="w-[16px] h-[4px] xl:w-[24px] xl:h-[4px] bg-primary rounded-[100px]" />
               <div className="w-[16px] h-[4px] xl:w-[24px] xl:h-[4px] bg-border-darker rounded-[100px]" />
            </div>
            <button className="w-[44px] h-[44px] xl:w-[56px] xl:h-[56px] rounded-full bg-bg-custom border border-border-darker flex justify-center items-center text-text-p hover:bg-border-darker transition-colors cursor-pointer">
              <ArrowRight className="w-[20px] h-[20px] xl:w-[28px] xl:h-[28px]" />
            </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
