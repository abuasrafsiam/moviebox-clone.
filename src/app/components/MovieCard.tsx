import React from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../utils/tmdb';
import { isAvailable } from '../data/movie-data';
import { CheckCircle2 } from 'lucide-react';

interface MovieCardProps {
  id: number | string;
  title: string;
  posterPath: string | null;
  tag?: string;
  rating?: number;
  mediaType?: 'movie' | 'tv';
  showAvailability?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  posterPath, 
  tag, 
  rating, 
  mediaType = 'movie',
  showAvailability = false 
}) => {
  const available = showAvailability ? isAvailable(id) : false;
  
  return (
    <Link to={`/movie/${id}?type=${mediaType}`} className="flex flex-col space-y-2 group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 shadow-lg">
        <img
          src={tmdb.getImageUrl(posterPath)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(tag || rating) && (
          <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10 flex items-center space-x-1 font-bold">
            {rating ? (
              <>
                <span className="text-yellow-400">★</span>
                <span>{rating.toFixed(1)}</span>
              </>
            ) : (
              tag
            )}
          </div>
        )}
        {showAvailability && available && (
          <div className="absolute top-1 left-1 bg-[#00FFCC]/90 text-black text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center space-x-1 font-bold">
            <CheckCircle2 size={10} />
            <span>Available</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-200 text-xs font-semibold line-clamp-1 px-1">
        {title}
      </h3>
    </Link>
  );
};