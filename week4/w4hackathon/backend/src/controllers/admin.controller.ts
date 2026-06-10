import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { movieService, planService, subscriptionService } from '../services';
import User from '../models/user.model';
import Movie from '../models/movie.model';
import * as cloudinaryService from '../services/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

const parseJson = (val: any) => {
  if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
};

const normalizeToObject = (val: any) => {
  if (typeof val === 'string' && val.trim() !== '') {
    return { name: val.trim() };
  }
  if (!val || (typeof val === 'string' && val.trim() === '')) {
    return { name: '', origin: '', image: null };
  }
  return val;
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = catchAsync(async (_req, res) => {
  const [totalMovies, publishedMovies, totalUsers, blockedUsers] = await Promise.all([
    Movie.countDocuments(),
    Movie.countDocuments({ isPublished: true }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ isBlocked: true }),
  ]);

  res.send({ totalMovies, publishedMovies, totalUsers, blockedUsers });
});

// ─── User Management ─────────────────────────────────────────────────────────

export const listUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter: any = { role: 'user' };
  if (search) {
    filter.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).select('-password'),
    User.countDocuments(filter),
  ]);
  res.send({ results: users, page: Number(page), limit: Number(limit), totalResults: total, totalPages: Math.ceil(total / Number(limit)) });
});

export const blockUser = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBlocked: true });
  res.send({ message: 'User blocked' });
});

export const unblockUser = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBlocked: false });
  res.send({ message: 'User unblocked' });
});

// ─── Movie Management ─────────────────────────────────────────────────────────

export const adminListMovies = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [movies, total] = await Promise.all([
    Movie.find().populate('genres', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Movie.countDocuments(),
  ]);
  res.send({ results: movies, page: Number(page), limit: Number(limit), totalResults: total, totalPages: Math.ceil(total / Number(limit)) });
});

export const adminGetMovie = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.movieId as string);
  res.send(movie);
});

export const getCloudinarySignature = catchAsync(async (req, res) => {
  const { type } = req.query; // 'image' or 'video'
  const folder = type === 'video' ? cloudinaryService.CLOUDINARY_CONFIG.video_folder : cloudinaryService.CLOUDINARY_CONFIG.image_folder;
  
  const params: any = { folder };
  if (type === 'video') {
    params.eager = cloudinaryService.CLOUDINARY_CONFIG.video_eager;
    params.eager_async = true;
  }

  const { signature, timestamp } = cloudinaryService.generateSignature(params);

  res.send({
    signature,
    timestamp,
    cloudName: cloudinary.config().cloud_name,
    apiKey: cloudinary.config().api_key,
    folder,
    ...(type === 'video' ? { eager: params.eager, eager_async: true } : {}),
  });
});

export const adminCreateMovie = catchAsync(async (req: any, res) => {
  const posterBuffer: Buffer | undefined = (req.files as any)?.poster?.[0]?.buffer;
  const videoBuffer: Buffer | undefined = (req.files as any)?.video?.[0]?.buffer;

  const genres = parseJson(req.body.genres);
  const language = parseJson(req.body.language);
  const cast = parseJson(req.body.cast);
  const director = normalizeToObject(parseJson(req.body.director));
  const music = normalizeToObject(parseJson(req.body.music));
  const releaseYear = Number(req.body.releaseYear);
  const isPremium = req.body.isPremium !== undefined ? req.body.isPremium === 'true' || req.body.isPremium === true : undefined;
  const isPublished = req.body.isPublished !== undefined ? req.body.isPublished === 'true' || req.body.isPublished === true : undefined;
  
  const movie = await movieService.createMovie({
    ...req.body,
    isPremium,
    isPublished,
    genres,
    language,
    cast,
    director,
    music,
    releaseYear,
    createdBy: req.user.id,
    posterBuffer,
    videoBuffer,
    // Direct upload fields
    posterUrl: req.body.posterUrl,
    posterPublicId: req.body.posterPublicId,
    videoUrl: req.body.videoUrl,
    videoPublicId: req.body.videoPublicId,
    hlsUrl: req.body.hlsUrl,
    duration: req.body.duration ? Number(req.body.duration) : undefined,
  });

  res.status(httpStatus.CREATED).send(movie);
});

export const adminUpdateMovie = catchAsync(async (req: any, res) => {
  const posterBuffer: Buffer | undefined = (req.files as any)?.poster?.[0]?.buffer;
  const videoBuffer: Buffer | undefined = (req.files as any)?.video?.[0]?.buffer;

  const genres = parseJson(req.body.genres);
  const language = parseJson(req.body.language);
  // Sanitize cast: strip any Mongoose subdoc _id/id fields the client may have sent back
  const rawCast = parseJson(req.body.cast);
  const cast = Array.isArray(rawCast)
    ? rawCast.map(({ name, image }: any) => ({ name, ...(image ? { image } : {}) }))
    : rawCast;
  const director = normalizeToObject(parseJson(req.body.director));
  const music = normalizeToObject(parseJson(req.body.music));
  const isPremium = req.body.isPremium !== undefined ? req.body.isPremium === 'true' || req.body.isPremium === true : undefined;
  const isPublished = req.body.isPublished !== undefined ? req.body.isPublished === 'true' || req.body.isPublished === true : undefined;

  const movie = await movieService.updateMovie(req.params.movieId, {
    ...req.body,
    isPremium,
    isPublished,
    genres,
    language,
    cast,
    director,
    music,
    posterBuffer,
    videoBuffer,
    // Direct upload fields
    posterUrl: req.body.posterUrl,
    posterPublicId: req.body.posterPublicId,
    videoUrl: req.body.videoUrl,
    videoPublicId: req.body.videoPublicId,
    hlsUrl: req.body.hlsUrl,
    duration: req.body.duration ? Number(req.body.duration) : undefined,
  });
  res.send(movie);
});

export const adminDeleteMovie = catchAsync(async (req, res) => {
  await movieService.deleteMovie(req.params.movieId as string);
  res.status(httpStatus.NO_CONTENT).send();
});

export const adminTogglePublish = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.movieId as string);
  await movieService.updateMovie(req.params.movieId as string, { isPublished: !movie.isPublished } as any);
  res.send({ isPublished: !(movie.isPublished) });
});

// ─── Plan Management ─────────────────────────────────────────────────────────

export const listPlans = catchAsync(async (_req, res) => {
  const plans = await planService.queryPlans(false);
  res.send(plans);
});

export const createPlan = catchAsync(async (req, res) => {
  const plan = await planService.createPlan(req.body);
  res.status(httpStatus.CREATED).send(plan);
});

export const updatePlan = catchAsync(async (req, res) => {
  const plan = await planService.updatePlan(req.params.planId as string, req.body);
  res.send(plan);
});

export const deletePlan = catchAsync(async (req, res) => {
  await planService.deletePlan(req.params.planId as string);
  res.status(httpStatus.NO_CONTENT).send();
});
