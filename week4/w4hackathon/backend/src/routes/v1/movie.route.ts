import express from 'express';
import * as movieController from '../../controllers/movie.controller';
import categoryController from '../../controllers/category.controller';
import { softAuth } from '../../middlewares/auth';

const router = express.Router();

// Public
router.get('/', movieController.listMovies);
router.get('/categories', categoryController.getCategories);
router.get('/:movieId', movieController.getMovie);

// Protected/Public: returns stream URL based on premium status
router.get('/:movieId/play', softAuth(), movieController.playMovie);

export default router;
