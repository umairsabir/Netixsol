'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { User, ArrowLeft, UserPlus, UserMinus, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
  followers: string[];
  following: string[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);

  const targetUsername = params.username as string;

  useEffect(() => {
    fetchProfile();
  }, [targetUsername]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/profile/${targetUsername}`);
      setProfile(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return alert('Please sign in to follow users');
    if (!profile) return;

    setFollowLoading(true);
    try {
      const res = await axios.post(`/users/follow/${profile._id}`);
      
      setProfile((prev) => {
        if (!prev) return null;
        
        // Optimistically calculate whether the current user is added to or removed from the list
        const isNowFollowing = res.data.followed;
        const followers = isNowFollowing 
          ? [...prev.followers, user._id] 
          : prev.followers.filter(id => id !== user._id);
          
        return {
          ...prev,
          followersCount: res.data.followersCount,
          followers,
        };
      });
    } catch (err) {
      console.error('Follow request failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-4">
        <p className="text-xl font-semibold mb-4">{error || 'User not found'}</p>
        <Link href="/" className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  const isSelf = user && user._id === profile._id;
  const isFollowing = user && profile.followers.includes(user._id);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black text-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="max-w-xl mx-auto space-y-6">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        {/* Profile Card */}
        <div className="p-8 backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="flex flex-col items-center text-center">
            <img
              src={profile.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
              alt={profile.username}
              className="w-28 h-28 rounded-full border-4 border-slate-850 bg-slate-800 shadow-xl"
            />
            <h2 className="mt-4 text-3xl font-extrabold text-slate-100">{profile.username}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>

            {profile.bio ? (
              <p className="mt-4 text-slate-350 italic text-sm max-w-sm border-t border-slate-800/50 pt-4 leading-relaxed">
                "{profile.bio}"
              </p>
            ) : (
              <p className="mt-4 text-slate-600 text-xs italic max-w-sm border-t border-slate-800/50 pt-4">
                No bio provided by this user.
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6 w-full py-4 rounded-2xl bg-slate-950/40 border border-slate-900">
              <div className="text-center">
                <span className="block text-2xl font-black text-indigo-400">{profile.followersCount}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-black text-violet-400">{profile.followingCount}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Following</span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isSelf && user && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center justify-center gap-2 mt-6 w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isFollowing
                    ? 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
            )}

            {!user && (
              <Link href="/login" className="flex items-center justify-center gap-2 mt-6 w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 transition-all">
                Sign in to Follow {profile.username}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
