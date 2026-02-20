import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Minimize2, Play, Pause } from 'lucide-react';
import { useFullscreen } from '../context/FullscreenContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  youtubeId?: string;
  title: string;
  onBack?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  autoplay?: boolean;
  tmdbId?: string;
  mediaType?: string;
  season?: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeId,
  title,
  onBack,
  onFullscreenChange,
  autoplay = true
}) => {
  const navigate = useNavigate();
  const { setIsFullscreen: setGlobalFullscreen } = useFullscreen();

  // State
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [screenW, setScreenW] = useState(0);
  const [screenH, setScreenH] = useState(0);

  // Refs
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load YouTube IFrame API once globally
  useEffect(() => {
    if (window.YT) return; // Already loaded

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!youtubeId || !youtubeContainerRef.current) return;

    const initPlayer = () => {
      if (playerRef.current) return; // Already initialized

      playerRef.current = new window.YT.Player(youtubeContainerRef.current, {
        videoId: youtubeId,
        height: '100%',
        width: '100%',
        playerVars: {
          // Hide all YouTube controls
          controls: 0,
          modestbranding: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          autoplay: autoplay ? 1 : 0,
          mute: 0,
        },
        events: {
          onStateChange: (event: any) => {
            // 1 = playing, 2 = paused, 0 = ended
            setIsPlaying(event.data === 1);
          },
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            if (autoplay) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    // Wait for YouTube API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [youtubeId, autoplay]);

  // Update progress bar
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);
      }
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Show controls on user interaction
  const showPlayerControls = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const handleScreenTap = () => {
    showPlayerControls();
    // Toggle play/pause on center tap
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFullscreen = !isFullscreen;
    if (newFullscreen) {
      setScreenW(window.innerWidth);
      setScreenH(window.innerHeight);
      // Lock to landscape when entering fullscreen
      try {
        (screen.orientation as any).lock('landscape');
      } catch {
        // Screen Orientation API not supported on this browser — silently ignore
      }
    } else {
      // Unlock orientation when exiting fullscreen
      screen.orientation.unlock();
    }
    setIsFullscreen(newFullscreen);
    setGlobalFullscreen(newFullscreen);
    onFullscreenChange?.(newFullscreen);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullscreen) {
      setIsFullscreen(false);
      setGlobalFullscreen(false);
      onFullscreenChange?.(false);
    } else if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  // Update dimensions on resize
  useEffect(() => {
    const onResize = () => {
      if (isFullscreen) {
        setScreenW(window.innerWidth);
        setScreenH(window.innerHeight);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isFullscreen]);

  // Auto-show controls when fullscreen state changes
  useEffect(() => {
    if (isFullscreen) {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    } else {
      setShowControls(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!youtubeId) {
    return (
      <div className="relative w-full bg-black flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}>
        <p className="text-white">No video available</p>
      </div>
    );
  }

  // Fullscreen mode — all controls live INSIDE the rotated div so they align correctly
  if (isFullscreen) {
    // We swap w/h so the rotated box fills the screen edge-to-edge
    const rotW = screenH || window.innerHeight;
    const rotH = screenW || window.innerWidth;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          overflow: 'hidden',
        }}
      >
        {/* Rotated container — everything inside matches the landscape orientation */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: `${rotW}px`,
            height: `${rotH}px`,
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            backgroundColor: '#000',
            flexShrink: 0,
          }}
          onClick={handleScreenTap}
          onMouseMove={showPlayerControls}
          onTouchMove={showPlayerControls}
        >
          {/* YouTube iframe fills the rotated box */}
          <div
            ref={youtubeContainerRef}
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Controls overlay — fades in/out */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s',
              pointerEvents: showControls ? 'none' : 'none',
            }}
          >
            {/* Top gradient */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 90,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
              pointerEvents: 'none',
            }} />

            {/* Top-left: Back button */}
            <button
              onClick={handleBackClick}
              style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'auto' }}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:border-[#00ffa3]/60 transition-all shadow-[0_0_8px_rgba(0,255,163,0.15)] active:scale-95"
              title="Back"
            >
              <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
            </button>

            {/* Top-right: Exit fullscreen (Minimize) */}
            <button
              onClick={handleFullscreenToggle}
              style={{ position: 'absolute', top: 16, right: 16, pointerEvents: 'auto' }}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:border-[#00ffa3]/60 transition-all shadow-[0_0_8px_rgba(0,255,163,0.15)] active:scale-95"
              title="Exit Fullscreen"
            >
              {/* Close-fullscreen SVG: landscape rect with inward arrows */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="7" width="22" height="14" rx="2" stroke="white" strokeWidth="2" />
                {/* Left inward arrow */}
                <polyline points="8,14 5,14" stroke="#00ffa3" strokeWidth="2" strokeLinecap="round" />
                <polyline points="7,12 5,14 7,16" stroke="#00ffa3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Right inward arrow */}
                <polyline points="20,14 23,14" stroke="#00ffa3" strokeWidth="2" strokeLinecap="round" />
                <polyline points="21,12 23,14 21,16" stroke="#00ffa3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Center: Play/Pause */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
              <button
                onClick={handlePlayPause}
                className="w-24 h-24 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 hover:border-[#00ffa3]/60 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying
                  ? <Pause size={52} className="text-white fill-white" />
                  : <Play size={52} className="text-white fill-white ml-1" />}
              </button>
            </div>

            {/* Bottom gradient */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 110,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
              pointerEvents: 'none',
            }} />

            {/* Bottom: Progress bar */}
            <div className="absolute bottom-5 left-5 right-5" style={{ pointerEvents: 'auto' }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00ffa3 0%, #00ffa3 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.25) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.25) 100%)`,
                  filter: 'drop-shadow(0 0 4px rgba(0,255,163,0.4))',
                }}
              />
              <div className="flex justify-between mt-2 text-white/60 text-xs">
                <span>{`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`}</span>
                <span>{`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular (portrait) mode
  return (
    <div
      ref={containerRef}
      className="w-full aspect-video overflow-hidden rounded-xl max-h-[220px] md:max-h-none border-b border-white/10 relative bg-black flex items-center justify-center"
      style={{ boxShadow: '0 8px 30px rgb(0,0,0,0.8)' }}
      onClick={handleScreenTap}
      onMouseMove={showPlayerControls}
      onTouchMove={showPlayerControls}
    >
      {/* YouTube Player Container - Uses IFrame API */}
      <div
        ref={youtubeContainerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ zIndex: 90 }}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Top Control Row */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:border-[#00ffa3]/60 transition-all shadow-[0_0_8px_rgba(0,255,163,0.15)] active:scale-95"
            title="Back"
          >
            <ChevronLeft size={32} className="text-white" strokeWidth={2.5} />
          </button>

          {/* Title */}
          {title && (
            <div className="px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 max-w-xs">
              <span className="text-white text-xs font-medium truncate block">{title}</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreenToggle}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:border-[#00ffa3]/60 transition-all shadow-[0_0_8px_rgba(0,255,163,0.15)] active:scale-95"
            title="Rotate to Fullscreen"
          >
            {/* Rotate-to-landscape icon: phone + circular arrow */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Portrait phone body, slightly tilted */}
              <rect
                x="11" y="5" width="8" height="14"
                rx="1.5"
                stroke="white"
                strokeWidth="1.8"
                transform="rotate(-15 15 12)"
              />
              {/* Home button dot on phone */}
              <circle
                cx="15" cy="17"
                r="0.9"
                fill="white"
                transform="rotate(-15 15 12)"
              />
              {/* Large clockwise arc sweeping from top-left to bottom-right */}
              <path
                d="M6 10 A10 10 0 1 1 20 24"
                stroke="#00ffa3"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Arrowhead at end of arc (pointing down-right) */}
              <polyline
                points="17,26 20,24 22,27"
                stroke="#00ffa3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>

        {/* Center Play/Pause Button - Infinix Styled */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 hover:border-[#00ffa3]/60 transition-all active:scale-95 shadow-[0_0_16px_rgba(0,255,163,0.2)]"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={44} className="text-white fill-white" />
            ) : (
              <Play size={44} className="text-white fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Progress Bar - Infinix Green */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #00ffa3;
              cursor: pointer;
              box-shadow: 0 0 6px rgba(0, 255, 163, 0.5);
            }
            input[type="range"]::-moz-range-thumb {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #00ffa3;
              cursor: pointer;
              border: none;
              box-shadow: 0 0 6px rgba(0, 255, 163, 0.5);
            }
          `}</style>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-0.5 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00ffa3 0%, #00ffa3 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`,
              filter: `drop-shadow(0 0 3px rgba(0, 255, 163, 0.3))`,
            }}
          />
          <div className="flex justify-between mt-1 text-white/50 text-[10px]">
            <span>{`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`}</span>
            <span>{`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
