import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import {
  getDisplayTitle,
  getTMDBId,
  getMediaType,
  isAvailable,
} from '../data/movie-data';

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

// ── YouTubePlayer (IFrame API + custom controls) ─────────────────────────────
const YouTubePlayer = ({
  youtubeId,
  onBack,
  title,
  onFullscreenChange,
}: {
  youtubeId: string;
  onBack: () => void;
  title?: string;
  onFullscreenChange?: (fs: boolean) => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-hide controls after 3.5 s
  const resetHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500);
  };
  const revealControls = () => {
    setShowControls(true);
    resetHideTimer();
  };

  useEffect(() => {
    const initPlayer = () => {
      if (!playerDivRef.current) return;
      playerRef.current = new (window as any).YT.Player(playerDivRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1,
          rel: 0, showinfo: 0, iv_load_policy: 3,
          disablekb: 1, fs: 0, playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              if (!progressTimerRef.current) {
                progressTimerRef.current = setInterval(() => {
                  if (playerRef.current?.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                    setDuration(playerRef.current.getDuration());
                  }
                }, 500);
              }
            } else {
              setPlaying(false);
              if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
              }
            }
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    // Show controls on mount then auto-hide
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    revealControls();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTo = ratio * duration;
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
    revealControls();
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      onFullscreenChange?.(true);
    } else {
      document.exitFullscreen?.();
      onFullscreenChange?.(false);
    }
    revealControls();
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden select-none"
      style={{ aspectRatio: '16 / 9' }}
      onClick={revealControls}
    >
      {/* YouTube IFrame API placeholder */}
      <div
        ref={playerDivRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Controls overlay — fade in/out */}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 28%, transparent 62%, rgba(0,0,0,.75) 100%)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* ── Top row: Back  ·  Help ── */}
        <div className="flex items-start justify-between px-4 pt-4">
          <button
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ChevronLeft size={30} className="text-white" strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-8 border-2 border-white/80 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold leading-none">?</span>
            </div>
            <span className="text-white/80 text-[9px] tracking-wide">Help</span>
          </div>
        </div>

        {/* ── Bottom control bar ── */}
        <div className="px-3 pb-3 flex items-center gap-2.5">
          {/* Play / Pause */}
          <button onClick={togglePlay} className="flex-shrink-0 text-white">
            {playing
              ? <Pause size={20} fill="white" />
              : <Play size={20} fill="white" />}
          </button>

          {/* Progress track + timestamps */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div
              className="flex-1 h-[3px] bg-white/30 rounded-full relative cursor-pointer"
              onClick={handleSeek}
            >
              {/* Filled */}
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Scrubber dot */}
              <div
                className="absolute w-3 h-3 bg-white rounded-full shadow"
                style={{
                  left: `calc(${progress}% - 6px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
            <span className="text-white text-[10px] whitespace-nowrap flex-shrink-0 font-mono">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>
          </div>

          {/* PiP */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-white"
          >
            <PictureInPicture2 size={18} />
          </button>

          {/* Fullscreen */}
          <button onClick={handleFullscreen} className="flex-shrink-0 text-white">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main MovieDetails ────────────────────────────────────────────────────────
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
  const tmdbId = getTMDBId(id || '');
  const urlMediaType = searchParams.get('type') as 'movie' | 'tv' | null;
  const localMediaType = getMediaType(id || '');
  const mediaType = (urlMediaType || localMediaType || 'movie') as 'movie' | 'tv';
  const available = isAvailable(id || '');

  useEffect(() => {
    const fetchData = async () => {
      if (!tmdbId) return;
      try {
        const data =
          mediaType === 'tv'
            ? await tmdb.getTVDetails(tmdbId)
            : await tmdb.getMovieDetails(tmdbId);
        setMovie(data);

        const trailerId = await tmdb.resolveYouTubeId(
          tmdbId,
          displayTitle || data.title || data.name,
          mediaType as 'movie' | 'tv',
        );
        setYoutubeId(trailerId);

        if (user) addToHistory({ ...data, media_type: mediaType });
        if (available && trailerId) setIsPlaying(true);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [tmdbId, user, addToHistory, mediaType, available, displayTitle]);

  // Always restore BottomNav + body scroll when leaving this page
  useEffect(() => {
    return () => {
      setIsFullscreen(false);
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => navigate(-1);
  const handleFullscreenChange = (fs: boolean) => {
    setIsFullscreen(fs);
    document.body.style.overflow = fs ? 'hidden' : 'auto';
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={pillBtn}
          >
            <Download size={14} /><span>Download</span>
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
