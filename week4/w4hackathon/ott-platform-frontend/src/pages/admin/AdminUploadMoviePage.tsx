import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Upload, X, Film, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { CastListInput } from '../../components/admin/CastListInput';
import { CategorySelect } from '../../components/admin/CategorySelect';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/axios';

interface MovieFormValues {
  title: string;
  description: string;
  genres: string[];
  releaseYear: number;
  category: 'movie' | 'show';
  isPremium: string;
  cast: any[];
  director: string;
  music: string;
  tags: string;
  language: string;
  imdbRating: number;
  streamvibeRating: number;
}

import { uploadToCloudinary } from '../../lib/cloudinary';

const AdminUploadMoviePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MovieFormValues>({
    defaultValues: {
      category: 'movie',
      isPremium: 'true',
      genres: [],
      cast: [],
    }
  });

  const normalizeCast = (castArr: any[]): { name: string; image?: string }[] =>
    (castArr || []).map(({ name, image }: any) => ({ name, ...(image ? { image } : {}) }));

  const genres = watch('genres') || [];
  const cast = watch('cast') || [];

  const uploadMutation = useMutation({
    mutationFn: async (data: MovieFormValues) => {
      let posterData = null;
      let videoData = null;

      if (posterFile) {
        setUploadStatus('Uploading poster...');
        posterData = await uploadToCloudinary(posterFile, 'image', (p) => setUploadProgress(Math.round(p * 0.1)));
      }

      if (videoFile) {
        setUploadStatus('Uploading video...');
        videoData = await uploadToCloudinary(videoFile, 'video', (p) => setUploadProgress(10 + Math.round(p * 0.85)));
      }

      setUploadStatus('Finalizing on server...');
      setUploadProgress(98);

      return api.post('/admin/movies', {
        ...data,
        isPublished: true, // Auto-publish on upload
        // Coerce string values from <select> to booleans
        isPremium: data.isPremium === 'true',
        // Normalize cast (strip Mongoose subdoc _id if any)
        cast: normalizeCast(data.cast || []),
        tags: data.tags?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        language: data.language?.split(',').map((s: string) => s.trim()).filter(Boolean) || ['English'],
        imdbRating: Number(data.imdbRating) || 0,
        streamvibeRating: Number(data.streamvibeRating) || 0,
        ...(posterData ? { posterUrl: posterData.secure_url, posterPublicId: posterData.public_id } : {}),
        ...(videoData ? { videoUrl: videoData.secure_url, videoPublicId: videoData.public_id, hlsUrl: videoData.hlsUrl, duration: videoData.duration } : {}),
      });
    },
    onSuccess: (response) => {
      const newMovie = response.data;
      setUploadProgress(100);
      showToast('Movie uploaded and published successfully!', 'success');
      // Navigate to edit page instead of list
      navigate(`/admin/movies/${newMovie.id || newMovie._id}/edit`);
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Upload failed', 'error');
      setUploadProgress(0);
      setUploadStatus('');
    }
  });

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/movies')} className="p-2 text-text-s hover:text-text-p bg-surface border border-border-darker rounded-[8px] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-text-p text-[28px] font-bold">Upload Content</h1>
          <p className="text-text-s text-[14px] mt-1">Add a new movie or show to your library.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => uploadMutation.mutate(d))} className="bg-surface border border-border-darker rounded-[12px] p-8 flex flex-col gap-8">
        
        {/* Media Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poster Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-text-p text-[14px] font-semibold">Poster Image</label>
            <div className={`border-2 border-dashed rounded-[12px] h-[300px] relative overflow-hidden flex flex-col items-center justify-center p-6 transition-all ${posterFile ? 'border-primary/50 bg-bg-custom' : 'border-border-darker hover:border-primary/50'}`}>
              {posterFile ? (
                <>
                  <img src={URL.createObjectURL(posterFile)} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]" alt="preview blur" />
                  <div className="relative z-10 flex flex-col items-center bg-bg-custom/80 backdrop-blur-md p-4 rounded-[12px] border border-white/10 shadow-xl">
                    <img src={URL.createObjectURL(posterFile)} className="w-[80px] h-[120px] object-cover rounded-[8px] mb-3 shadow-lg border border-white/20" alt="preview" />
                    <p className="text-text-p text-[13px] font-medium truncate max-w-[180px]">{posterFile.name}</p>
                    <button type="button" onClick={() => setPosterFile(null)} className="flex items-center gap-1 text-primary text-[12px] mt-2 font-bold bg-primary/10 px-3 py-1 rounded-full"><X size={12}/> Remove</button>
                  </div>
                </>
              ) : (
                <>
                   <div className="w-12 h-12 bg-surface border border-border-darker rounded-full flex items-center justify-center mb-4 text-text-s"><ImageIcon size={24}/></div>
                   <p className="text-text-s text-[13px] text-center mb-4 font-medium">Vertical poster (2:3 aspect ratio)</p>
                   <input type="file" accept="image/*" className="hidden" id="poster-upload" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
                   <label htmlFor="poster-upload" className="bg-primary text-text-p text-[13px] font-bold px-6 py-2.5 rounded-[8px] cursor-pointer hover:bg-red-700 transition-all shadow-lg active:scale-95">Browse Image</label>
                </>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-text-p text-[14px] font-semibold">Video File</label>
            <div className={`border-2 border-dashed rounded-[12px] h-[300px] relative overflow-hidden flex flex-col items-center justify-center p-6 transition-all ${videoFile ? 'border-primary/50 bg-bg-custom' : 'border-border-darker hover:border-primary/50'}`}>
              {videoFile ? (
                <div className="relative z-10 flex flex-col items-center w-full h-full bg-bg-custom/90 backdrop-blur-md p-4 rounded-[12px]">
                  <video 
                    src={URL.createObjectURL(videoFile)} 
                    className="w-full h-[180px] bg-black rounded-[8px] mb-3 object-contain border border-white/10"
                    controls 
                  />
                  <p className="text-text-p text-[13px] font-medium truncate max-w-[250px]">{videoFile.name}</p>
                  <button type="button" onClick={() => setVideoFile(null)} className="flex items-center gap-1 text-primary text-[12px] mt-2 font-bold bg-primary/10 px-3 py-1 rounded-full"><X size={12}/> Remove Video</button>
                </div>
              ) : (
                <>
                   <div className="w-12 h-12 bg-surface border border-border-darker rounded-full flex items-center justify-center mb-4 text-text-s"><Film size={24}/></div>
                   <p className="text-text-s text-[13px] text-center mb-4 font-medium">MP4 or MKV up to 500MB</p>
                   <input type="file" accept="video/*" className="hidden" id="video-upload" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                   <label htmlFor="video-upload" className="bg-primary text-text-p text-[13px] font-bold px-6 py-2.5 rounded-[8px] cursor-pointer hover:bg-red-700 transition-all shadow-lg active:scale-95">Browse Video</label>
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
              {...register('title', { required: 'Title is required' })} 
              placeholder="e.g. Inception" 
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.title ? 'border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]' : 'border-border-darker'}`} 
            />
            {errors.title && <p className="text-primary text-[12px] font-medium">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-text-p text-[13px] font-medium">Description</label>
            <textarea 
              {...register('description', { required: 'Description is required' })} 
              rows={4} 
              placeholder="Movie plot summary..." 
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary resize-none transition-all ${errors.description ? 'border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]' : 'border-border-darker'}`} 
            />
            {errors.description && <p className="text-primary text-[12px] font-medium">{errors.description.message}</p>}
          </div>
          
          <CategorySelect 
            label="Genres / Categories" 
            selectedIds={genres} 
            onChange={(newIds) => setValue('genres', newIds)} 
            error={errors.genres?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Release Year</label>
            <input 
              {...register('releaseYear', { 
                required: 'Year is required',
                min: { value: 1888, message: 'Year must be 1888 or later' },
                max: { value: new Date().getFullYear(), message: 'Cannot be in the future' } 
              })} 
              type="number" 
              placeholder={String(new Date().getFullYear())} 
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.releaseYear ? 'border-primary shadow-[0_0_8px_rgba(230,0,0,0.2)]' : 'border-border-darker'}`} 
            />
            {errors.releaseYear && <p className="text-primary text-[12px] font-medium">{errors.releaseYear.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Category</label>
            <select {...register('category')} className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary">
              <option value="movie">Movie</option>
              <option value="show">Show</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Access Type</label>
            <select {...register('isPremium')} className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary">
              <option value="true">Premium (Subscription Required)</option>
              <option value="false">Free (Guest/Public)</option>
            </select>
          </div>


          
          <div className="md:col-span-2">
            <CastListInput 
               label="Cast" 
               items={cast} 
               onChange={(newCast) => setValue('cast', newCast)} 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Director Name</label>
            <input {...register('director')} placeholder="Christopher Nolan" className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Music Composer</label>
            <input {...register('music')} placeholder="Hans Zimmer" className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">IMDb Rating <span className="text-text-s">(0–10)</span></label>
            <input 
              {...register('imdbRating', {
                min: { value: 0, message: 'Min rating is 0' },
                max: { value: 10, message: 'Max IMDb rating is 10' },
              })} 
              type="number" step="0.1" placeholder="8.5" 
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.imdbRating ? 'border-primary' : 'border-border-darker'}`} 
            />
            {errors.imdbRating && <p className="text-primary text-[12px] font-medium">{errors.imdbRating.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">StreamVibe Rating <span className="text-text-s">(0–5)</span></label>
            <input 
              {...register('streamvibeRating', {
                min: { value: 0, message: 'Min rating is 0' },
                max: { value: 5, message: 'Max StreamVibe rating is 5' },
              })} 
              type="number" step="0.1" placeholder="4.8" 
              className={`bg-bg-custom border rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-all ${errors.streamvibeRating ? 'border-primary' : 'border-border-darker'}`} 
            />
            {errors.streamvibeRating && <p className="text-primary text-[12px] font-medium">{errors.streamvibeRating.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Languages (comma separated)</label>
            <input {...register('language')} placeholder="English, Hindi, Spanish" className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-p text-[13px] font-medium">Tags (comma separated)</label>
            <input {...register('tags')} placeholder="Action, Thriller, Sci-Fi" className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary" />
          </div>
        </div>

        {uploadMutation.isPending && (
          <div className="w-full bg-border-darker/30 rounded-[12px] p-6 border border-border-darker flex flex-col gap-4 animate-pulse">
             <div className="flex justify-between items-center">
               <span className="text-text-p font-semibold text-[14px] flex items-center gap-2">
                 <Upload size={16} className="text-primary" /> {uploadStatus}
               </span>
               <span className="text-primary font-bold text-[16px]">{uploadProgress}%</span>
             </div>
             <div className="w-full bg-border-darker rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300 shadow-[0_0_15px_rgba(230,0,0,0.5)]" style={{ width: `${uploadProgress}%` }} />
             </div>
             <p className="text-text-s text-[12px] text-center italic">Please do not close this tab or refresh the page.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
           <button type="button" onClick={() => navigate('/admin/movies')} className="px-6 py-3 rounded-[8px] text-text-p font-semibold hover:bg-surface transition-colors">Cancel</button>
           <button 
             type="submit" 
             disabled={uploadMutation.isPending}
             className="bg-primary text-text-p font-semibold px-10 py-3 rounded-[8px] hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center gap-2"
           >
             {uploadMutation.isPending ? <><Upload size={18} className="animate-bounce" /> Processing Content...</> : 'Save and Publish'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUploadMoviePage;
