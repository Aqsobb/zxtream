'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineThumbUp, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
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
        body: JSON.stringify({ action: 'like', commentId, userId: currentUser.uid }),
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;
    try {
      const isOwner = currentUser.role === 'owner' || currentUser.isOwner;
      const isOwnComment = commentId && comments.find(c => c.id === commentId)?.uid === currentUser.uid;

      if (isOwner && !isOwnComment) {
        await fetch(`${API_BASE}/api/admin/delete-comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentId, requesterUid: currentUser.uid }),
        });
      } else {
        await fetch(`${API_BASE}/api/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', commentId, userId: currentUser.uid }),
        });
      }
      fetchComments();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
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
          <img
            src={currentUser.photoURL || '/images/default-avatar.png'}
            alt=""
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              rows={2}
            />
            <div className="flex justify-end mt-2">
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
          No comments yet. Be the first!
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => {
              const roleConfig = getRoleConfig(comment.role);
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3 p-4 bg-white/5 border border-white/5 rounded-xl"
                  style={{
                    borderColor: `${roleConfig.color}20`,
                  }}
                >
                  <img
                    src={comment.photoURL || '/images/default-avatar.png'}
                    alt=""
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{
                      boxShadow: (comment.role === 'owner' || comment.role === 'vvip')
                        ? `0 0 10px ${roleConfig.color}40`
                        : undefined,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <RoleName
                        name={comment.displayName}
                        role={comment.role}
                        className="text-sm"
                      />
                      <RoleBadge role={comment.role} size="sm" showLabel={false} />
                      <span className="text-xs text-gray-500">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                      >
                        <HiOutlineThumbUp className="w-4 h-4" />
                        {comment.likes?.length || 0}
                      </button>
                      {(currentUser?.uid === comment.uid || currentUser?.role === 'owner' || currentUser?.isOwner) && (
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
