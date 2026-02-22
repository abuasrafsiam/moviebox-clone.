import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Search as SearchIcon, Mic, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdb } from '../utils/tmdb';
import { useUser } from '../context/UserContext';
import { MovieCard } from '../components/MovieCard';
import { searchLibrary, getTMDBId } from '../services/UniversalMovieEngine';

export const Search = () => {
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useUser();

  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<any[]>([]);
  const [popular, setPopular]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ── "Everyone is searching" default grid ─────────────────────────────────
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await tmdb.getMoviesByCategory('popular');
        const englishHighRated = (data.results || []).filter(
          (m: any) => m.original_language === 'en' && m.vote_average >= 7.0
        );
        setPopular(englishHighRated.slice(0, 12));
      } catch (err) {
        console.error('Popular fetch error:', err);
      }
    };
    fetchPopular();
  }, []);

  // ── Core search function ──────────────────────────────────────────────────
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setLoading(true);
      setIsSearching(true);

      try {
        // 1. Search our curated local catalog first
        const localHits = searchLibrary(searchQuery);

        if (localHits.length > 0) {
          // Fetch TMDB detail for each local hit to get poster/backdrop
          const detailed = await Promise.all(
            localHits.map(async (entry: any) => {
              const tmdbId = getTMDBId(entry.id);
              try {
                const detail =
                  entry.type === 'tv'
                    ? await tmdb.getTVDetails(tmdbId)
                    : await tmdb.getMovieDetails(tmdbId);
                return {
                  // Use our catalog ID so navigation goes to the right place
                  id: entry.id,
                  title: entry.title,
                  name: entry.title,
                  poster_path: entry.posterPath || detail.poster_path,
                  backdrop_path: detail.backdrop_path,
                  vote_average: detail.vote_average,
                  media_type: entry.type,
                  overview: detail.overview,
                };
              } catch {
                return {
                  id: entry.id,
                  title: entry.title,
                  name: entry.title,
                  poster_path: entry.posterPath || null,
                  media_type: entry.type,
                  vote_average: 0,
                };
              }
            })
          );
          setResults(detailed);
          addRecentSearch(searchQuery);
        } else {
          // 2. Fall back to TMDB multi-search (English / high-rated only)
          const data = await tmdb.search(searchQuery);
          const filtered = (data.results || []).filter(
            (item: any) =>
              item.original_language === 'en' && item.vote_average >= 6.0
          );
          setResults(filtered);
          if (filtered.length > 0) addRecentSearch(searchQuery);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [addRecentSearch]
  );

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleRecentClick = (tag: string) => {
    setQuery(tag);
    performSearch(tag);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white pb-20">

      {/* Search header */}
      <div className="px-4 py-4 flex items-center space-x-3 bg-black sticky top-0 z-50">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-gray-900 rounded-lg flex items-center px-3 py-2 space-x-2 border border-white/5"
        >
          <SearchIcon size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search movies, TV shows…"
            className="bg-transparent border-none outline-none text-sm text-white flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader2 size={16} className="animate-spin text-[#00FFCC]" />}
          {!loading && query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-500 text-xs">
              Clear
            </button>
          )}
        </form>
        <Mic size={24} className="text-gray-400" />
      </div>

      <div className="px-4 py-2 space-y-6">

        {/* Recent searches */}
        {!isSearching && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Recent Searches</h2>
              <button
                onClick={clearRecentSearches}
                className="text-gray-400 text-xs flex items-center space-x-1 hover:text-white"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRecentClick(tag)}
                  className="bg-gray-800/60 hover:bg-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-300 transition-colors border border-white/5"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results / popular grid */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center">
            {isSearching ? (
              <span>Search Results {results.length > 0 && `(${results.length})`}</span>
            ) : (
              <>
                <span className="mr-2 text-orange-500">🔥</span>
                <span>Everyone is searching</span>
              </>
            )}
          </h2>

          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 size={40} className="animate-spin text-[#00FFCC] mb-4" />
              <p>Searching for "{query}"…</p>
            </div>
          ) : isSearching && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <SearchIcon size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No movies found</h3>
              <p className="text-gray-400 text-sm">
                We couldn't find any results for "{query}". Try something else.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(isSearching ? results : popular).map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title || movie.name}
                  posterPath={movie.poster_path}
                  rating={movie.vote_average}
                  mediaType={movie.media_type || (movie.title ? 'movie' : 'tv')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};