import React, { useState } from 'react';
import { User, Heart, Clock, MessageSquare, Settings as SettingsIcon, HelpCircle, LogOut, ChevronRight, Crown, Book, History, Users, PenSquare, MessageCircle, Speaker } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/useUserData';
import { useNavigate } from 'react-router-dom';
import { tmdb } from '../utils/tmdb';
import { toast } from 'sonner';
import { FeedbackModal } from '../components/FeedbackModal';

export const Me = () => {
  const { user, session, signOut, signIn, signUp, signInWithOAuth } = useAuth();
  const { history, myList } = useUserData();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Logged in successfully');
      } else {
        await signUp(email, password, name);
        toast.success('Account created and logged in');
      }
      setShowAuth(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Header */}
      <div className="px-4 py-4 flex justify-between items-center">
        <button onClick={() => setShowAuth(true)} className="p-2 bg-gray-900 rounded-full">
           <User size={20} className="text-gray-400" />
        </button>
        <div className="flex space-x-4">
          <Clock size={24} className="text-gray-300" />
          {user && <LogOut size={24} className="text-gray-300 cursor-pointer" onClick={() => signOut()} />}
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2">
           <div>
             {user ? (
               <>
                 <h1 className="text-2xl font-bold">{user.user_metadata?.name || 'Member'}</h1>
                 <div className="bg-gray-800/80 px-3 py-1 rounded inline-block mt-2 text-xs text-gray-400">
                   ID: {user.id.slice(0, 8)}
                 </div>
               </>
             ) : (
               <>
                 <h1 className="text-2xl font-bold">Log in to your account</h1>
                 <div className="bg-gray-800/80 px-3 py-1 rounded inline-block mt-2 text-xs text-gray-400">
                   Join MovieBase Community
                 </div>
               </>
             )}
           </div>
           {!user && (
             <button 
               onClick={() => setShowAuth(true)}
               className="bg-[#00FFCC] text-black font-bold px-6 py-2 rounded-md"
             >
               Log in
             </button>
           )}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-[#004d40]/40 border-y border-teal-900/50 py-2 px-4 flex items-center space-x-2 text-[10px] text-[#00FFCC]">
         <Speaker size={14} className="transform rotate-[-20deg]" />
         <span>Find Family Mode in Settings for family-friendly content.</span>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Premium Trial */}
        <div className="bg-gray-900/50 rounded-xl p-4 flex items-center justify-between border border-white/5">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Crown size={24} className="text-yellow-500" />
             </div>
             <div>
               <h3 className="font-bold text-sm">Premium Trial</h3>
               <p className="text-[10px] text-gray-500">1 days left</p>
             </div>
           </div>
           <div className="flex items-center space-x-2">
             <div className="bg-orange-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-orange-500/30">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center text-[6px]">✪</div>
                <span className="text-[10px] font-bold text-orange-500">2</span>
             </div>
             <ChevronRight size={18} className="text-gray-600" />
           </div>
        </div>

        {/* Hot Novels */}
        <div className="bg-gray-900/50 rounded-xl p-4 flex items-center justify-between border border-white/5">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <Book size={24} className="text-blue-500" />
             </div>
             <div>
               <h3 className="font-bold text-sm">Hot Novels</h3>
               <p className="text-[10px] text-gray-500">Offline, Free and Daily updated</p>
             </div>
           </div>
           <button className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-md">Read now</button>
        </div>

        {/* Menu Sections */}
        <div className="bg-gray-900/30 rounded-xl overflow-hidden divide-y divide-white/5">
          <MenuItem 
            icon={<History size={18} />} 
            label="My List" 
            count={String(myList.length)} 
            onClick={() => navigate('/my-list')}
          />
          
          <div className="py-4" onClick={() => navigate('/watch-history')}>
             <div className="flex items-center justify-between px-4 mb-3 cursor-pointer">
                <div className="flex items-center space-x-3">
                   <History size={18} className="text-gray-400" />
                   <span className="text-sm font-medium">Watch History</span>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
             </div>
             {history.length > 0 ? (
               <div className="flex space-x-3 overflow-x-auto no-scrollbar px-4">
                 {history.map((m) => (
                   <div key={m.id} onClick={(e) => {
                     e.stopPropagation();
                     navigate(`/movie/${m.id}`);
                   }} className="min-w-[100px] flex flex-col space-y-1 cursor-pointer">
                      <div className="relative aspect-video rounded overflow-hidden">
                         <img src={tmdb.getImageUrl(m.backdrop_path)} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-gray-300 truncate">{m.title}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="px-4 py-2 text-xs text-gray-500">No history yet. Start watching!</div>
             )}
          </div>

          <MenuItem 
            icon={<MessageSquare size={18} />} 
            label="Messages" 
            onClick={() => navigate('/coming-soon/messages')}
          />
        </div>

        <div className="bg-gray-900/30 rounded-xl overflow-hidden divide-y divide-white/5">
          <MenuItem 
            icon={<Users size={18} />} 
            label="Community" 
            count="0" 
            onClick={() => navigate('/coming-soon/community')}
          />
          <MenuItem 
            icon={<PenSquare size={18} />} 
            label="Posts" 
            count="0" 
            onClick={() => navigate('/coming-soon/posts')}
          />
          <MenuItem 
            icon={<Heart size={18} />} 
            label="My Likes" 
            count="0" 
            onClick={() => navigate('/my-likes')}
          />
          <MenuItem 
            icon={<MessageCircle size={18} />} 
            label="My Comments" 
            count="0" 
            onClick={() => navigate('/my-comments')}
          />
        </div>

        <div className="bg-gray-900/30 rounded-xl overflow-hidden divide-y divide-white/5">
          <MenuItem 
            icon={<SettingsIcon size={18} />} 
            label="Settings" 
            onClick={() => navigate('/settings')}
          />
          <MenuItem 
            icon={<MessageSquare size={18} />} 
            label="Feedback" 
            onClick={() => setShowFeedback(true)} 
          />
        </div>
      </div>

      <div className="px-4 py-4 text-center space-y-2">
         <div className="text-[10px] text-gray-500">
           Official website: moviebase.ph <span className="text-[#00FFCC] ml-1">Copy link</span>
         </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 w-full max-w-sm rounded-2xl p-6 border border-white/10 relative">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-gray-500">
               ✕
            </button>
            <h2 className="text-xl font-bold mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-[#00FFCC] outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-[#00FFCC] outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-[#00FFCC] outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00FFCC] text-black font-bold py-3 rounded-xl mt-4"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 flex flex-col space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-900 px-2 text-gray-500 uppercase">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={() => handleOAuth('google')}
                className="w-full bg-white text-black font-bold py-2.5 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-colors"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button 
                onClick={() => handleOAuth('github')}
                className="w-full bg-[#24292e] text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-3 hover:bg-[#2b3137] transition-colors"
              >
                <GithubIcon />
                <span>Continue with GitHub</span>
              </button>
            </div>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-xs text-gray-500 mt-6"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, count, onClick }: { icon: React.ReactNode; label: string; count?: string; onClick?: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-white/5">
    <div className="flex items-center space-x-3">
       <div className="text-gray-400">{icon}</div>
       <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center space-x-1">
       {count !== undefined && <span className="text-xs text-gray-500">{count}</span>}
       <ChevronRight size={18} className="text-gray-600" />
    </div>
  </div>
);