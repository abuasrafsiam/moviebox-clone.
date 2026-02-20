import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Download {
  id: string;
  title: string;
  backdrop_path: string;
  poster_path: string;
  progress: number;        // 0–100
  status: 'downloading' | 'completed' | 'failed';
  size: string;
  startedAt: number;
  filePath?: string;       // Absolute path on device once completed
}

interface DownloadContextType {
  downloads: Download[];
  addDownload: (movie: Omit<Download, 'progress' | 'status' | 'startedAt' | 'size'>) => void;
  updateProgress: (id: string, percent: number, filePath?: string) => void;
  markFailed: (id: string) => void;
  removeDownload: (id: string) => void;
  getDownload: (id: string) => Download | undefined;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<Download[]>([]);

  // ── Persist to localStorage ──────────────────────────────────────────────
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

  useEffect(() => {
    localStorage.setItem('moviebase_downloads', JSON.stringify(downloads));
  }, [downloads]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addDownload = (movie: Omit<Download, 'progress' | 'status' | 'startedAt' | 'size'>) => {
    const existing = downloads.find((d) => d.id === movie.id);
    if (existing) return;

    const newDownload: Download = {
      ...movie,
      progress: 0,
      status: 'downloading',
      size: 'Calculating…',
      startedAt: Date.now(),
    };
    setDownloads((prev) => [newDownload, ...prev]);
  };

  /** Called by DownloadManager's onProgress callback — drives the button label */
  const updateProgress = (id: string, percent: number, filePath?: string) => {
    setDownloads((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const completed = percent >= 100;
        return {
          ...d,
          progress: percent,
          status: completed ? 'completed' : 'downloading',
          ...(filePath ? { filePath } : {}),
        };
      })
    );
  };

  const markFailed = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'failed' } : d))
    );
  };

  const removeDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const getDownload = (id: string) => downloads.find((d) => d.id === id);

  return (
    <DownloadContext.Provider
      value={{ downloads, addDownload, updateProgress, markFailed, removeDownload, getDownload }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) throw new Error('useDownloads must be used within DownloadProvider');
  return context;
};
