import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { MovieCard } from '../components/MovieCard';

export const WatchHistory = () => {
  const navigate = useNavigate();
  const { history, loading } = useUser();

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
        <h1 className="text-xl font-bold">Watch History</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🎬</span>
            </div>
            <p className="text-gray-400 text-lg">No history yet</p>
            <p className="text-gray-500 text-sm mt-2">Start watching!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {history.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title || movie.name}
                posterPath={movie.poster_path}
                tag="Watched"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};