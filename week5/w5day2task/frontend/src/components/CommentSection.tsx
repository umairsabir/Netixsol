'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, Heart, CornerDownRight, Send } from 'lucide-react';
import Link from 'next/link';

interface Author {
  _id: string;
  username: string;
  profilePicture: string;
}

interface Reply {
  _id: string;
  author: Author;
  content: string;
  likes: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  author: Author;
  content: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  replies: Reply[];
}

export default function CommentSection() {
  const { user, socket } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // Fetch comments initially
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get('/comments');
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Bind WebSockets event listeners for real-time synchronization
  useEffect(() => {
    if (!socket) return;

    // Real-time main comment created
    socket.on('comment.created', (createdComment: Comment) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === createdComment._id)) return prev;
        return [createdComment, ...prev];
      });
    });

    // Real-time reply created
    socket.on('reply.created', ({ parentCommentId, reply }: { parentCommentId: string; reply: Reply }) => {
      setComments((prev) => {
        return prev.map((c) => {
          if (c._id === parentCommentId) {
            const replies = c.replies || [];
            if (replies.some((r) => r._id === reply._id)) return c;
            return {
              ...c,
              replies: [...replies, reply],
            };
          }
          return c;
        });
      });
    });

    // Real-time like triggered
    socket.on('comment.liked', ({ commentId, likes }: { commentId: string; likes: string[] }) => {
      setComments((prev) => {
        return prev.map((c) => {
          if (c._id === commentId) {
            return { ...c, likes };
          }
          // Also toggle like on nested replies
          const updatedReplies = (c.replies || []).map((r) => {
            if (r._id === commentId) {
              return { ...r, likes };
            }
            return r;
          });
          return { ...c, replies: updatedReplies };
        });
      });
    });

    return () => {
      socket.off('comment.created');
      socket.off('reply.created');
      socket.off('comment.liked');
    };
  }, [socket]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to post comments');
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post('/comments', { content: newComment });
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handlePostReply = async (commentId: string) => {
    if (!user) return alert('Please sign in to reply');
    const content = replyInputs[commentId];
    if (!content || !content.trim()) return;

    try {
      await axios.post(`/comments/${commentId}/reply`, { content });
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return alert('Please sign in to like comments');
    try {
      await axios.post(`/comments/${commentId}/like`);
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Create Comment Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="flex gap-8 p-5 ml-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-slate-700/60">
          <img
            src={user.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
            alt={user.username}
            className="w-11 h-11 rounded-full border border-slate-800 bg-slate-800"
          />
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts on this assignment?..."
              className="w-full bg-slate-950/60 border border-slate-700/90 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none sm:text-sm transition-all duration-300 hover:border-slate-600/80"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-50 transition-all duration-300 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center p-6 bg-slate-900/30 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
          <p className="text-slate-400 text-sm">
            Please{' '}
            <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>{' '}
            to post comments.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 rounded-3xl border border-slate-900/80">
            <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No comments yet</p>
            <p className="text-xs text-slate-600">Be the first to speak out!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = user && comment.likes?.includes(user._id);
            return (
              <div key={comment._id} className="group p-6 ml-12 rounded-3xl glass-panel-interactive">
                {/* Main Comment */}
                <div className="flex gap-4">
                  <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                    <img
                      src={comment.author.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
                      alt={comment.author.username}
                      className="w-11 h-11 rounded-full border border-slate-800 bg-slate-850 hover:scale-110 active:scale-95 transition-all duration-300"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${comment.author.username}`}
                        className="font-bold text-slate-200 hover:text-indigo-400 transition-colors sm:text-sm text-xs"
                      >
                        {comment.author.username}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-semibold">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-slate-300 sm:text-sm text-xs leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>

                    {/* Interactive Actions */}
                    <div className="flex items-center gap-5 mt-4">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className={`flex items-center gap-1.5 text-xs transition-all duration-300 transform active:scale-90 ${isLiked
                            ? 'text-rose-500 font-black filter drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                            : 'text-slate-500 hover:text-rose-400'
                          }`}
                      >
                        <Heart className={`w-4 h-4 transition-transform duration-300 ${isLiked ? 'fill-rose-500 stroke-rose-500 hover:scale-110' : ''}`} />
                        <span>{comment.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-all font-semibold"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="flex items-center gap-1.5 text-xs text-reply-toggle hover:text-reply-toggle-hover transition-all font-bold cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>
                            {expandedComments[comment._id]
                              ? 'Hide Replies'
                              : `Show Replies (${comment.replies.length})`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sliding Inline Reply Form */}
                {activeReplyId === comment._id && (
                  <div className="flex gap-3 mt-4 ml-14 p-3 rounded-2xl bg-slate-950/60 border border-slate-700/60 transition-all duration-300 animate-glow-pulse">
                    <input
                      type="text"
                      value={replyInputs[comment._id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [comment._id]: e.target.value }))
                      }
                      placeholder="Write a reply..."
                      className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-600 focus:outline-none sm:text-sm px-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostReply(comment._id);
                      }}
                    />
                    <button
                      onClick={() => handlePostReply(comment._id)}
                      disabled={!(replyInputs[comment._id]?.trim())}
                      className="py-1.5 px-4 rounded-xl text-[10px] font-black bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Replies List */}
                {comment.replies && comment.replies.length > 0 && expandedComments[comment._id] && (
                  <div className="mt-5 ml-12 pl-4 border-l-2 border-slate-800/80 space-y-4">
                    {comment.replies.map((reply) => {
                      const isReplyLiked = user && reply.likes?.includes(user._id);
                      return (
                        <div key={reply._id} className="flex gap-3 bg-slate-900/10 p-3 rounded-2xl border border-slate-900/20 hover:border-slate-900/60 transition-colors duration-300">
                          <Link href={`/profile/${reply.author.username}`} className="flex-shrink-0">
                            <img
                              src={reply.author.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
                              alt={reply.author.username}
                              className="w-8 h-8 rounded-full border border-slate-850 bg-slate-800"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/profile/${reply.author.username}`}
                                className="font-bold text-slate-350 hover:text-indigo-400 transition-colors text-xs"
                              >
                                {reply.author.username}
                              </Link>
                              <span className="text-[9px] text-slate-500">{formatTime(reply.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                              {reply.content}
                            </p>
                            <button
                              onClick={() => handleLike(reply._id)}
                              className={`flex items-center gap-1.5 text-[10px] mt-2 transition-all duration-300 active:scale-90 ${isReplyLiked
                                  ? 'text-rose-500 font-bold filter drop-shadow-[0_0_4px_rgba(244,63,94,0.3)]'
                                  : 'text-slate-500 hover:text-rose-400'
                                }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isReplyLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                              <span>{reply.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
