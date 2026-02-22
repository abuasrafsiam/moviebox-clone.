import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { startDownload } from '../../services/DownloadManager';
import {
  Plus, Share2, Download, ChevronLeft, ChevronDown,
  HelpCircle, Globe, Eye, Play, Pause, Maximize2, PictureInPicture2,
} from 'lucide-react';
import { tmdb } from '../utils/tmdb';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useDownloads } from '../context/DownloadContext';
import { useFullscreen } from '../context/FullscreenContext';
import { toast } from 'sonner';
import { MovieCard } from '../components/MovieCard';
import { MP4Player } from '../components/MP4Player';
import {
  universalMovieResolver,
  getDisplayTitle,
  getTMDBId,
  getMediaType,
  isAvailable,
  lockToLandscape,
  unlockOrientation,
  generateSafeFilename,
  getUsingFallback,
  setUsingFallback,
  multiSourceResolver,
  switchServer,
  getCurrentSourceIndex,
  setCurrentSourceIndex,
  openDownloadInBrowser,
  logMovieDataValidation,
} from '../services/UniversalMovieEngine';

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * ENTERPRISE MULTI-SOURCE ENGINE RESOLVER
 * 100% Dynamic - constructs URL using multi-source matrix with tmdb_id injection
 * Includes Inception test bypass for isolated testing
 */
const resolvePlayUrl = (movieId: string): string => {
  // ── INCEPTION TEST: Bypass all existing links for Inception ─────────────────────
  const movieTitle = getDisplayTitle(movieId);
  if (movieTitle?.toLowerCase().trim() === 'inception') {
    console.log('[Play] INCEPTION TEST: Using direct video URL');
    return 'https://cool.upera.in/1400-2/11-1/stranger-things/s3/Stranger.Things.S03E01.1080p.WEB-DL.SoftSub.RasaMovie.Com.mkv';
  }

  // ── ENTERPRISE MULTI-SOURCE RESOLVER: Use dynamic TMDB ID for every movie ───────────────────
  const embedUrl = multiSourceResolver(movieId);
  return embedUrl;
};

