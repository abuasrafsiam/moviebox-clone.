import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { projectId } from '../../utils/supabase/info';

export const useUserData = () => {
  const { session } = useAuth();
  const [myList, setMyList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-116da2c5/user-data`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      if (data.myList) setMyList(data.myList);
      if (data.history) setHistory(data.history);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const toggleMyList = async (movie: any) => {
    if (!session) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-116da2c5/mylist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ movie })
      });
      const data = await response.json();
      if (data.myList) setMyList(data.myList);
    } catch (error) {
      console.error('Error toggling list:', error);
    }
  };

  const addToHistory = async (movie: any) => {
    if (!session) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-116da2c5/history/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ movie })
      });
      const data = await response.json();
      if (data.history) setHistory(data.history);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  return { myList, history, loading, toggleMyList, addToHistory, refresh: fetchUserData };
};