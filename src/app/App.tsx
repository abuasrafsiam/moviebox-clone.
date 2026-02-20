import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { Downloads } from './pages/Downloads';
import { Me } from './pages/Me';
import { Admin } from './pages/Admin';
import { BuzzBox } from './pages/BuzzBox';
import { MyList } from './pages/MyList';
import { WatchHistory } from './pages/WatchHistory';
import { MyLikes } from './pages/MyLikes';
import { MyComments } from './pages/MyComments';
import { ComingSoon } from './pages/ComingSoon';
import { Settings } from './pages/Settings';
import { AIChat } from './pages/AIChat';
import { BottomNav } from './components/BottomNav';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { DownloadProvider } from './context/DownloadContext';
import { MovieProvider } from './context/MovieContext';
import { FullscreenProvider, useFullscreen } from './context/FullscreenContext';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('MovieBase crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-2xl font-bold text-[#00FFCC] mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">{this.state.error}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
            className="px-6 py-3 border border-[#00FFCC] text-[#00FFCC] rounded-xl text-sm font-bold hover:bg-[#00FFCC]/10 transition-colors"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Placeholder ───────────────────────────────────────────────────────────────
const NovelHub = () => (
  <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">NovelHub</h1>
    <p className="text-gray-400">Offline, Free and Daily updated novels coming soon!</p>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const { isFullscreen } = useFullscreen();
  
  return (
    <div className="bg-black min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/me" element={<Me />} />
        <Route path="/admin-hidden" element={<Admin />} />
        <Route path="/novel-hub" element={<NovelHub />} />
        <Route path="/buzzbox" element={<BuzzBox />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/watch-history" element={<WatchHistory />} />
        <Route path="/my-likes" element={<MyLikes />} />
        <Route path="/my-comments" element={<MyComments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/coming-soon/:feature" element={<ComingSoon />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/trending" element={<Search />} />
      </Routes>
      {!isFullscreen && <BottomNav />}
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <DownloadProvider>
            <MovieProvider>
              <FullscreenProvider>
                <Router>
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </Router>
              </FullscreenProvider>
            </MovieProvider>
          </DownloadProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
