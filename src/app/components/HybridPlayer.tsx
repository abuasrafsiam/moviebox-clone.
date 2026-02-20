import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Maximize2, Volume2, Settings, ChevronLeft } from 'lucide-react';

interface HybridPlayerProps {
  youtubeId?: string;
  directUrl?: string;
  onBack?: () => void;
  title?: string;
}

export const HybridPlayer: React.FC<HybridPlayerProps> = ({ youtubeId, directUrl, onBack, title }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [quality, setQuality] = useState('Auto');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Only initialize video.js if we have a direct URL
    if (directUrl && videoRef.current && !youtubeId) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: directUrl,
          type: directUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }]
      });

      return () => {
        if (player && !player.isDisposed()) {
          player.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [directUrl, youtubeId]);

  if (youtubeId && !directUrl) {
    return (
      <div className="relative w-full aspect-video bg-black group">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&modestbranding=1&controls=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        {/* Back button overlay for YouTube */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black group overflow-hidden" ref={videoRef}>
      {/* Overlay Back Button for Video.js (Custom overlay because video.js controls might hide it) */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Quality Selector (Simplified Mock for HLS) */}
      {directUrl?.includes('.m3u8') && (
        <div className="absolute bottom-12 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white"
          >
            <Settings size={18} />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-2 min-w-[100px] shadow-2xl">
              {['Auto', '1080p', '720p', '480p'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuality(q);
                    setShowSettings(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded ${quality === q ? 'text-[#00FFCC] bg-white/10' : 'text-gray-400'}`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
