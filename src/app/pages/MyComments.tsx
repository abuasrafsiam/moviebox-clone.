import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tmdb } from '../utils/tmdb';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface Comment {
  id: string;
  movieId: number;
  comment: string;
  createdAt: string;
  posterPath?: string;
  title?: string;
}

export const MyComments = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-116da2c5`;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/comments/my-comments`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFCC]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black z-40 px-4 py-4 flex items-center space-x-4 border-b border-white/10">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold">My Comments</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-lg">Please log in to see your comments</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-400 text-lg">No comments yet</p>
            <p className="text-gray-500 text-sm mt-2">Start commenting on movies</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => navigate(`/movie/${comment.movieId}`)}
                className="bg-gray-900/50 rounded-lg p-4 border border-white/5 cursor-pointer hover:border-[#00FFCC]/30 transition-colors"
              >
                <div className="flex space-x-3">
                  {comment.posterPath && (
                    <img
                      src={tmdb.getImageUrl(comment.posterPath)}
                      alt={comment.title}
                      className="w-16 h-24 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {comment.title && (
                      <h3 className="font-semibold text-sm mb-2 truncate">
                        {comment.title}
                      </h3>
                    )}
                    <p className="text-gray-300 text-sm mb-2 line-clamp-3">
                      {comment.comment}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};