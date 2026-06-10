import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import Review from '../models/review.model';
import ApiError from '../utils/ApiError';

export const createReview = catchAsync(async (req, res) => {
  const { movieId, rating, content } = req.body;
  const review = await Review.create({
    movie: movieId,
    user: (req as any).user.id,
    rating,
    content,
  });
  
  // Populate user data for response
  const populated = await review.populate('user', 'name profilePic');
  res.status(httpStatus.CREATED).send(populated);
});

export const getMovieReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId })
    .populate('user', 'name profilePic')
    .sort({ createdAt: -1 });
  res.send(reviews);
});
