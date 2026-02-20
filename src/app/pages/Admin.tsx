import React, { useState } from 'react';
import { ChevronLeft, Database, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

export const Admin = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [tmdbId, setTmdbId] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbId || !hlsUrl) return toast.error('Please fill all fields');
    if (!session) return toast.error('You must be signed in');

    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-116da2c5/admin/add-movie`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmdbId, hlsUrl })
      });

      if (response.ok) {
        toast.success('Movie stream added successfully!');
        setTmdbId('');
        setHlsUrl('');
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to add movie');
      }
    } catch (error) {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <Database className="mr-2 text-[#00FFCC]" />
          Admin Console
        </h1>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl max-w-lg mx-auto">
        <h2 className="text-lg font-bold mb-6 text-gray-300">Add HLS Stream</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">TMDB ID</label>
            <input 
              type="text" 
              placeholder="e.g. 550" 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FFCC] outline-none transition-colors"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 italic">Enter the unique ID from TMDB (e.g., from movie URL)</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">HLS Stream URL (.m3u8)</label>
            <input 
              type="text" 
              placeholder="https://example.com/video.m3u8" 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FFCC] outline-none transition-colors"
              value={hlsUrl}
              onChange={(e) => setHlsUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00FFCC] text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Plus size={20} />
                <span>Add Stream to Database</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <CheckCircle size={18} className="text-[#00FFCC] mt-0.5 flex-shrink-0" />
            <p>HLS streams will override default YouTube trailers in the player.</p>
          </div>
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p>Ensure the HLS link has proper CORS headers for web playback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};