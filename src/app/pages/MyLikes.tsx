import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

export const MyLikes = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-116da2c5`;

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/likes/list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || []);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      toast.error('Failed to load likes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFCC]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black z-40 px-4 py-4 flex items-center space-x-4 border-b border-white/10">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold">My Likes</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-lg">Please log in to see your likes</p>
          </div>
        ) : likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">❤️</span>
            </div>
            <p className="text-gray-400 text-lg">No likes yet</p>
            <p className="text-gray-500 text-sm mt-2">Start liking movies you enjoy</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {likes.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title || movie.name}
                posterPath={movie.poster_path}
                tag="Liked"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};