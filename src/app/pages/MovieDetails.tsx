import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Share2, Download, ChevronLeft, ChevronDown, HelpCircle, Globe, Eye } from 'lucide-react';
import { tmdb } from '../utils/tmdb';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useDownloads } from '../context/DownloadContext';
import { useFullscreen } from '../context/FullscreenContext';
import { toast } from 'sonner';
import { MovieCard } from '../components/MovieCard';
import {
  getYouTubeId,
  getDisplayTitle,
  getTMDBId,
  getMediaType,
  isAvailable,
} from '../data/movie-data';

// ── Embedded YouTube player with tap-to-reveal back button ─────────────────
const YouTubePlayer = ({
  youtubeId,
  onBack,
}: {
  youtubeId: string;
  onBack: () => void;
}) => {
  const [showControls, setShowControls] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScreenTap = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div
      className="relative w-full bg-black overflow-hidden cursor-pointer select-none"
      style={{ aspectRatio: '16 / 9', paddingBottom: '10%' }}
      onClick={handleScreenTap}
    >
      {/* Scaled iframe — hides YouTube chrome */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scale(1.05)', transformOrigin: 'center', pointerEvents: 'none' }}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=0&modestbranding=0&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Back button — invisible by default, fades in on tap, fades out after 3 s */}
      <button
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        className="absolute w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 shadow-xl transition-opacity duration-300"
        style={{
          top: '20px',
          left: '20px',
          zIndex: 9999,
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
};

// ── Main MovieDetails component ─────────────────────────────────────────────
export function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToHistory } = useUser();
  const { addDownload, getDownload } = useDownloads();
  const { setIsFullscreen } = useFullscreen();

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'comments'>('foryou');

  const displayTitle = getDisplayTitle(id || '');
  const tmdbId     = getTMDBId(id || '');
  // Get media type from URL query param first, fallback to local data
  const urlMediaType = searchParams.get('type') as 'movie' | 'tv' | null;
  const localMediaType = getMediaType(id || '');
  const mediaType = (urlMediaType || localMediaType || 'movie') as 'movie' | 'tv';
  const available  = isAvailable(id || '');

  useEffect(() => {
    const fetchData = async () => {
      if (!tmdbId) return;
      try {
        const data =
          mediaType === 'tv'
            ? await tmdb.getTVDetails(tmdbId)
            : await tmdb.getMovieDetails(tmdbId);
        setMovie(data);
        
        // Use unified resolver: check local data first, then TMDB
        const trailerId = await tmdb.resolveYouTubeId(tmdbId, displayTitle || data.title || data.name, mediaType as 'movie' | 'tv');
        setYoutubeId(trailerId);
        
        if (user) addToHistory({ ...data, media_type: mediaType });
        
        // Auto-play if available and trailer found
        if (available && trailerId) {
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [tmdbId, user, addToHistory, mediaType, available, displayTitle]);

  const handleBack = () => navigate(-1);
  const handleFullscreenChange = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleDownload = () => {
    if (!movie || !id) return;
    const existing = getDownload(id);
    if (existing) {
      toast.info(existing.status === 'downloading' ? 'Already downloading' : 'Already downloaded');
      return;
    }
    addDownload({
      id,
      title: displayTitle || movie.title || movie.name,
      backdrop_path: movie.backdrop_path,
      poster_path: movie.poster_path,
    });
    toast.success('Download started');
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Back button visible during load */}
        <button
          onClick={handleBack}
          className="absolute w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl"
          style={{ top: '20px', left: '20px', zIndex: 9999 }}
        >
          <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
        </button>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFCC]" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Content not found
      </div>
    );
  }

  const title  = displayTitle || movie.title || movie.name;
  const year   = (movie.release_date || movie.first_air_date)?.split('-')[0];
  const rating = movie.vote_average?.toFixed(1);
  const genre  = movie.genres?.[0]?.name || 'Action';

  return (
    <div className="min-h-screen bg-black text-white pb-20">

      {/* ── Video / Backdrop ──────────────────────────────────────────────── */}
      <div className="relative w-full bg-black">

        {/* Back button shown over static backdrop (not playing) — always visible */}
        {!isPlaying && (
          <button
            onClick={handleBack}
            className="absolute w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 shadow-xl transition-colors"
            style={{ top: '20px', left: '20px', zIndex: 9999 }}
          >
            <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
          </button>
        )}

        {available && isPlaying && youtubeId ? (
          <YouTubePlayer 
            youtubeId={youtubeId} 
            onBack={handleBack}
            title={title}
            onFullscreenChange={handleFullscreenChange}
          />
        ) : (
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={tmdb.getImageUrl(movie.backdrop_path)}
              className="w-full h-full object-cover"
              alt={title}
            />
            {available ? (
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="black">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            )}
          </div>
        )}
      </div>

      {/* ── Info Section ──────────────────────────────────────────────────── */}
      <div className="px-4" style={{ marginTop: '12px' }}>

        {/* Title row */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold leading-tight flex-1 pr-4">{title}</h1>
          <button className="text-gray-400 text-xs whitespace-nowrap pt-1">Info &gt;</button>
        </div>

        {/* Metadata — strictly 11 px, NO description */}
        <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '11px', color: '#9CA3AF' }}>
          <Globe size={11} className="text-gray-400" />
          <span className="text-yellow-400 font-bold">★ {rating}</span>
          <span>|</span>
          <span>{year}</span>
          <span>|</span>
          <span>United States</span>
          <span>|</span>
          <span>{genre}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto flex-nowrap pb-2 scrollbar-hide">
          <button
            onClick={() => toast.info('Added to list')}
            className="flex items-center gap-1.5 bg-[#1E1E1E] px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
          >
            <Plus size={14} />
            <span>Add to list</span>
          </button>
          <button
            onClick={() => toast.info('Share')}
            className="flex items-center gap-1.5 bg-[#1E1E1E] px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-[#1E1E1E] px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
          <button
            onClick={() => navigate('/downloads')}
            className="flex items-center gap-1.5 bg-[#1E1E1E] px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
          >
            <Eye size={14} />
            <span>View Downloads</span>
          </button>
        </div>

        {/* Resources */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Resources</span>
              <span className="text-[11px] text-gray-500">Uploaded by MovieBase Official</span>
            </div>
            <HelpCircle size={16} className="text-gray-500" />
          </div>
          <button className="flex items-center justify-between bg-[#1E1E1E] px-3 py-2 rounded-lg text-xs w-48">
            <span>Original Audio (English)</span>
            <ChevronDown size={14} className="ml-2" />
          </button>
        </div>

        {/* ── Large outlined green High Speed Server button ─────────────── */}
        <button
          onClick={() => (available ? setIsPlaying(true) : toast.info('Coming soon'))}
          className="w-full py-3.5 rounded-xl mb-6 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-75"
          style={{
            background: 'transparent',
            border: '2px solid #00C896',
            color: '#00FFCC',
            letterSpacing: '0.01em',
          }}
        >
          {title} — High Speed Server
        </button>
      </div>

      {/* ── For You / Comments tabs ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-4 px-4 border-b border-[#1E1E1E]">
          {(['foryou', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-sm font-extrabold pb-2 relative"
              style={{ color: activeTab === tab ? '#00FFCC' : '#6B7280' }}
            >
              {tab === 'foryou' ? 'For you' : 'Comments (34)'}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                  style={{ background: '#00FFCC' }}
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'foryou' && (
          <div className="px-3 py-3 grid grid-cols-3 gap-2">
            {movie.similar?.results?.slice(0, 9).map((m: any) => (
              <MovieCard
                key={m.id}
                id={m.id}
                title={m.title || m.name}
                posterPath={m.poster_path}
                mediaType={m.media_type || mediaType}
                tag="HD"
              />
            ))}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
