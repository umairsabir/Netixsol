import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Upload,
  X,
  Film,
  Image as ImageIcon,
  ChevronLeft,
  Save,
} from "lucide-react";
import { CastListInput } from "../../components/admin/CastListInput";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/axios";
import { ConfirmModal } from "../../components/admin/ConfirmModal";
import { CategorySelect } from "../../components/admin/CategorySelect";

interface MovieFormValues {
  title: string;
  description: string;
  genres: string[];
  releaseYear: number;
  category: "movie" | "show";
  isPremium: string;
  cast: any[];
  director: string;
  music: string;
  isPublished: string;
  tags: string;
  language: string;
  imdbRating: number;
  streamvibeRating: number;
}

import { uploadToCloudinary } from "../../lib/cloudinary";

const AdminEditMoviePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["adminMovie", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/movies/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MovieFormValues>({
    defaultValues: {
      isPremium: "true",
      isPublished: "false",
      genres: [],
      cast: [],
    },
  });

  const genres = watch("genres") || [];
  const cast = watch("cast") || [];

  // Strip Mongoose subdocument _id fields from a cast array before use in form or submission
  const normalizeCast = (castArr: any[]): { name: string; image?: string }[] =>
    (castArr || []).map(({ name, image }: any) => ({
      name,
      ...(image ? { image } : {}),
    }));

  useEffect(() => {
    if (movie) {
      reset({
        title: movie.title,
        description: movie.description,
        releaseYear: movie.releaseYear,
        category: movie.category,
        isPremium: String(movie.isPremium),
        director:
          typeof movie.director === "object"
            ? movie.director?.name || ""
            : movie.director || "",
        music:
          typeof movie.music === "object"
            ? movie.music?.name || ""
            : movie.music || "",
        // Strip _id from cast subdocs — prefer string .id (from toJSON plugin), fallback to _id.toString()
        cast: normalizeCast(Array.isArray(movie.cast) ? movie.cast : []),
        isPublished: String(movie.isPublished),
        // CRITICAL: use string .id (not ObjectId ._id) so genres are sent as plain strings
        genres: Array.isArray(movie.genres)
          ? movie.genres.map((g: any) =>
            typeof g === "object" ? (g.id ?? String(g._id)) : g,
          )
          : [],
        tags: Array.isArray(movie.tags) ? movie.tags.join(", ") : "",
        language: Array.isArray(movie.language)
          ? movie.language.join(", ")
          : "",
        imdbRating: movie.imdbRating ?? 0,
        streamvibeRating: movie.streamvibeRating ?? 0,
      });
    }
  }, [movie, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: MovieFormValues) => {
      let posterData = null;
      let videoData = null;

      if (posterFile) {
        setUploadStatus("Uploading new poster...");
        posterData = await uploadToCloudinary(posterFile, "image", (p) =>
          setUploadProgress(Math.round(p * 0.1)),
        );
      }

      if (videoFile) {
        setUploadStatus("Uploading new video...");
        videoData = await uploadToCloudinary(videoFile, "video", (p) =>
          setUploadProgress(10 + Math.round(p * 0.85)),
        );
      }

      setUploadStatus("Updating movie metadata...");
      setUploadProgress(98);

      return api.patch(`/admin/movies/${id}`, {
        ...data,
        // Coerce string values from <select> to booleans
        isPremium: data.isPremium === "true",
        isPublished: data.isPublished === "true",
        // Always strip Mongoose _id from cast before sending to backend
        cast: normalizeCast(data.cast || []),
        tags: (data.tags || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        language: (data.language || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        imdbRating: Number(data.imdbRating) || 0,
        streamvibeRating: Number(data.streamvibeRating) || 0,
        ...(posterData
          ? {
            posterUrl: posterData.secure_url,
            posterPublicId: posterData.public_id,
          }
          : {}),
        ...(videoData
          ? {
            videoUrl: videoData.secure_url,
            videoPublicId: videoData.public_id,
            hlsUrl: videoData.hlsUrl,
            duration: videoData.duration,
          }
          : {}),
      });
    },
    onSuccess: () => {
      setUploadProgress(100);
      showToast("Movie updated successfully!", "success");
      navigate("/admin/movies");
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Update failed", "error");
      setUploadProgress(0);
      setUploadStatus("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/admin/movies/${id}`),
    onSuccess: () => {
      showToast("Movie deleted successfully!", "success");
      navigate("/admin/movies");
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Delete failed", "error");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/movies")}
            className="p-2 text-text-s hover:text-text-p bg-surface border border-border-darker rounded-[8px] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-text-p text-[28px] font-bold">
                Edit Content
              </h1>
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${movie?.isPublished ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}
              >
                {movie?.isPublished ? "Published" : "Draft"}
              </div>
            </div>
            <p className="text-text-s text-[14px] mt-1">
              Update metadata or replace media for "{movie?.title}".
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 text-primary border border-primary/20 hover:bg-primary/10 rounded-[8px] text-[13px] font-bold transition-all"
          >
            Delete Content
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
        className="bg-surface border border-border-darker rounded-[12px] p-8 flex flex-col gap-8"
      >
        {/* Media Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poster Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-text-p text-[14px] font-semibold">
              Poster Image
            </label>
            <div
              className={`border-2 border-dashed rounded-[12px] h-[300px] relative overflow-hidden flex flex-col items-center justify-center p-6 transition-all ${posterFile || movie?.posterUrl ? "border-primary/50 bg-bg-custom" : "border-border-darker hover:border-primary/50"}`}
            >
              {posterFile || movie?.posterUrl ? (
                <>
                  <img
                    src={
                      posterFile
                        ? URL.createObjectURL(posterFile)
                        : movie?.posterUrl
                    }
                    className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]"
                    alt="preview blur"
                  />
                  <div className="relative z-10 flex flex-col items-center bg-bg-custom/80 backdrop-blur-md p-4 rounded-[12px] border border-white/10 shadow-xl">
                    <img
                      src={
                        posterFile
                          ? URL.createObjectURL(posterFile)
                          : movie?.posterUrl
                      }
                      className="w-[80px] h-[120px] object-cover rounded-[8px] mb-3 shadow-lg border border-white/20"
                      alt="preview"
                    />
                    <p className="text-text-p text-[13px] font-medium truncate max-w-[180px]">
                      {posterFile ? posterFile.name : "Current Poster"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="poster-edit"
                        onChange={(e) =>
                          setPosterFile(e.target.files?.[0] || null)
                        }
                      />
                      <label
                        htmlFor="poster-edit"
                        className="text-text-p text-[12px] font-bold bg-primary/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        Change
                      </label>
                      {posterFile && (
                        <button
                          type="button"
                          onClick={() => setPosterFile(null)}
                          className="text-primary text-[12px] font-bold bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          <X size={12} /> Reset
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-surface border border-border-darker rounded-full flex items-center justify-center mb-4 text-text-s">
                    <ImageIcon size={24} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="poster-upload"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="poster-upload"
                    className="bg-primary text-text-p text-[12px] font-bold px-6 py-2 rounded-[8px] cursor-pointer hover:bg-red-700"
                  >
                    Select Image
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-text-p text-[14px] font-semibold">
              Video File
            </label>
            <div
              className={`border-2 border-dashed rounded-[12px] h-[300px] relative overflow-hidden flex flex-col items-center justify-center p-6 transition-all ${videoFile || movie?.videoUrl ? "border-primary/50 bg-bg-custom" : "border-border-darker hover:border-primary/50"}`}
            >
              {videoFile || movie?.videoUrl ? (
                <div className="relative z-10 flex flex-col items-center w-full h-full bg-bg-custom/90 backdrop-blur-md p-4 rounded-[12px]">
                  <video
                    src={
                      videoFile
                        ? URL.createObjectURL(videoFile)
                        : movie?.videoUrl
                    }
                    className="w-full h-[180px] bg-black rounded-[8px] mb-3 object-contain border border-white/10"
                    controls
                  />
                  <p className="text-text-p text-[13px] font-medium truncate max-w-[250px]">
                    {videoFile ? videoFile.name : "Current Video Stream"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="video-edit"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                    />
                    <label
                      htmlFor="video-edit"
                      className="text-text-p text-[12px] font-bold bg-primary/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                    >
                      Replace Video
                    </label>
                    {videoFile && (
                      <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="text-primary text-[12px] font-bold bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <X size={12} /> Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-surface border border-border-darker rounded-full flex items-center justify-center mb-4 text-text-s">
                    <Film size={24} />
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="video-upload"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="video-upload"
                    className="bg-primary text-text-p text-[12px] font-bold px-6 py-2 rounded-[8px] cursor-pointer hover:bg-red-700"
                  >
                    Select Video
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-text-p text-[13px] font-medium">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Inception"
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.title ? "border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]" : "border-border-darker"}`}
            />
            {errors.title && (
              <p className="text-primary text-[12px] font-medium">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-text-p text-[13px] font-medium">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              placeholder="Movie plot summary..."
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary resize-none transition-all ${errors.description ? "border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]" : "border-border-darker"}`}
            />
            {errors.description && (
              <p className="text-primary text-[12px] font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <CategorySelect
            label="Genres / Categories"
            selectedIds={genres}
            onChange={(newIds) => setValue("genres", newIds)}
            error={errors.genres?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Release Year
            </label>
            <input
              {...register("releaseYear", {
                required: "Year is required",
                min: { value: 1888, message: "Year must be 1888 or later" },
                max: {
                  value: new Date().getFullYear(),
                  message: "Cannot be in the future",
                },
              })}
              type="number"
              placeholder={String(new Date().getFullYear())}
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.releaseYear ? "border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]" : "border-border-darker"}`}
            />
            {errors.releaseYear && (
              <p className="text-primary text-[12px] font-medium">
                {errors.releaseYear.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Category
            </label>
            <select
              {...register("category")}
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            >
              <option value="movie">Movie</option>
              <option value="show">Show</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Access Type
            </label>
            <select
              {...register("isPremium")}
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            >
              <option value="true">Premium (Subscription Required)</option>
              <option value="false">Free (Guest/Public)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Publish Status
            </label>
            <select
              {...register("isPublished")}
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            >
              <option value="true">Published (Visible to Users)</option>
              <option value="false">Draft (Admin Only)</option>
            </select>
          </div>



          <div className="md:col-span-2">
            <CastListInput
              label="Cast"
              items={cast}
              onChange={(newCast) => setValue("cast", newCast)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Director Name
            </label>
            <input
              {...register("director")}
              placeholder="Christopher Nolan"
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Music Composer
            </label>
            <input
              {...register("music")}
              placeholder="Hans Zimmer"
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              IMDb Rating <span className="text-text-s">(0–10)</span>
            </label>
            <input
              {...register("imdbRating", {
                min: { value: 0, message: "Min rating is 0" },
                max: { value: 10, message: "Max IMDb rating is 10" },
              })}
              type="number"
              step="0.1"
              placeholder="8.5"
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.imdbRating ? "border-primary" : "border-border-darker"}`}
            />
            {errors.imdbRating && (
              <p className="text-primary text-[12px] font-medium">
                {errors.imdbRating.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              StreamVibe Rating <span className="text-text-s">(0–5)</span>
            </label>
            <input
              {...register("streamvibeRating", {
                min: { value: 0, message: "Min rating is 0" },
                max: { value: 5, message: "Max StreamVibe rating is 5" },
              })}
              type="number"
              step="0.1"
              placeholder="4.8"
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.streamvibeRating ? "border-primary" : "border-border-darker"}`}
            />
            {errors.streamvibeRating && (
              <p className="text-primary text-[12px] font-medium">
                {errors.streamvibeRating.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Languages (comma separated)
            </label>
            <input
              {...register("language")}
              placeholder="English, Hindi, Spanish"
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">
              Tags (comma separated)
            </label>
            <input
              {...register("tags")}
              placeholder="Action, Thriller, Sci-Fi"
              className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
            />
          </div>
        </div>

        {updateMutation.isPending && (
          <div className="w-full bg-border-darker/30 rounded-[12px] p-6 border border-border-darker flex flex-col gap-4 animate-pulse">
            <div className="flex justify-between items-center">
              <span className="text-text-p font-semibold text-[14px] flex items-center gap-2">
                <Upload size={16} className="text-primary" /> {uploadStatus}
              </span>
              <span className="text-primary font-bold text-[16px]">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-border-darker rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 shadow-[0_0_15px_rgba(230,0,0,0.5)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/movies")}
            className="px-6 py-3 rounded-[8px] text-text-p font-semibold hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-primary text-text-p font-semibold px-10 py-3 rounded-[8px] hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Upload size={18} className="animate-bounce" /> Updating...
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Content?"
        message={`Are you sure you want to delete "${movie?.title}"? This action cannot be undone and will remove all associated media.`}
        confirmLabel={
          deleteMutation.isPending ? "Deleting..." : "Delete Forever"
        }
      />
    </div>
  );
};

export default AdminEditMoviePage;
