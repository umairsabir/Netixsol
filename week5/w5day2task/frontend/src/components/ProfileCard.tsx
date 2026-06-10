'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, AlignLeft, Image, Save, X, Edit, Sparkles } from 'lucide-react';

export default function ProfileCard() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.put('/users/profile', { bio, profilePicture });
      updateUser(res.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/25 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-glow-pulse">
      {/* Subtle top decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="flex flex-col items-center text-center">
        <div className="relative group">
          <img
            src={user.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
            alt={user.username}
            className="w-24 h-24 rounded-full border-2 border-indigo-500/30 bg-slate-850 shadow-inner group-hover:scale-105 group-hover:border-indigo-400/80 transition-all duration-300 animate-ring-glow"
          />
          <span className="absolute bottom-0 right-1 flex h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
        </div>
        
        <h2 className="mt-4 text-xl font-black text-slate-100 flex items-center gap-1.5 justify-center">
          {user.username}
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </h2>
        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{user.email}</p>

        {user.bio ? (
          <p className="mt-4 text-slate-450 text-xs italic leading-relaxed px-4 border-l-2 border-indigo-500/20 py-1 bg-slate-950/20 rounded-xl">
            "{user.bio}"
          </p>
        ) : (
          <p className="mt-4 text-slate-600 text-xs italic px-4">
            No bio provided yet. Add one below!
          </p>
        )}

        {/* Dynamic Statistics Panel */}
        <div className="flex justify-center gap-6 mt-6 w-full py-4 rounded-2xl bg-slate-950/50 border border-slate-900/50">
          <div className="text-center flex-1 border-r border-slate-900/80">
            <span className="block text-2xl font-black text-indigo-400">{user.followers?.length || 0}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Followers</span>
          </div>
          <div className="text-center flex-1">
            <span className="block text-2xl font-black text-violet-400">{user.following?.length || 0}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Following</span>
          </div>
        </div>

        {message && (
          <div className="mt-4 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/25">
            {message}
          </div>
        )}

        {/* Profile Card Action Toggle */}
        {!isEditing ? (
          <button
            onClick={() => {
              setBio(user.bio || '');
              setProfilePicture(user.profilePicture || '');
              setIsEditing(true);
            }}
            className="flex items-center justify-center gap-1.5 mt-6 w-full py-3 px-4 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        ) : (
          <form onSubmit={handleUpdate} className="mt-6 w-full space-y-4 text-left border-t border-slate-900 pt-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <AlignLeft className="w-3 h-3 text-indigo-400" />
                Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-slate-950/70 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs resize-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Image className="w-3 h-3 text-violet-400" />
                Avatar Image URL
              </label>
              <input
                type="text"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/pic.jpg"
                className="w-full bg-slate-950/70 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 flex justify-center items-center gap-1 py-2 px-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