// ── Main MovieDetails ────────────────────────────────────────────────────────
export function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToHistory } = useUser();
  const { addDownload, updateProgress, markFailed, getDownload } = useDownloads();
  const { setIsFullscreen } = useFullscreen();

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'comments'>('foryou');
  // Local download state — tracks this movie's live progress for the button label
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  // Multi-source state for server switching
  const [currentServerIndex, setCurrentServerIndex] = useState(getCurrentSourceIndex());

  const displayTitle = getDisplayTitle(id || '');
  const tmdbId = getTMDBId(id || '');
  const urlMediaType = searchParams.get('type') as 'movie' | 'tv' | null;
  const localMediaType = getMediaType(id || '');
  const mediaType = (urlMediaType || localMediaType || 'movie') as 'movie' | 'tv';
  const available = isAvailable(id || '');

  useEffect(() => {
    // Run one-time data validation log
    logMovieDataValidation();
    
    const fetchData = async () => {
      if (!tmdbId) return;
      try {
        const data =
          mediaType === 'tv'
            ? await tmdb.getTVDetails(tmdbId)
            : await tmdb.getMovieDetails(tmdbId);
        setMovie(data);

        // ── ENTERPRISE MULTI-SOURCE RESOLVER: Use dynamic TMDB ID for every movie ─────────────────
        const movieTitle = displayTitle || data.title || data.name || 'movie';
        console.log('[MovieDetails] Movie loaded:', { id, movieTitle });
        
        const iframeUrl = resolvePlayUrl(id || '');
        setPlayUrl(iframeUrl);

        if (user) addToHistory({ ...data, media_type: mediaType });
        if (available && iframeUrl) setIsPlaying(true);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [tmdbId, user, addToHistory, mediaType, available, displayTitle]);

  // Always restore BottomNav + body scroll and unlock orientation when leaving this page
  useEffect(() => {
    return () => {
      setIsFullscreen(false);
      document.body.style.overflow = 'auto';
      unlockOrientation().catch(console.warn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = async () => {
    // Unlock orientation when going back from player
    await unlockOrientation();
    navigate(-1);
  };
  
  const handleFullscreenChange = async (fs: boolean) => {
    setIsFullscreen(fs);
    document.body.style.overflow = fs ? 'hidden' : 'auto';
    
    // Handle orientation based on fullscreen state
    if (fs) {
      await lockToLandscape();
    } else {
      await unlockOrientation();
    }
  };
  
  // Handle player errors for automatic fallback
  const handlePlayerError = () => {
    console.log('[MovieDetails] Player error detected, triggering fallback');
    // The MP4Player component will handle the actual fallback logic
  };

  // Server Switch Handler - Cycles through available streaming sources
  const handleServerSwitch = () => {
    switchServer();
    const newIndex = getCurrentSourceIndex();
    setCurrentServerIndex(newIndex);
    
    // Update play URL with new source
    if (id) {
      const newUrl = resolvePlayUrl(id);
      setPlayUrl(newUrl);
      
      // If currently playing, restart with new source
      if (isPlaying) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 100);
      }
    }
    
    toast.info(`Switched to Server ${newIndex + 1}/4`, {
      description: 'Trying next streaming source...',
    });
  };

  // Universal Play handler - locks orientation and starts playback
  const handlePlayClick = async () => {
    console.log('[Play Click] Movie ID:', id);
    console.log('[Play Click] Movie Title:', displayTitle);
    console.log('[Play Click] URL to stream:', playUrl);
    
    // Lock to landscape when player opens
    await lockToLandscape();
    setIsPlaying(true);
  };
  
  const handleDownload = async () => {
    if (!movie || !id) return;

    const movieTitle = displayTitle || movie.title || movie.name || 'movie';
    
    try {
      // ── ENTERPRISE DOWNLOAD RESOLVER: Use Capacitor Browser for native download ─────────────
      await openDownloadInBrowser(id);
      
      toast.success('📱 Download opened in browser', {
        description: 'Use the native Android download button in the browser to save the video.',
        duration: 5000,
      });
    } catch (err: any) {
      console.error('[Download] FAILED:', {
        movieTitle,
        errorMessage: err?.message,
        errorDetail: err,
      });

      // Show specific error messages based on the error type
      let errorMessage = 'Download failed. Please try again.';
      let errorDescription = '';

      if (err?.message?.includes('No download URL available')) {
        errorMessage = '⛔ No streaming source available';
        errorDescription = 'Try switching to a different server and try again.';
      } else if (err?.message?.includes('Browser')) {
        errorMessage = '� Browser error';
        errorDescription = 'Unable to open browser. Check your device settings.';
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  const title = displayTitle || movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0];
  const rating = movie.vote_average?.toFixed(1);
  const genre = movie.genres?.[0]?.name || 'Action';
  const country =
    movie.production_countries?.[0]?.name ||
    movie.origin_country?.[0] ||
    'United States';

  // Check if movie has missing data for 'Content Coming Soon' overlay
  const hasMissingData = !title || title === 'Unknown' || title === 'MISSING';
  const hasValidPlayUrl = playUrl && playUrl !== '';

  // ── Shared pill button style ─────────────────────────────────────────────
  const pillBtn: React.CSSProperties = {
    border: '1px solid #4B5563',
    color: '#D1D5DB',
    background: 'transparent',
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">

      {/* ── Video / Backdrop ─────────────────────────────────────────── */}
      <div className="relative w-full bg-black">
        {!isPlaying && (
          <button
            onClick={handleBack}
            className="absolute w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 shadow-xl transition-colors"
            style={{ top: '20px', left: '20px', zIndex: 9999 }}
          >
            <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
          </button>
        )}

        {available && isPlaying && playUrl && !hasMissingData ? (
          <MP4Player
            source={playUrl}
            onBack={handleBack}
            title={title}
            onFullscreenChange={handleFullscreenChange}
            onError={handlePlayerError}
            onServerSwitch={handleServerSwitch}
            currentServerIndex={currentServerIndex}
          />
        ) : (
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={tmdb.getImageUrl(movie.backdrop_path)}
              className="w-full h-full object-cover"
              alt={title}
            />
            {hasMissingData ? (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play size={28} className="text-white/60" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Content Coming Soon</h3>
                  <p className="text-gray-400 text-sm">This content is not yet available for streaming</p>
                </div>
              </div>
            ) : available ? (
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                onClick={handlePlayClick}
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

      {/* ── Info Section ─────────────────────────────────────────────── */}
      <div className="px-4" style={{ marginTop: '12px' }}>

        {/* Title row */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold leading-tight flex-1 pr-4">{title}</h1>
          <button className="text-gray-400 text-xs whitespace-nowrap pt-1">Info &gt;</button>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '11px', color: '#9CA3AF' }}>
          <Globe size={11} className="text-gray-400" />
          <span className="text-[#4B5563]">|</span>
          <span className="text-yellow-400 font-bold">★ {rating}</span>
          <span className="text-[#4B5563]">|</span>
          <span>{year}</span>
          <span className="text-[#4B5563]">|</span>
          <span>{country}</span>
          <span className="text-[#4B5563]">|</span>
          <span>{genre}</span>
        </div>

        {/* Action buttons — outlined pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto flex-nowrap pb-2 scrollbar-hide">
          <button
            onClick={() => toast.info('Added to list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={pillBtn}
          >
            <Plus size={14} /><span>Add to list</span>
          </button>
          <button
            onClick={() => toast.info('Share')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={pillBtn}
          >
            <Share2 size={14} /><span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-opacity"
            style={pillBtn}
          >
            <Download size={14} />
            <span>Download</span>
          </button>
          <button
            onClick={handleServerSwitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-opacity"
            style={{
              ...pillBtn,
              background: 'rgba(0, 255, 204, 0.1)',
              borderColor: '#00FFCC',
              color: '#00FFCC',
            }}
          >
            <Globe size={14} />
            <span>Server {currentServerIndex + 1}/4</span>
          </button>
          <button
            onClick={() => navigate('/downloads')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={pillBtn}
          >
            <Eye size={14} /><span>View</span>
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

        {/* High Speed Server button */}
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

      {/* ── For You / Comments tabs ───────────────────────────────────── */}
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
