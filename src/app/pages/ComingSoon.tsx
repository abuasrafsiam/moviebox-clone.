import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const ComingSoon = () => {
  const navigate = useNavigate();
  const { feature } = useParams<{ feature: string }>();

  const getTitle = () => {
    switch (feature) {
      case 'messages':
        return 'Messages';
      case 'community':
        return 'Community';
      case 'posts':
        return 'Posts';
      case 'novels':
        return 'Hot Novels';
      default:
        return 'Feature';
    }
  };

  const getIcon = () => {
    switch (feature) {
      case 'messages':
        return '💬';
      case 'community':
        return '👥';
      case 'posts':
        return '✍️';
      case 'novels':
        return '📚';
      default:
        return '🚀';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black z-40 px-4 py-4 flex items-center space-x-4 border-b border-white/10">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold">{getTitle()}</h1>
      </div>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-[#00FFCC]/20 to-[#FF3B6A]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <span className="text-6xl">{getIcon()}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FFCC] to-[#FF3B6A] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00FFCC] to-[#FF3B6A] text-transparent bg-clip-text">
          Coming Soon
        </h2>
        
        <p className="text-gray-400 text-lg mb-2">
          {getTitle()} is under development
        </p>
        
        <p className="text-gray-500 text-sm max-w-sm">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 bg-[#00FFCC] text-black font-bold px-8 py-3 rounded-full hover:bg-[#00FFCC]/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};