import express from 'express';
import * as adminController from '../../controllers/admin.controller';
import categoryController from '../../controllers/category.controller';
import auth from '../../middlewares/auth';
import { uploadMovieFiles } from '../../middlewares/upload';

const router = express.Router();

// All admin routes require admin role
const requireAdmin = auth('manageMovies');

// Dashboard
router.get('/dashboard', requireAdmin, adminController.getDashboardStats);
router.get('/cloudinary-signature', requireAdmin, adminController.getCloudinarySignature);

// User management
router.get('/users', requireAdmin, adminController.listUsers);
router.patch('/users/:userId/block', requireAdmin, adminController.blockUser);
router.patch('/users/:userId/unblock', requireAdmin, adminController.unblockUser);

// Movie management
router.get('/movies', requireAdmin, adminController.adminListMovies);
router.get('/movies/:movieId', requireAdmin, adminController.adminGetMovie);
router.post('/movies', requireAdmin, uploadMovieFiles, adminController.adminCreateMovie);
router.patch('/movies/:movieId', requireAdmin, uploadMovieFiles, adminController.adminUpdateMovie);
router.delete('/movies/:movieId', requireAdmin, adminController.adminDeleteMovie);
router.patch('/movies/:movieId/toggle-publish', requireAdmin, adminController.adminTogglePublish);

// Plan management
router.get('/plans', requireAdmin, adminController.listPlans);
router.post('/plans', requireAdmin, adminController.createPlan);
router.patch('/plans/:planId', requireAdmin, adminController.updatePlan);
router.delete('/plans/:planId', requireAdmin, adminController.deletePlan);

// Category management
router.get('/categories', requireAdmin, categoryController.getCategories);
router.get('/categories/:categoryId', requireAdmin, categoryController.getCategory);
router.post('/categories', requireAdmin, categoryController.createCategory);
router.patch('/categories/:categoryId', requireAdmin, categoryController.updateCategory);
router.delete('/categories/:categoryId', requireAdmin, categoryController.deleteCategory);

export default router;
