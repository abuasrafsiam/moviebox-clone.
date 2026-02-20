import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

// Stub helpers (legacy Drive-based system — no longer active)
const getEpisodeVideoSource = (_tmdbId: string, _season: number, _episode: number): { url: string } | null => null;
const getMovieDriveId = (_tmdbId: string): string | null => null;
const getDriveUrl = (driveId: string): string => `https://drive.google.com/uc?export=stream&id=${driveId}`;

interface StreamPlayerProps {
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  onBack: () => void;
  driveId?: string;
  season?: number;
  episode?: number;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ tmdbId, mediaType, title, onBack, driveId, season, episode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [showHoverTime, setShowHoverTime] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    let videoSource: string | null = null;
    
    // Determine video source
    if (mediaType === 'tv' && season && episode) {
      // Get TV episode video source from Drive
      const source = getEpisodeVideoSource(tmdbId, season, episode);
      if (source) {
        videoSource = source.url;
        console.log('✅ TV Episode source (Drive):', source.url);
      } else {
        console.error('❌ No video source found for TV show:', tmdbId, 'S' + season, 'E' + episode);
      }
    } else if (mediaType === 'movie') {
      // Get movie video source from Drive
      const movieDriveId = getMovieDriveId(tmdbId);
      if (movieDriveId) {
        videoSource = getDriveUrl(movieDriveId);
        console.log('✅ Movie source (Drive):', videoSource);
      } else {
        console.error('❌ No video source found for movie:', tmdbId);
      }
    } else if (driveId) {
      // Fallback: Use provided driveId
      videoSource = getDriveUrl(driveId);
      console.log('✅ Fallback source (Drive ID provided):', videoSource);
    }
    
    if (!videoSource) {
      console.error('❌ No video source available');
      setIsLoading(true); // Keep showing loading state
      return;
    }
    
    // Set video source (NO crossOrigin - causes CORS issues with Drive)
    video.src = videoSource;
    
    console.log('🎬 Loading video from Google Drive:', videoSource);
    
