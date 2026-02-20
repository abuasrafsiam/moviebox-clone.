import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Download {
  id: string;
  title: string;
  backdrop_path: string;
  poster_path: string;
  progress: number; // 0-100
  status: 'downloading' | 'completed' | 'failed';
  size: string;
  startedAt: number;
}

interface DownloadContextType {
  downloads: Download[];
  addDownload: (movie: Omit<Download, 'progress' | 'status' | 'startedAt' | 'size'>) => void;
  removeDownload: (id: string) => void;
  getDownload: (id: string) => Download | undefined;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<Download[]>([]);

  // Load downloads from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moviebase_downloads');
    if (saved) {
      try {
        setDownloads(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading downloads:', error);
      }
    }
  }, []);

  // Save downloads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moviebase_downloads', JSON.stringify(downloads));
  }, [downloads]);

  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((download) => {
          if (download.status === 'downloading' && download.progress < 100) {
            const increment = Math.random() * 15 + 5; // Random increment between 5-20%
            const newProgress = Math.min(download.progress + increment, 100);
            
            return {
              ...download,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'downloading',
            };
          }
          return download;
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const addDownload = (movie: Omit<Download, 'progress' | 'status' | 'startedAt' | 'size'>) => {
    const existing = downloads.find((d) => d.id === movie.id);
    if (existing) {
      return; // Already exists
    }

    const newDownload: Download = {
      ...movie,
      progress: 0,
      status: 'downloading',
      size: `${Math.floor(Math.random() * 400 + 300)}MB`, // Random size 300-700MB
      startedAt: Date.now(),
    };

    setDownloads((prev) => [newDownload, ...prev]);
  };

  const removeDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const getDownload = (id: string) => {
    return downloads.find((d) => d.id === id);
  };

  return (
    <DownloadContext.Provider value={{ downloads, addDownload, removeDownload, getDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownloads must be used within DownloadProvider');
  }
  return context;
};
