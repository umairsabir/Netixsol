'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, token } = useAuth();
  const router = useRouter();

  // Create Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createError, setCreateError] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch {
      alert('Error deleting user');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.post('/users', {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        role: 'admin',
      });
      setIsModalOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  const regularUsers = users.filter(u => u.role === 'user');
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin');

  if (loading || !currentUser) return <div className="p-4">Checking permissions...</div>;
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to access User Management. This module is restricted to Super Administrators.</p>
        <button 
          onClick={() => router.push('/admin')}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-600">Home {'>'} Users</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add Admin User
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`inline-flex p-4 rounded-t-lg border-b-2 ${
                activeTab === 'users'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Customers ({regularUsers.length})
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('admins')}
              className={`inline-flex p-4 rounded-t-lg border-b-2 ${
                activeTab === 'admins'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Administrators ({adminUsers.length})
            </button>
          </li>
        </ul>
      </div>

      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      ) : loading ? (
        <div className="p-4">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Role</th>
                  {activeTab === 'users' && (
                    <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Points</th>
                  )}
                  {isSuperAdmin && (
                    <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'users' ? regularUsers : adminUsers).map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{user._id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    {activeTab === 'users' && (
                      <td className="px-4 py-3 text-sm font-semibold">{user.points}</td>
                    )}
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-sm">
                        {user.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {(activeTab === 'users' ? regularUsers : adminUsers).length === 0 && (
                  <tr>
                    <td colSpan={isSuperAdmin ? (activeTab === 'users' ? 6 : 5) : (activeTab === 'users' ? 5 : 4)} className="py-4 text-center text-gray-500">
                      No {activeTab} found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Admin</h2>
            {createError && <div className="mb-4 text-red-500 text-sm">{createError}</div>}
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
