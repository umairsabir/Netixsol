import express from 'express';
import auth from '../../middlewares/auth';
import * as reviewController from '../../controllers/review.controller';

const router = express.Router();

router
  .route('/')
  .post(auth(), reviewController.createReview);

router
  .route('/:movieId')
  .get(reviewController.getMovieReviews);

export default router;
