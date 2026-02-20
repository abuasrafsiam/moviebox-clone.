import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';

export const Settings = () => {
  const navigate = useNavigate();
  const { user, session, signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-116da2c5`;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/account/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await signOut();
        navigate('/');
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 bg-black z-40 px-4 py-4 flex items-center space-x-4 border-b border-white/10">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-gray-400 text-lg">Please log in to access settings</p>
        </div>
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
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Account Info */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <h2 className="text-sm text-gray-400 mb-3">Account Information</h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-white">{user.user_metadata?.name || 'User'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="text-white text-sm font-mono">{user.id.slice(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut size={20} className="text-gray-400" />
              <span className="text-white">Log Out</span>
            </div>
          </button>

          <div className="border-t border-white/5"></div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Trash2 size={20} className="text-red-500" />
              <span className="text-red-500">Delete Account</span>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <h2 className="text-sm text-gray-400 mb-3">About</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">App Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Build</span>
              <span className="text-white">2024.02.11</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 w-full max-w-sm rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Delete Account?</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. All your data including watch history, favorites, and comments will be permanently deleted.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};