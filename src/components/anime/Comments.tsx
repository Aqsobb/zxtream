'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineThumbUp, HiOutlineTrash, HiOutlineEmojiHappy, HiOutlineReply, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import AvatarFrame from '@/components/ui/AvatarFrame';
import RoleBadge, { RoleName } from '@/components/ui/RoleBadge';
import { getRoleConfig, canUseEmoticon, getEmoticonSet } from '@/lib/roles';
import { API_BASE } from '@/lib/config';
import toast from 'react-hot-toast';

interface Reply {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  text: string;
  createdAt: number;
}

interface Comment {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  text: string;
  likes: string[];
  createdAt: number;
  replies?: Reply[];
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
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const emoticonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored));
    fetchComments();
  }, [type, targetId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emoticonRef.current && !emoticonRef.current.contains(e.target as Node)) {
        setShowEmoticonPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    const hasEmoji = EMOJI_REGEX.test(newComment);
    const canEmoji = canUseEmoticon(currentUser.role);
    if (hasEmoji && !canEmoji) {
      toast.error('Hanya VIP, VVIP, Owner, dan Dev yang bisa pakai emoji!');
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
        setShowEmoticonPicker(false);
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!currentUser || !replyText.trim()) return;

    const hasEmoji = EMOJI_REGEX.test(replyText);
    const canEmoji = canUseEmoticon(currentUser.role);
    if (hasEmoji && !canEmoji) {
      toast.error('Hanya VIP, VVIP, Owner, dan Dev yang bisa pakai emoji!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          type,
          targetId,
          commentId,
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role || 'member',
          text: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to reply:', error);
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

  const insertEmoticon = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmoticonPicker(false);
  };

  const insertReplyEmoticon = (emoji: string) => {
    setReplyText(prev => prev + emoji);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const canEmoji = currentUser && canUseEmoticon(currentUser.role);
  const emoticonSet = currentUser ? getEmoticonSet(currentUser.role) : [];

  const renderComment = (comment: Comment, isReply = false, parentRole = '') => {
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
        className={`relative overflow-hidden ${isReply ? 'ml-12 mt-2' : ''}`}
      >
        {/* Role background */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: isDev
              ? 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.02))'
              : isOwner
              ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.03))'
              : isVVIP
              ? 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.02))'
              : isVIP
              ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isPremium ? roleConfig.color + '30' : 'rgba(255,255,255,0.05)'}`,
          }}
        />

        {/* Glow */}
        {isPremium && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: isDev
                ? '0 0 20px rgba(6,182,212,0.15), inset 0 0 20px rgba(6,182,212,0.05)'
                : isOwner
                ? '0 0 25px rgba(245,158,11,0.2), inset 0 0 25px rgba(245,158,11,0.05)'
                : isVVIP
                ? '0 0 15px rgba(168,85,247,0.15), inset 0 0 15px rgba(168,85,247,0.03)'
                : '0 0 10px rgba(59,130,246,0.1)',
            }}
          />
        )}

        {/* Floating particles for owner */}
        {isOwner && !isReply && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {[...Array(5)].map((_, i) => (
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
                  y: [0, -50 - Math.random() * 30],
                  x: [0, (Math.random() - 0.5) * 20],
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

        {/* Content */}
        <div className={`relative z-10 p-3.5 flex gap-3 ${isReply ? 'py-2.5' : ''}`}>
          <AvatarFrame
            src={comment.photoURL}
            role={comment.role}
            size={isReply ? 'sm' : 'md'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <RoleName name={comment.displayName} role={comment.role} className="text-sm" />
              <RoleBadge role={comment.role} size="sm" showLabel={false} />
              <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
            </div>
            <p className={`text-sm leading-relaxed ${
              isDev ? 'text-cyan-100' :
              isOwner ? 'text-amber-100' :
              isVVIP ? 'text-purple-100' :
              isVIP ? 'text-blue-100' :
              'text-gray-200'
            }`}>
              {comment.text}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors group"
              >
                <HiOutlineThumbUp className="w-4 h-4 group-hover:fill-purple-400/30 transition-all" />
                <span>{comment.likes?.length || 0}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <HiOutlineReply className="w-4 h-4" />
                  Balas
                </button>
              )}
              {(currentUser?.uid === comment.uid || currentUser?.role === 'owner' || currentUser?.role === 'dev') && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reply input */}
            <AnimatePresence>
              {replyTo === comment.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Balas komentar..."
                      className="flex-1 px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleReply(comment.id);
                      }}
                    />
                    {canEmoji && emoticonSet.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-yellow-400"
                        >
                          <HiOutlineEmojiHappy className="w-4 h-4" />
                        </button>
                        {showEmoticonPicker && (
                          <div className="absolute bottom-full right-0 mb-2 p-2 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-20 w-48">
                            <div className="flex flex-wrap gap-0.5">
                              {emoticonSet.map((emoji, i) => (
                                <button
                                  key={i}
                                  onClick={() => insertReplyEmoticon(emoji)}
                                  className="w-7 h-7 flex items-center justify-center text-sm hover:bg-white/10 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      Kirim
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && !isReply && (
              <div className="mt-2">
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {expandedReplies.has(comment.id) ? (
                    <HiOutlineChevronUp className="w-3 h-3" />
                  ) : (
                    <HiOutlineChevronDown className="w-3 h-3" />
                  )}
                  {comment.replies.length} balasan
                </button>
                <AnimatePresence>
                  {expandedReplies.has(comment.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {comment.replies.map((reply) => (
                        <div key={reply.id}>
                          {renderComment({ ...reply, likes: [], replies: [] }, true, comment.role)}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-5">
        <HiOutlineChat className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold">Comments ({comments.length})</h2>
      </div>

      {/* Post comment */}
      {currentUser ? (
        <div className="flex gap-3 mb-6">
          <AvatarFrame
            src={currentUser.photoURL}
            role={currentUser.role || 'member'}
            size="md"
          />
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={canEmoji ? "Tulis komentar... (emoji allowed ✨)" : "Tulis komentar..."}
                className="w-full p-3 pr-10 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                  }
                }}
              />
              {canEmoji && emoticonSet.length > 0 && (
                <div ref={emoticonRef} className="absolute right-2 bottom-2">
                  <button
                    onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-yellow-400"
                  >
                    <HiOutlineEmojiHappy className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showEmoticonPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 p-3 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-20 w-64"
                      >
                        <p className="text-xs text-gray-400 mb-2">
                          Emoticon ({currentUser.role})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {emoticonSet.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => insertEmoticon(emoji)}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors hover:scale-110"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              {!canEmoji && (
                <span className="text-xs text-gray-500">VIP+ bisa pakai emoji</span>
              )}
              <div className="flex-1" />
              <button
                onClick={handlePost}
                disabled={!newComment.trim() || posting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {posting ? 'Posting...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-gray-400 mb-6">
          Login untuk berkomentar
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
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map((comment) => renderComment(comment))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
