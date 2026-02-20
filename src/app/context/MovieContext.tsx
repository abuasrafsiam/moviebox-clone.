import React, { createContext, useState, useContext, useEffect } from 'react';
import { tmdb } from '../utils/tmdb';

interface Movie {
  id: number;
  title: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  trailerKey?: string | null;
  youtubeId?: string | null;
  [key: string]: any;
}

interface MovieContextType {
  popularMovies: Movie[];
  loading: boolean;
  error: string | null;
  refetchPopularMovies: () => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await tmdb.getPopularMoviesWithTrailers(1);
      
      if (data.results && Array.isArray(data.results)) {
        setPopularMovies(data.results);
        console.log(`✅ Loaded ${data.results.length} popular movies into context`);
      } else {
        setError('Invalid data format from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching popular movies:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const value: MovieContextType = {
    popularMovies,
    loading,
    error,
    refetchPopularMovies: fetchPopularMovies,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
