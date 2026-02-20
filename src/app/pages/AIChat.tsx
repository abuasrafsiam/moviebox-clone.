import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export const AIChat = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
            <MessageSquare size={48} className="text-white" />
            <Sparkles size={20} className="absolute top-2 right-2 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white">
          AI Chat
        </h1>

        {/* Coming Soon Message */}
        <div className="space-y-3">
          <p className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Coming Soon
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Get ready for intelligent conversations about movies, personalized recommendations, and instant answers to all your entertainment questions.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 justify-center pt-4">
          <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs">
            Smart Recommendations
          </div>
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs">
            Movie Insights
          </div>
          <div className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-xs">
            24/7 Assistance
          </div>
        </div>
      </div>
    </div>
  );
};
