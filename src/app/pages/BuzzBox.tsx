import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Download, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Category {
  id: string;
  name: string;
  viewers: string;
  bgColor: string;
  thumbnail?: string;
}

interface Post {
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
  caption: string;
  image: string;
  likes: string;
  comments: number;
  shares: number;
  isLiked?: boolean;
}

export const BuzzBox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'images' | 'nearby'>('explore');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Meme & S...', viewers: '33k', bgColor: '#FFD700' },
    { id: '2', name: 'LOL Loop', viewers: '37k', bgColor: '#F4E4C1' },
    { id: '3', name: 'Netflix &...', viewers: '156k', bgColor: '#FFFFFF' },
    { id: '4', name: 'Hot Girls', viewers: '181k', bgColor: '#FFA07A', thumbnail: 'woman fashion portrait' },
    { id: '5', name: 'BuzzBox', viewers: 'More', bgColor: '#1a1a1a' }
  ]);

  useEffect(() => {
    // Mock posts data
    setPosts([
      {
        id: '1',
        username: 'NotViolentJustSmart',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NotViolent',
        caption: 'This looks wrong if you have a dirty mind 🤣',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
        likes: '1.5 k',
        comments: 42,
        shares: 596,
        isLiked: false
      },
      {
        id: '2',
        username: 'Fun Viral Vids',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FunViral',
        verified: true,
        caption: 'Something is not ok in that house',
        image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
        likes: '2.1 k',
        comments: 89,
        shares: 1203,
        isLiked: false
      }
    ]);
  }, []);

  const handleLike = (postId: string) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? `${parseFloat(post.likes) - 0.001} k` : `${parseFloat(post.likes) + 0.001} k` }
        : post
    ));
    toast.success(posts.find(p => p.id === postId)?.isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleComment = (postId: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    toast.info('Comments feature coming soon!');
  };

  const handleShare = (postId: string) => {
    toast.success('Link copied to clipboard!');
  };

  const handleDownload = (postId: string) => {
    if (!user) {
      toast.error('Please login to download');
      return;
    }
    toast.success('Download started!');
  };

  const handlePost = () => {
    if (!user) {
      toast.error('Please login to create posts');
      return;
    }
    toast.info('Create post feature coming soon!');
  };

  const handleCategoryClick = (categoryName: string) => {
    toast.info(`Opening ${categoryName} category`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#000000] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">BuzzBox</h1>
          <p className="text-sm text-gray-400">Short & Funny, Less Data</p>
        </div>

        {/* Story/Category Carousel */}
        <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-3">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="flex-shrink-0 relative"
              >
                <div 
                  className="w-24 h-32 rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: category.bgColor }}
                >
                  {category.thumbnail && index === 3 ? (
                    <ImageWithFallback 
                      src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : index === 4 ? (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                      <ChevronRight size={32} className="text-white" />
                    </div>
                  ) : (
                    <div className="text-4xl">
                      {index === 0 ? '😂' : index === 1 ? '🎬' : '🍿'}
                    </div>
                  )}
                  
                  {/* Viewer count badge */}
                  {category.viewers !== 'More' && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center space-x-1">
                      <span className="text-white text-xs">▶</span>
                      <span className="text-white text-xs font-bold">{category.viewers}</span>
                    </div>
                  )}

                  {/* Plus button */}
                  {category.viewers !== 'More' && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Plus size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-2 text-gray-300">{category.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('explore')}
              className={`pb-1 text-base font-bold transition-colors ${
                activeTab === 'explore' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-500'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`pb-1 text-base font-bold transition-colors ${
                activeTab === 'images' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-500'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`pb-1 text-base font-bold transition-colors ${
                activeTab === 'nearby' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-500'
              }`}
            >
              Nearby
            </button>
          </div>
          <button
            onClick={handlePost}
            className="bg-[#00FF88] text-black font-bold px-4 py-1.5 rounded-full flex items-center space-x-1 text-sm hover:bg-[#00FF88]/90 transition-colors"
          >
            <Plus size={16} />
            <span>Post</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => (
          <div key={post.id} className="bg-[#000000] border-b border-white/5 pb-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-3">
              <img 
                src={post.avatar}
                alt={post.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-sm">{post.username}</span>
                  {post.verified && (
                    <span className="text-xs">😊</span>
                  )}
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="px-4 pb-3">
              <p className="text-base leading-relaxed">{post.caption}</p>
            </div>

            {/* Image */}
            <div className="w-full">
              <ImageWithFallback
                src={post.image}
                alt={post.caption}
                className="w-full object-cover"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 pt-3">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Heart 
                  size={24} 
                  className={post.isLiked ? 'fill-red-500 text-red-500' : ''} 
                />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>

              <button
                onClick={() => handleComment(post.id)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle size={24} />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>

              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Share2 size={24} />
                <span className="text-sm font-medium">{post.shares}</span>
              </button>

              <button
                onClick={() => handleDownload(post.id)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Download size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Placeholder */}
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 text-sm">Loading more posts...</p>
      </div>
    </div>
  );
};