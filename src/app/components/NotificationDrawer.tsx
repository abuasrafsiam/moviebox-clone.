import React from 'react';
import { X, Bell, BellOff, Trash2, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { tmdb } from '../utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useUser();
  const navigate = useNavigate();

  const handleNotifClick = (notif: any) => {
    markAsRead(notif.id);
    navigate(`/movie/${notif.movieId}`);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between bg-black/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="text-[#00FFCC]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center border border-[#0a0a0a]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">Notifications</h2>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-[#00FFCC] uppercase tracking-wider hover:opacity-80 transition-opacity"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <motion.div
                      layout
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-6 py-4 flex space-x-4 cursor-pointer hover:bg-white/5 transition-colors relative group ${!notif.read ? 'bg-[#00FFCC]/5' : ''}`}
                    >
                      {!notif.read && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00FFCC] rounded-full" />
                      )}
                      
                      <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                        <img 
                          src={tmdb.getImageUrl(notif.poster)} 
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-bold text-sm truncate pr-2 ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center pt-0.5">
                            <Clock size={10} className="mr-1" />
                            {formatDate(notif.timestamp)}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 mb-2 ${!notif.read ? 'text-gray-300' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center space-x-2">
                           <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                             NEW CONTENT
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 space-y-4 opacity-40">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                    <Bell size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">All caught up!</h3>
                    <p className="text-sm mt-1">When you get updates about movies in your list, they'll appear here.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/50 border-t border-white/5">
              <button 
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};