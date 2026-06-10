"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

interface Comment {
  id: string;
  author: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [liveUsers, setLiveUsers] = useState<number>(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check local storage or system preference for theme on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    // Connect to the NestJS backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://w5day1b.vercel.app";
    const socketInstance = io(backendUrl);
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      // Request initial comments
      socketInstance.emit("get_comments", (response: any) => {
        // NestJS returns Ack responses as { event: string, data: any }
        if (response && response.data) {
          setComments(response.data);
        }
      });
    });

    // Listen for live users count
    socketInstance.on("live_users_count", (count: number) => {
      setLiveUsers(count);
    });

    // Listen for new comments
    socketInstance.on("new_comment", (comment: Comment) => {
      setComments((prev) => [...prev, comment]);
      setTypingUser(null);

    // Listen for typing
    socketInstance.on("user_typing", (data: { author: string, senderId: string }) => {
      if (data.senderId !== socketInstance.id) {
        setTypingUser(data.author);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    });

      // Show notification if it's from someone else
      if (comment.senderId !== socketInstance.id) {
        toast.success(`New comment from ${comment.author || 'Anonymous'}`, {
          icon: '💬',
          style: {
            borderRadius: '10px',
            background: isDark ? '#333' : '#fff',
            color: isDark ? '#fff' : '#333',
            border: isDark ? '1px solid #444' : '1px solid #ddd',
          },
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [isDark]);

  useEffect(() => {
    // Auto-scroll to bottom
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (socket) {
      socket.emit("add_comment", { author, text });
      setText("");
    }
  };

  return (
    <div className={`min-h-screen font-sans flex items-center justify-center p-2 sm:p-4 selection:bg-blue-500/30 transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      
      <div className={`w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[calc(100dvh-1rem)] sm:h-[93vh] transition-colors duration-300 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 z-10 relative transition-colors duration-300 ${isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-slate-200 bg-white/90'}`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Real-Time Comments
            </h1>
            <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Powered by Next.js & Socket.IO</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            <div className={`px-3 py-1 rounded-full text-xs border flex items-center gap-2 transition-colors duration-300 ${isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              <span className="flex items-center gap-1 font-medium">
                👥 {Math.max(0, liveUsers - 1)} {Math.max(0, liveUsers - 1) === 1 ? 'Other' : 'Others'}
              </span>
              <span className={`w-[1px] h-3 mx-1 transition-colors duration-300 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`}></span>
              <span className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              <span className="hidden sm:inline">{socket?.connected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Comments Area */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 transition-colors duration-300 ${isDark ? 'bg-zinc-900/50' : 'bg-slate-50/50'}`}>
          {comments.length === 0 ? (
            <div className={`h-full flex flex-col items-center justify-center space-y-4 transition-colors duration-300 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              <div className="text-5xl opacity-50">💭</div>
              <p>No comments yet. Start the conversation!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = socket && comment.senderId === socket.id;
              return (
                <div 
                  key={comment.id} 
                  className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {!isMe && (
                      <span className={`font-medium text-sm transition-colors duration-300 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {comment.author || 'Anonymous'}
                      </span>
                    )}
                    <span className={`text-xs transition-colors duration-300 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span className={`font-medium text-sm transition-colors duration-300 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        You
                      </span>
                    )}
                  </div>
                  <div 
                    className={`max-w-[85%] px-5 py-3 shadow-sm transition-colors duration-300 ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                        : isDark 
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-2xl rounded-tl-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {typingUser && (
            <div className={`text-sm italic animate-pulse transition-colors duration-300 px-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {typingUser} is typing...
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-3 sm:p-4 border-t transition-colors duration-300 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'}`}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={`w-full sm:w-64 px-3 py-1.5 border rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                isDark 
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                  : 'bg-slate-50 border-gray-400 text-slate-900 placeholder-slate-400'
              }`}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (socket) {
                    socket.emit("typing", { author });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  isDark 
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                    : 'bg-slate-50 border-gray-400 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className={`w-40 sm:w-auto self-center sm:self-auto px-4 sm:px-5 py-2 shrink-0 text-white text-sm font-medium rounded-xl cursor-pointer disabled:cursor-default transition-all flex items-center justify-center border border-transparent ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 shadow-lg shadow-blue-900/20 disabled:shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 shadow-lg shadow-blue-600/20 disabled:shadow-none'
                }`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
