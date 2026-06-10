import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin';
import paginate from './plugins/paginate.plugin';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    genres: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    }],
    releaseYear: {
      type: Number,
      required: true,
    },
    duration: {
      type: String, // e.g. "2h 30m"
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: null,
    },
    language: {
      type: [String],
      default: ['English'],
    },
    // Cloudinary media
    posterPublicId: { type: String, default: null },
    posterUrl: { type: String, default: null },
    videoPublicId: { type: String, default: null },
    videoUrl: { type: String, default: null },   // secure_url from Cloudinary
    hlsUrl: { type: String, default: null },      // HLS adaptive URL if available
    uploadStatus: {
      type: String,
      enum: ['pending', 'ready', 'failed'],
      default: 'pending',
    },
    // Discovery
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: true }, // requires subscription
    // Cast & crew
    cast: [{ name: String, image: { type: String, default: null } }],
    director: { name: String, origin: String, image: { type: String, default: null } },
    music:    { name: String, origin: String, image: { type: String, default: null } },
    // Ratings stored for display
    imdbRating: { type: Number, default: null },
    streamvibeRating: { type: Number, default: null },
    // Category
    category: {
      type: String,
      enum: ['movie', 'show'],
      default: 'movie',
    },
    tags: { type: [String], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

movieSchema.plugin(toJSON);
movieSchema.plugin(paginate);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
