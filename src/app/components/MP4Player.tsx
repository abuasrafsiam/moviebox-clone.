import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Play, Pause, Maximize2, Volume2, VolumeX, AlertCircle, Globe } from 'lucide-react';
import { setUsingFallback, getUsingFallback, switchServer, getCurrentSourceIndex, lockToLandscape, unlockOrientation } from '../services/UniversalMovieEngine';

interface MP4PlayerProps {
  source: string;
  title: string;
  onBack?: () => void;
  autoplay?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onError?: () => void;
  onServerSwitch?: () => void;
  currentServerIndex?: number;
}

export const MP4Player: React.FC<MP4PlayerProps> = ({
  source,
  title,
  onBack,
  autoplay = true,
  onFullscreenChange,
  onError,
  onServerSwitch,
  currentServerIndex = 0,
}) => {
  // Detect if source is an iframe URL (contains 'embed') or the Inception test URL
  const isIframe = source?.includes('embed');
  const isInceptionTest = source?.includes('cool.upera.in') && source?.includes('.mkv');
  const shouldUseVideoTag = !isIframe || isInceptionTest;
  
  // Error state for fallback
  const [hasError, setHasError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(!shouldUseVideoTag); // Don't show loading for iframe
  
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide controls
  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const revealControls = () => {
    setShowControls(true);
    resetControlsTimer();
  };

  // Native Capacitor Screen Orientation Integration
  useEffect(() => {
    // Lock to landscape when player mounts
    lockToLandscape().catch(console.warn);

    // Cleanup: unlock orientation when player unmounts
    return () => {
      unlockOrientation().catch(console.warn);
    };
  }, []);

  // Play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Mute toggle
  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Fullscreen
  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
        onFullscreenChange?.(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Handle iframe error with automatic fallback
  const handleIframeError = () => {
    console.error('[MP4Player] IFrame loading error detected');
    
    if (!getUsingFallback() && isIframe && !isInceptionTest) {
      console.log('[MP4Player] Switching to fallback resolver');
      setUsingFallback(true);
      setHasError(true);
      
      // Extract movie ID and construct fallback URL
      const urlParts = source.split('/');
      const movieId = urlParts[urlParts.length - 1];
      const fallbackUrl = `https://embed.su/embed/movie/${movieId}`;
      
      if (onError) {
        onError();
      }
      
      // Reload iframe with fallback URL
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = fallbackUrl;
        }
      }, 1000);
    }
  };
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Video event handlers (only for MP4, not iframe)
  useEffect(() => {
    if (!shouldUseVideoTag) return; // Skip for iframe
    
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (autoplay) {
        video.play().catch(() => setIsPlaying(false));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoplay, shouldUseVideoTag]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden rounded-lg"
      style={{ aspectRatio: '16 / 9' }}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
    >
      {/* Iframe or Video Element */}
      {shouldUseVideoTag ? (
        <video
          ref={videoRef}
          src={source}
          className="w-full h-full"
          playsInline
        />
      ) : (
        <iframe
          ref={iframeRef}
          src={hasError && isIframe && !isInceptionTest ? `https://embed.su/embed/movie/${source.split('/').pop()}` : source}
          title={title}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onError={handleIframeError}
        />
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFCC]" />
        </div>
      )}

      {/* Error Indicator */}
      {hasError && isIframe && !isInceptionTest && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 z-10">
          <AlertCircle size={16} />
          <span>Using Fallback Server</span>
        </div>
      )}

      {/* Server Switch Button (only for iframe) - Premium Glassmorphism */}
      {!shouldUseVideoTag && onServerSwitch && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onServerSwitch();
          }}
          className="absolute top-4 right-4 w-12 h-12 backdrop-blur-xl bg-white/15 border border-white/25 rounded-full flex items-center justify-center hover:bg-white/25 hover:border-white/40 transition-all duration-300 shadow-2xl z-10 group"
          title="Switch Server"
        >
          <Globe size={18} className="text-white group-hover:text-[#00FFCC] transition-colors" />
        </button>
      )}

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* Controls Container (only for video, not iframe) */}
      {shouldUseVideoTag && (
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={revealControls}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Controls */}
        <div className="relative px-3 pb-3 flex items-center gap-2.5">
          {/* Play/Pause */}
          <button onClick={handlePlayPause} className="text-white flex-shrink-0">
            {isPlaying ? (
              <Pause size={20} fill="white" />
            ) : (
              <Play size={20} fill="white" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer accent-[#00FFCC]"
            />
            <span className="text-white text-xs font-mono flex-shrink-0 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Mute */}
          <button onClick={handleMute} className="text-white flex-shrink-0">
            {isMuted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          {/* Fullscreen */}
          <button onClick={handleFullscreen} className="text-white flex-shrink-0">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