    // Auto-play when loaded
    const handleLoadedMetadata = () => {
      console.log('✅ Video loaded successfully! Duration:', video.duration);
      setIsLoading(false);
      setDuration(video.duration || 0);
      video.play().catch(err => {
        console.error('❌ Auto-play failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    };

    const handleError = (e: Event) => {
      console.error('❌ Video load error:', video.error?.code, video.error?.message);
      console.error('   Source:', videoSource);
      console.error('   Tip: Check if Drive file is publicly accessible');
      // Keep showing loading spinner instead of error UI
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play - ready to stream');
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [driveId, mediaType, tmdbId, season, episode]);

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && !isLoading) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isLoading]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to seek to a position
  const seekToPosition = (clientX: number) => {
    if (!videoRef.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(pos * 100);
    setShowControls(true);
  };

  // Mouse/Touch move handler for hover preview
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverProgress(pos * 100);
    setShowHoverTime(true);
  };

  // Drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDraggingSeek(true);
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    seekToPosition(clientX);
  };

  // Drag move
  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingSeek) return;
      
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      seekToPosition(clientX);
    };

    const handleDragEnd = () => {
      setIsDraggingSeek(false);
    };

    if (isDraggingSeek) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDraggingSeek, duration]);

  const handleContainerClick = () => {
    setShowControls(true);
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
    setShowControls(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    seekToPosition(e.clientX);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    setShowControls(true);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden cursor-pointer"
      style={{ aspectRatio: '16 / 9' }}
      onClick={handleContainerClick}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span className="text-white text-xs font-medium">Loading video...</span>
          </div>
        </div>
      )}

      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        preload="metadata"
      />

      {/* Slim Custom Controls Overlay */}
      {!isLoading && (
        <div 
          className={`absolute inset-0 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Top Gradient - Subtle */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent"></div>
          
          {/* Bottom Gradient - Subtle */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent"></div>

          {/* Top-Left: Back Arrow - Small & Minimal */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack?.();
            }}
            className="absolute top-3 left-3 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            <ChevronLeft size={20} className="text-white" strokeWidth={2} />
          </button>

          {/* Top-Right: Title - Small */}
          {title && (
            <div className="absolute top-3 right-3 z-50 px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm">
              <span className="text-white text-xs font-medium truncate max-w-[200px] block">{title}</span>
            </div>
          )}

          {/* Bottom Controls - Compact & Minimal */}
          <div className="absolute bottom-2 left-0 right-0 z-50 px-4">
            {/* Enhanced Progress Bar with Seeking */}
            <div 
              ref={progressBarRef}
              className="relative w-full bg-white/20 rounded-full cursor-pointer mb-3 group"
              style={{ height: isDraggingSeek ? '8px' : '6px' }}
              onClick={handleProgressClick}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              onMouseMove={handleProgressMouseMove}
              onMouseLeave={() => setShowHoverTime(false)}
              onTouchMove={handleProgressMouseMove}
            >
              {/* Background track */}
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              
              {/* Buffered portion (simulated) */}
              <div 
                className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
                style={{ width: `${Math.min(progress + 15, 100)}%` }}
              ></div>

              {/* Played portion - Vibrant Blue */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00A8E8] to-[#0088CC] rounded-full transition-all"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: isDraggingSeek ? '0 0 8px rgba(0, 168, 232, 0.6)' : 'none'
                }}
              >
                {/* Interactive Thumb - appears on hover/drag */}
                <div 
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 rounded-full transition-all origin-center
                    ${isDraggingSeek ? 'w-4 h-4 bg-white shadow-lg scale-100' : 'w-3 h-3 bg-white shadow-md scale-0 group-hover:scale-100'}`}
                  style={{
                    boxShadow: isDraggingSeek ? '0 0 12px rgba(255, 255, 255, 0.8)' : ''
                  }}
                ></div>
              </div>

              {/* Hover Time Preview - shows above bar on hover */}
              {showHoverTime && !isDraggingSeek && (
                <div 
                  className="absolute -top-8 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md whitespace-nowrap pointer-events-none"
                  style={{ left: `${hoverProgress}%` }}
                >
                  <span className="text-white text-xs font-mono font-semibold">
                    {formatTime(duration * (hoverProgress / 100))}
                  </span>
                </div>
              )}

              {/* Dragging Time Preview - larger, more prominent */}
              {isDraggingSeek && (
                <div 
                  className="absolute -top-10 -translate-x-1/2 px-3 py-1.5 bg-[#00A8E8]/90 backdrop-blur-sm rounded-md whitespace-nowrap pointer-events-none border border-white/30"
                  style={{ left: `${progress}%` }}
                >
                  <span className="text-white text-sm font-mono font-bold">
                    {formatTime(currentTime)}
                  </span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00A8E8]/90 rounded-sm rotate-45"></div>
                </div>
              )}
            </div>

            {/* Controls Row - Minimal spacing */}
            <div className="flex items-center justify-between">
              {/* Left: Play/Pause - 36px circular white */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlayPause}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition-all shadow-md active:scale-95"
                >
                  {isPlaying ? (
                    <Pause size={16} className="text-black" fill="black" />
                  ) : (
                    <Play size={16} className="text-black ml-0.5" fill="black" />
                  )}
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
                >
                  {isMuted ? (
                    <VolumeX size={14} className="text-white" />
                  ) : (
                    <Volume2 size={14} className="text-white" />
                  )}
                </button>

                {/* Timestamp - Shows both current and total time */}
                <div className="flex items-center space-x-1 ml-2">
                  <span className="text-white text-[11px] font-medium font-mono">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-white/40 text-[11px]">/</span>
                  <span className="text-white/70 text-[11px] font-mono">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Right: Fullscreen - Minimal */}
              <button
                onClick={handleFullscreen}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-all active:scale-95"
              >
                <Maximize size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};