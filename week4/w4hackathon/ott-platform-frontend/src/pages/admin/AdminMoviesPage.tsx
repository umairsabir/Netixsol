import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Film, Eye, Trash2, Edit, Globe, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/axios';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

const AdminMoviesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [toggleId, setToggleId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminMovies'],
    queryFn: async () => {
      const { data } = await api.get('/admin/movies');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/movies/${id}`),
    onSuccess: () => {
      showToast('Movie deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    },
    onError: () => showToast('Failed to delete movie', 'error'),
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/movies/${id}/toggle-publish`),
    onSuccess: (res: any) => {
      const isPublished = res.data?.isPublished;
      showToast(isPublished ? 'Movie published successfully' : 'Movie hidden from users', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    },
    onError: () => showToast('Failed to update visibility', 'error'),
  });

  const movies = data?.results || [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-text-p text-[28px] font-bold">Movie Library</h1>
          <p className="text-text-s text-[14px] mt-1">Manage, upload and publish your content.</p>
        </div>
        <Link 
          to="/admin/movies/upload"
          className="bg-primary text-text-p font-semibold px-5 py-2.5 rounded-[8px] flex items-center gap-2 hover:bg-red-700 transition-colors w-fit shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Upload Movie
        </Link>
      </div>

      <div className="bg-surface border border-border-darker rounded-[12px] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border-darker bg-bg-darker/30 flex items-center gap-3">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-s" size={16} />
            <input 
              type="text" 
              placeholder="Search movies..."
              className="w-full bg-bg-custom border border-border-darker rounded-[8px] pl-10 pr-4 py-2 text-[14px] text-text-p outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-darker bg-bg-darker/50">
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Movie</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Release</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-darker">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                     <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-text-s italic opacity-60">No movies found in the library.</td>
                </tr>
              ) : movies.map((movie: any) => (
                <tr key={movie.id} className="hover:bg-bg-darker/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 bg-bg-custom rounded-[4px] flex-shrink-0 overflow-hidden border border-border-darker">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-s"><Film size={16}/></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-p text-[14px] font-semibold truncate group-hover:text-primary transition-colors">{movie.title}</p>
                        <p className="text-text-s text-[12px] truncate opacity-80">{movie.genres?.map((g: any) => g.name || g).join(', ') || 'No Genres'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setToggleId(movie.id)}
                      disabled={togglePublishMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95 ${
                        movie.isPublished 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {movie.isPublished ? <Globe size={11} /> : <Lock size={11} />}
                      {movie.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-text-p text-[14px] font-medium opacity-80">{movie.releaseYear}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button 
                        onClick={() => navigate(`/movies/${movie.id}`)}
                        className="p-2 text-text-s hover:text-text-p hover:bg-surface rounded-[8px] transition-all" title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/movies/${movie.id}/edit`)}
                        className="p-2 text-text-s hover:text-text-p hover:bg-surface rounded-[8px] transition-all" title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(movie.id)}
                        className="p-2 text-text-s hover:text-primary hover:bg-primary/10 rounded-[8px] transition-all" title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Content?"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
      />

      <ConfirmModal 
        isOpen={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={() => toggleId && togglePublishMutation.mutate(toggleId)}
        title="Change Visibility?"
        message="This will change whether users can see this content on the platform."
        confirmLabel="Continue"
        variant="info"
      />
    </div>
  );
};

export default AdminMoviesPage;
