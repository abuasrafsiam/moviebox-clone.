import * as React from 'react';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  poster: string;
  movieId: number;
  timestamp: string;
  read: boolean;
}

interface UserContextType {
  myList: any[];
  history: any[];
  notifications: Notification[];
  recentSearches: string[];
  loading: boolean;
  toggleMyList: (movie: any) => Promise<void>;
  addToHistory: (movie: any) => Promise<void>;
  addRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
  markAsRead: (notifId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadCount: number;
  refreshUserData: () => Promise<void>;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-116da2c5`;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [myList, setMyList] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const notificationsRef = React.useRef(notifications);
  
  React.useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchUserData = React.useCallback(async (showToast = false) => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/user-data`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        // Check for new notifications to toast
        if (showToast && data.notifications && data.notifications.length > notificationsRef.current.length) {
          const newNotifs = data.notifications.filter((n: any) => 
            !notificationsRef.current.find((old: any) => old.id === n.id)
          );
          newNotifs.forEach((notif: any) => {
            toast(notif.title, {
              description: notif.message,
              action: {
                label: 'View',
                onClick: () => window.location.href = `/movie/${notif.movieId}`
              },
              icon: <div className="w-8 h-10 rounded overflow-hidden mr-2 flex-shrink-0">
                      <img src={`https://image.tmdb.org/t/p/w92${notif.poster}`} className="w-full h-full object-cover" alt="" />
                    </div>,
              duration: 5000,
            });
          });
        }

        setMyList(data.myList || []);
        setHistory(data.history || []);
        setNotifications(data.notifications || []);
        setRecentSearches(data.recentSearches || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    fetchUserData();
  }, [session, fetchUserData]);

  React.useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetchUserData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [session, fetchUserData]);

  const toggleMyList = React.useCallback(async (movie: any) => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE}/mylist/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movie })
      });
      if (response.ok) {
        const data = await response.json();
        const wasAdded = data.myList.some((m: any) => m.id === movie.id);
        setMyList(data.myList);
        if (wasAdded) {
          toast.success(`Added ${movie.title || movie.name} to My List`);
          setTimeout(() => fetchUserData(false), 500);
        } else {
          toast.info(`Removed from My List`);
        }
      }
    } catch (error) {
      toast.error('Failed to update My List');
    }
  }, [session, fetchUserData]);

  const addToHistory = React.useCallback(async (movie: any) => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE}/history/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movie })
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {}
  }, [session]);

  const addRecentSearch = React.useCallback(async (query: string) => {
    if (!session) {
      const guestSearches = JSON.parse(localStorage.getItem('guestSearches') || '[]');
      const updated = [query, ...guestSearches.filter((s: string) => s !== query)].slice(0, 10);
      localStorage.setItem('guestSearches', JSON.stringify(updated));
      setRecentSearches(updated);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/searches/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        setRecentSearches(data.searches);
      }
    } catch (error) {}
  }, [session]);

  const clearRecentSearches = React.useCallback(async () => {
    if (!session) {
      localStorage.removeItem('guestSearches');
      setRecentSearches([]);
      return;
    }
    try {
      await fetch(`${API_BASE}/searches/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      setRecentSearches([]);
    } catch (error) {}
  }, [session]);

  const markAsRead = React.useCallback(async (notifId: string) => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifId })
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {}
  }, [session]);

  const markAllAsRead = React.useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {}
  }, [session]);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = React.useMemo(() => ({
    myList, history, notifications, recentSearches, loading, 
    toggleMyList, addToHistory, addRecentSearch, clearRecentSearches,
    markAsRead, markAllAsRead, unreadCount, refreshUserData: fetchUserData
  }), [myList, history, notifications, recentSearches, loading, toggleMyList, addToHistory, addRecentSearch, clearRecentSearches, markAsRead, markAllAsRead, unreadCount, fetchUserData]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}