import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import movieRoute from './movie.route';
import subscriptionRoute from './subscription.route';
import adminRoute from './admin.route';
import reviewRoute from './review.route';
import docsRoute from './docs.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/movies',
    route: movieRoute,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
];

const devRoutes = [
  { path: '/docs', route: docsRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
