import httpStatus from 'http-status';
import Movie from '../models/movie.model';
import ApiError from '../utils/ApiError';
import * as cloudinaryService from './cloudinary.service';

interface MovieCreateData {
  title: string;
  description: string;
  genres: string[];
  releaseYear: number;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  isPublished?: boolean;
  language?: string[];
  cast?: { name: string; image?: string }[];
  director?: { name: string; origin?: string; image?: string };
  music?: { name: string; origin?: string; image?: string };
  imdbRating?: number;
  streamvibeRating?: number;
  createdBy: string;
  posterBuffer?: Buffer;
  videoBuffer?: Buffer;
  posterUrl?: string;
  posterPublicId?: string;
  videoUrl?: string;
  videoPublicId?: string;
  hlsUrl?: string;
  duration?: number;
}

/**
 * Create a movie with optional Cloudinary uploads
 */
export const createMovie = async (data: MovieCreateData) => {
  const movieData: any = {
    title: data.title,
    description: data.description,
    genres: data.genres,
    releaseYear: data.releaseYear,
    category: data.category || 'movie',
    tags: data.tags || [],
    isPremium: data.isPremium !== undefined ? data.isPremium : true,
    isPublished: data.isPublished !== undefined ? data.isPublished : false,
    language: data.language || ['English'],
    cast: data.cast || [],
    director: data.director,
    music: data.music,
    imdbRating: data.imdbRating,
    streamvibeRating: data.streamvibeRating,
    createdBy: data.createdBy,
    uploadStatus: 'pending',
  };

  // Upload poster if provided (buffer)
  if (data.posterBuffer) {
    const { secure_url, public_id } = await cloudinaryService.uploadImage(data.posterBuffer);
    movieData.posterUrl = secure_url;
    movieData.posterPublicId = public_id;
  } else if (data.posterUrl && data.posterPublicId) {
    // Or use pre-uploaded poster from direct signed upload
    movieData.posterUrl = data.posterUrl;
    movieData.posterPublicId = data.posterPublicId;
  }

  // Upload video if provided (buffer)
  if (data.videoBuffer) {
    const { secure_url, public_id, hlsUrl, duration } = await cloudinaryService.uploadVideo(data.videoBuffer);
    movieData.videoUrl = secure_url;
    movieData.videoPublicId = public_id;
    movieData.hlsUrl = hlsUrl;
    movieData.uploadStatus = 'ready';
    if (duration) {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      movieData.duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
      movieData.durationSeconds = duration;
    }
  } else if (data.videoUrl && data.videoPublicId) {
    // Or use pre-uploaded video from direct signed upload
    movieData.videoUrl = data.videoUrl;
    movieData.videoPublicId = data.videoPublicId;
    movieData.hlsUrl = data.hlsUrl;
    movieData.uploadStatus = 'ready';
    if (data.duration) {
      const h = Math.floor(data.duration / 3600);
      const m = Math.floor((data.duration % 3600) / 60);
      movieData.duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
      movieData.durationSeconds = data.duration;
    }
  }

  return Movie.create(movieData);
};

/**
 * Query movies with pagination, search, and filters
 */
export const queryMovies = async (
  filter: Record<string, any>,
  options: { limit?: number; page?: number; sortBy?: string },
) => {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;

  const query: any = { isPublished: true, ...filter };

  // Handle genre filter (which is now dynamic categories)
  if (filter.genre) {
    query.genres = filter.genre;
    delete query.genre;
  }

  const [movies, total] = await Promise.all([
    Movie.find(query)
      .populate('genres', 'name slug')
      .sort(options.sortBy === 'newest' ? { releaseYear: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Movie.countDocuments(query),
  ]);

  return {
    results: movies,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Get a single movie by id
 */
export const getMovieById = async (id: string) => {
  const movie = await Movie.findById(id).populate('genres', 'name slug');
  if (!movie) throw new ApiError(httpStatus.NOT_FOUND, 'Movie not found');
  return movie;
};

/**
 * Update a movie's metadata or re-upload media
 */
export const updateMovie = async (id: string, updateData: Partial<MovieCreateData>) => {
  const movie = await getMovieById(id);

  // Replace poster if new buffer provided
  if (updateData.posterBuffer) {
    if (movie.posterPublicId) await cloudinaryService.deleteAsset(movie.posterPublicId, 'image');
    const { secure_url, public_id } = await cloudinaryService.uploadImage(updateData.posterBuffer);
    (movie as any).posterUrl = secure_url;
    (movie as any).posterPublicId = public_id;
  } else if (updateData.posterUrl && updateData.posterPublicId && updateData.posterPublicId !== movie.posterPublicId) {
    // Or use pre-uploaded poster from direct signed upload
    if (movie.posterPublicId) await cloudinaryService.deleteAsset(movie.posterPublicId, 'image');
    (movie as any).posterUrl = updateData.posterUrl;
    (movie as any).posterPublicId = updateData.posterPublicId;
  }

  // Replace video if new buffer provided
  if (updateData.videoBuffer) {
    if (movie.videoPublicId) await cloudinaryService.deleteAsset(movie.videoPublicId, 'video');
    const { secure_url, public_id, hlsUrl, duration } = await cloudinaryService.uploadVideo(updateData.videoBuffer);
    (movie as any).videoUrl = secure_url;
    (movie as any).videoPublicId = public_id;
    (movie as any).hlsUrl = hlsUrl;
    (movie as any).uploadStatus = 'ready';
    if (duration) {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      (movie as any).duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
      (movie as any).durationSeconds = duration;
    }
  } else if (updateData.videoUrl && updateData.videoPublicId && updateData.videoPublicId !== movie.videoPublicId) {
    // Or use pre-uploaded video from direct signed upload
    if (movie.videoPublicId) await cloudinaryService.deleteAsset(movie.videoPublicId, 'video');
    (movie as any).videoUrl = updateData.videoUrl;
    (movie as any).videoPublicId = updateData.videoPublicId;
    (movie as any).hlsUrl = updateData.hlsUrl;
    (movie as any).uploadStatus = 'ready';
    if (updateData.duration) {
      const h = Math.floor(updateData.duration / 3600);
      const m = Math.floor((updateData.duration % 3600) / 60);
      (movie as any).duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
      (movie as any).durationSeconds = updateData.duration;
    }
  }

  // Update scalar fields
  const scalarFields = [
    'title',
    'description',
    'genres',
    'releaseYear',
    'category',
    'tags',
    'isPremium',
    'isPublished',
    'language',
    'cast',
    'director',
    'music',
    'imdbRating',
    'streamvibeRating',
  ];
  scalarFields.forEach((field) => {
    if ((updateData as any)[field] !== undefined) {
      (movie as any)[field] = (updateData as any)[field];
    }
  });

  await movie.save();
  return movie;
};

/**
 * Delete a movie and its Cloudinary assets
 */
export const deleteMovie = async (id: string) => {
  const movie = await getMovieById(id);
  if (movie.posterPublicId) await cloudinaryService.deleteAsset(movie.posterPublicId, 'image');
  if (movie.videoPublicId) await cloudinaryService.deleteAsset(movie.videoPublicId, 'video');
  await movie.deleteOne();
};

/**
 * Increment view count
 */
export const incrementViews = async (id: string) => {
  await Movie.findByIdAndUpdate(id, { $inc: { views: 1 } });
};
