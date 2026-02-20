import React, { useState, useEffect } from 'react';
import { Send, MoreVertical, Play, Download as DownloadIcon, Trash2, RotateCcw } from 'lucide-react';
import { tmdb } from '../utils/tmdb';
import { MovieCard } from '../components/MovieCard';
import { useDownloads } from '../context/DownloadContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Downloads = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { downloads, removeDownload } = useDownloads();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecs = async () => {
      const data = await tmdb.getMoviesByCategory('popular');
      setRecommendations(data.results.slice(6, 12));
    };
    
    fetchRecs();
  }, []);

  const handleRemove = (id: string) => {
    removeDownload(id);
    toast.success('Removed from downloads');
  };

  const handlePlay = (id: string) => {
    const download = downloads.find(d => d.id === id);
    if (download?.status === 'completed') {
      navigate(`/movie/${id}`);
    } else {
      toast.info('Download in progress');
    }
  };

  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const downloadingItems = downloads.filter(d => d.status === 'downloading');

  return (
    <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Downloads</h1>
        <button className="bg-gray-800/80 text-[#00FFCC] px-4 py-1.5 rounded-full text-sm font-bold flex items-center space-x-2">
           <div className="bg-[#00FFCC]/20 p-1 rounded">
             <Send size={14} className="transform rotate-[-45deg]" />
           </div>
           <span>Transfer</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Downloaded</h2>
        <span className="text-gray-500 text-xs">{(28.4 - (downloads.length * 0.5)).toFixed(1)}GB available</span>
      </div>

      <div className="flex space-x-3 mb-6 overflow-x-auto no-scrollbar">
        <button className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">MovieBase 2</button>
        <button className="bg-gray-800/60 text-gray-400 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">Local files</button>
        <button className="bg-gray-800/60 text-gray-400 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">Received</button>
      </div>

      {/* Downloading Items */}
      {downloadingItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 mb-3">Downloading</h3>
          <div className="space-y-4">
            {downloadingItems.map((item) => (
              <div key={item.id} className="flex space-x-4 items-center">
                <div className="relative w-32 aspect-video bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={tmdb.getImageUrl(item.backdrop_path)} className="w-full h-full object-cover" alt={item.title} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="w-10 h-10 bg-[#00FFCC]/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <DownloadIcon size={18} className="text-[#00FFCC]" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold truncate pr-2">{item.title}</h3>
                    <button onClick={() => handleRemove(item.id)}>
                      <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-1">{item.size}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-[#00FFCC] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#00FFCC]">{Math.floor(item.progress)}% • Downloading...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Downloads */}
      <div className="space-y-6 mb-10">
        {completedDownloads.length === 0 && downloadingItems.length === 0 ? (
          <div className="text-center py-10">
             <DownloadIcon size={48} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-500 text-sm">No videos downloaded yet.</p>
          </div>
        ) : completedDownloads.length > 0 ? (
          <>
            <h3 className="text-sm font-bold text-gray-400 mb-3">Completed</h3>
            {completedDownloads.map((item) => (
              <div key={item.id} className="flex space-x-4 items-center">
                <div className="relative w-32 aspect-video bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={tmdb.getImageUrl(item.backdrop_path)} className="w-full h-full object-cover" alt={item.title} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                      <Play size={16} fill="white" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold truncate">{item.title}</h3>
                    <button onClick={() => handleRemove(item.id)}>
                      <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">{item.size}</p>
                  <p className="text-[10px] text-[#00FFCC]">Ready to play</p>
                </div>
                <button 
                  onClick={() => handlePlay(item.id)}
                  className="bg-[#00FFCC] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#00FFCC]/90 transition-colors"
                >
                  Play
                </button>
              </div>
            ))}
          </>
        ) : null}
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-bold mb-4">For You</h2>
        <div className="grid grid-cols-3 gap-3">
          {recommendations.map((m) => (
            <MovieCard 
              key={m.id}
              id={m.id}
              title={m.title}
              posterPath={m.poster_path}
              tag="Hindi"
            />
          ))}
        </div>
      </section>

      <button className="w-full bg-gray-900/50 py-3 rounded-lg flex items-center justify-center space-x-2 text-gray-400 text-sm mb-4">
         <RotateCcw size={16} />
         <span>Refresh to sync content</span>
      </button>
    </div>
  );
};
