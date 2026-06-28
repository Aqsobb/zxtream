'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineThumbUp, HiOutlineTrash } from 'react-icons/hi';
import RoleBadge, { RoleName } from '@/components/ui/RoleBadge';
import { getRoleConfig } from '@/lib/roles';
import { API_BASE } from '@/lib/config';

interface Comment {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  text: string;
  likes: string[];
  createdAt: number;
}

interface CommentsProps {
  type: string;
  targetId: string;
}

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

export default function Comments({ type, targetId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored));
    fetchComments();
  }, [type, targetId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments?type=${type}&targetId=${targetId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!currentUser || !newComment.trim()) return;

    // Emoji check: member can't use emojis, only vip/vvip/owner/dev
    const hasEmoji = EMOJI_REGEX.test(newComment);
    const canUseEmoji = ['vip', 'vvip', 'owner', 'dev'].includes(currentUser.role);
    if (hasEmoji && !canUseEmoji) {
      alert('Hanya VIP, VVIP, Owner, dan Dev yang bisa pakai emoji di komentar!');
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role || 'member',
          text: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', commentId, userId: currentUser.uid, type, targetId }),
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', commentId, userId: currentUser.uid, type, targetId }),
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
    return new Date(ts).toLocaleDateString('id-ID');
  };

  const canUseEmoji = currentUser && ['vip', 'vvip', 'owner', 'dev'].includes(currentUser.role);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-5">
        <HiOutlineChat className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold">Comments ({comments.length})</h2>
      </div>

      {/* Post comment */}
      {currentUser ? (
        <div className="flex gap-3 mb-6">
          <img
            src={currentUser.photoURL || '/images/default-avatar.png'}
            alt=""
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={canUseEmoji ? "Write a comment... (emoji allowed)" : "Write a comment... (no emoji for member)"}
              className="w-full p-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              rows={2}
            />
            <div className="flex items-center justify-between mt-2">
              {!canUseEmoji && (
                <span className="text-xs text-gray-500">💡 VIP+ bisa pakai emoji</span>
              )}
              <button
                onClick={handlePost}
                disabled={!newComment.trim() || posting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-gray-400 mb-6">
          Login to comment
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Belum ada komentar. Jadikan yang pertama!
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => {
              const roleConfig = getRoleConfig(comment.role);
              const isDev = comment.role === 'dev';
              const isOwner = comment.role === 'owner';
              const isVVIP = comment.role === 'vvip';
              const isVIP = comment.role === 'vip';
              const isPremium = isDev || isOwner || isVVIP || isVIP;

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`relative overflow-hidden rounded-xl p-4 ${
                    isDev ? 'border border-cyan-500/30' :
                    isOwner ? 'border border-yellow-500/30' :
                    isVVIP ? 'border border-purple-500/30' :
                    isVIP ? 'border border-blue-500/30' :
                    'border border-white/5 bg-white/5'
                  }`}
                  style={{
                    background: isDev ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))' :
                               isOwner ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))' :
                               isVVIP ? 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))' :
                               isVIP ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))' :
                               undefined,
                    boxShadow: isDev ? '0 0 20px rgba(6,182,212,0.15)' :
                               isOwner ? '0 0 20px rgba(245,158,11,0.15)' :
                               isVVIP ? '0 0 15px rgba(168,85,247,0.12)' :
                               isVIP ? '0 0 10px rgba(59,130,246,0.1)' :
                               undefined,
                  }}
                >
                  {/* Floating particles for dev/owner */}
                  {(isDev || isOwner) && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: '2px',
                            height: '2px',
                            background: roleConfig.color,
                            left: `${15 + Math.random() * 70}%`,
                            bottom: '0%',
                          }}
                          animate={{
                            y: [0, -60 - Math.random() * 40],
                            x: [0, (Math.random() - 0.5) * 30],
                            opacity: [0.8, 0],
                            scale: [1, 0],
                          }}
                          transition={{
                            duration: 1.5 + Math.random(),
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="relative z-10 flex gap-3">
                    <img
                      src={comment.photoURL || '/images/default-avatar.png'}
                      alt=""
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{
                        border: isPremium ? `2px solid ${roleConfig.color}60` : undefined,
                        boxShadow: isDev ? `0 0 10px ${roleConfig.color}40` :
                                   isOwner ? `0 0 10px ${roleConfig.color}40` :
                                   isVVIP ? `0 0 8px ${roleConfig.color}30` : undefined,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <RoleName name={comment.displayName} role={comment.role} className="text-sm" />
                        <RoleBadge role={comment.role} size="sm" showLabel={false} />
                        <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                      </div>
                      <p className={`text-sm ${isDev ? 'text-cyan-100' : isOwner ? 'text-yellow-100' : isVVIP ? 'text-purple-100' : isVIP ? 'text-blue-100' : 'text-gray-200'}`}>
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                        >
                          <HiOutlineThumbUp className="w-4 h-4" />
                          {comment.likes?.length || 0}
                        </button>
                        {(currentUser?.uid === comment.uid || currentUser?.role === 'owner' || currentUser?.role === 'dev') && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
