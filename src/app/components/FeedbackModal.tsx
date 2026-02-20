import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const { session, user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-116da2c5`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please log in to send feedback');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message.trim() })
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setMessage('');
        onClose();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Send Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {user && (
            <div className="bg-black/50 rounded-lg px-3 py-2 text-sm">
              <p className="text-gray-400">Sending as:</p>
              <p className="text-white">{user.email}</p>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Your Feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, report a bug, or suggest a feature..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#00FFCC] outline-none resize-none"
              rows={6}
              required
              disabled={submitting}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="flex-1 bg-[#00FFCC] text-black font-bold py-3 rounded-xl hover:bg-[#00FFCC]/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};