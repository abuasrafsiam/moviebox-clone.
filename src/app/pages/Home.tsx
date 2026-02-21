import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, Zap, Play, ChevronRight } from 'lucide-react';
import { tmdb } from '../utils/tmdb';
import { MovieCard } from '../components/MovieCard';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { FEATURED_HOME_IDS } from '../data/movie-data';
import strangerThingsBanner from '../../assets/images/Picsart_26-02-19_21-17-57-614.png';

export const Home = () => {
  const { unreadCount } = useUser();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Banner state — ONLY Stranger Things (static)
  const [strangerThings, setStrangerThings] = useState<any>(null);
  const [bannerReady, setBannerReady] = useState(false);

  // Grid state
  const [curatedMovies, setCuratedMovies] = useState<any[]>([]);
  const [categoryMovies, setCategoryMovies] = useState<any[]>([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const categories = [
    { id: 'all',       label: 'All',       icon: Menu },
    { id: 'hollywood', label: 'Hollywood', icon: null },
    { id: 'action',    label: 'Action',    icon: null },
    { id: 'comedy',    label: 'Comedy',    icon: null },
    { id: 'drama',     label: 'Drama',     icon: null },
    { id: 'thriller',  label: 'Thriller',  icon: null },
  ];

  // ── Phase 1: Load Stranger Things banner data ────────────────────────────
  useEffect(() => {
    const loadBanner = async () => {
      try {
        const stData = await tmdb.getTVDetails('66732');
        
        // Load Stranger Things data
        if (stData?.name === 'Stranger Things' && stData?.backdrop_path) {
          setStrangerThings(stData);
        }
      } catch (err) {
        console.error('Banner fetch error:', err);
      } finally {
        setBannerReady(true);
      }
    };
    loadBanner();
  }, []);

  // ── Phase 2: Load curated grid in background ──────────────────────────────
  useEffect(() => {
    const loadGrid = async () => {
      try {
        const featured = FEATURED_HOME_IDS.slice(0, 9);
        const fetched = await Promise.all(
          featured.map(({ id, type }: { id: string; type: string }) =>
            type === 'tv'
              ? tmdb.getTVDetails(id).then((d: any) => ({ ...d, media_type: 'tv', catalogId: id }))
              : tmdb.getMovieDetails(id).then((d: any) => ({ ...d, media_type: 'movie', catalogId: id }))
          )
        );
        setCuratedMovies(fetched);
        setCategoryMovies(fetched);
      } catch (err) {
        console.error('Grid fetch error:', err);
      } finally {
        setGridLoading(false);
      }
    };
    loadGrid();
  }, []);



  // ── Category change ───────────────────────────────────────────────────────
  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setCategoryMovies(curatedMovies);
      return;
    }
    setCategoryLoading(true);
    try {
      const data = await tmdb.getMoviesByCategory(categoryId);
      const filtered = (data.results || []).filter(
        (m: any) => m.original_language === 'en' && m.vote_average >= 6.5
      );
      setCategoryMovies(filtered.slice(0, 9));
    } catch (err) {
      console.error('Category fetch error:', err);
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="px-4 pt-4 pb-2 flex items-center space-x-3 sticky top-0 bg-black z-40 backdrop-blur-sm">
        <div className="w-8 h-8 flex items-center justify-center">
          <Zap className="text-[#00FFCC] fill-[#00FFCC]" />
        </div>
        <Link
          to="/search"
          className="flex-1 bg-gray-900/80 rounded-lg flex items-center px-3 py-2 space-x-2 border border-white/5"
        >
          <Search size={18} className="text-gray-400" />
          <span className="text-gray-400 text-sm flex-1">Search movies…</span>
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-1 hover:bg-white/5 rounded-full transition-colors"
          >
            <Bell size={22} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-black">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <Link to="/search" className="text-[#00FFCC] font-semibold">Search</Link>
        </div>
      </header>

      {/* ── Trending tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-6 px-4 py-2 overflow-x-auto no-scrollbar whitespace-nowrap text-sm">
        <span className="text-white font-bold text-lg">Trending</span>
        <span className="bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)] px-3 py-0.5 rounded-full text-xs font-bold">
          Infinix
        </span>
        <span className="text-gray-400">Movie</span>
        <span className="text-gray-400">TV</span>
        <span className="text-gray-400">Anime</span>
      </div>

      {/* ── Banner — ONLY Stranger Things (Static & Clean) ───────────────────── */}
      <div className="relative w-full h-[300px] overflow-hidden bg-gray-950">
        {/* Stranger Things — Local Asset */}
        <img
          src={strangerThingsBanner}
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          alt="Stranger Things"
        />

        {/* Skeleton shimmer while banner loads */}
        {!bannerReady && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        )}

        {/* Banner info card — Bottom-Left Corner (Sharp & Clear) */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-lg rounded-2xl px-3 py-2.5 border border-white/20 shadow-2xl hover:bg-black/60 transition-colors">
            {strangerThings ? (
              <>
                <img
                  src={tmdb.getImageUrl(strangerThings.poster_path)}
                  className="w-12 h-16 rounded-lg object-cover shadow-xl flex-shrink-0"
                  alt="Stranger Things"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm truncate text-white">{strangerThings.name || 'Stranger Things'}</h2>
                  <p className="text-[10px] text-gray-300 flex items-center space-x-2 mt-0.5">
                    <span>TV</span><span>|</span><span>Sci-Fi</span><span>|</span>
                    <span className="text-yellow-400">★ {strangerThings.vote_average?.toFixed(1) || '8.7'}</span>
                  </p>
                </div>
                <Link
                  to="/movie/st-season-3?type=tv"
                  className="bg-[#00FFCC] rounded-full p-2.5 text-black hover:bg-[#00FFCC]/90 transition-all shadow-lg active:scale-95 flex-shrink-0"
                >
                  <Play size={18} fill="black" />
                </Link>
              </>
            ) : (
              <div className="w-64 h-12 bg-white/5 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="px-4 py-2 pt-3">
        <h2 className="text-base font-bold mb-2.5">Categories</h2>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`relative flex-shrink-0 h-9 px-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                  active
                    ? 'bg-transparent border-2 border-[#00FFCC]'
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                }`}
              >
                <span
                  className={`flex items-center space-x-1.5 ${active ? 'text-[#00FFCC]' : 'text-white'}`}
                  style={active ? { filter: 'drop-shadow(0 0 4px rgba(0,255,204,0.5))' } : {}}
                >
                  {Icon && <Icon size={14} />}
                  <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Curated Movie Grid ────────────────────────────────────────────── */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center">
            <span className="mr-1">🔥</span>{' '}
            {selectedCategory === 'all'
              ? 'Trending Now'
              : `${categories.find((c) => c.id === selectedCategory)?.label} Movies`}
          </h2>
          <Link to="/search" className="text-gray-400 text-sm flex items-center">
            All <ChevronRight size={16} />
          </Link>
        </div>

        {(categoryLoading || (selectedCategory === 'all' && gridLoading)) ? (
          /* Skeleton grid */
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categoryMovies.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {categoryMovies.slice(0, 9).map((movie) => {
              const navId = movie.catalogId ?? String(movie.id);
              return (
                <MovieCard
                  key={navId}
                  id={navId}
                  title={movie.title || movie.name || ''}
                  posterPath={movie.poster_path}
                  mediaType={movie.media_type || 'movie'}
                  tag="HD"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">No movies found</div>
        )}
      </section>

      {/* ── Live Sports ───────────────────────────────────────────────────── */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Live</h2>
          <span className="text-gray-400 text-sm flex items-center">
            All <ChevronRight size={16} />
          </span>
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar">
          {[
            {
              home: 'Man United',
              homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
              away: 'Tottenham',
              awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
            },
            {
              home: 'Arsenal',
              homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
              away: 'Sunderland',
              awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Sunderland_AFC_Logo.svg/1200px-Sunderland_AFC_Logo.svg.png',
            },
          ].map((match, i) => (
            <div key={i} className="min-w-[280px] bg-gray-900/50 rounded-xl p-4 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 bg-[var(--primary)] text-black text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                Upcoming · 2 days left
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 mb-2">
                    <img src={match.homeLogo} className="w-full object-contain" alt={match.home} />
                  </div>
                  <span className="text-[10px] text-center w-20 truncate">{match.home}</span>
                </div>
                <div className="text-2xl font-bold italic text-gray-500">VS</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 mb-2">
                    <img src={match.awayLogo} className="w-full object-contain" alt={match.away} />
                  </div>
                  <span className="text-[10px] text-center w-20 truncate">{match.away}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
