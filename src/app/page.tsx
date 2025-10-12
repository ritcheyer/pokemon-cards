'use client';

import { useEffect, useState } from 'react';
import { syncUsersFromServer, createUser } from '@/lib/db/sync';
import type { User } from '@/lib/types';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load users on mount
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedUsers = await syncUsersFromServer();
      setUsers(loadedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const user = await createUser(newUserName.trim());
      setUsers([...users, user]);
      setNewUserName('');
      setShowCreateUser(false);
      // Auto-select the newly created user
      setSelectedUser(user);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    // TODO: Navigate to collection page in Phase 2
  };

  // User selection screen
  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pokemon Card Collection</h1>
            <p className="text-gray-600">Select your profile to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No users yet. Create your first profile!</p>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">Tap to view collection</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Add New Profile
                  </button>
                </>
              )}
            </div>
          )}

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">Create New Profile</h2>
                <form onSubmit={handleCreateUser}>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Name</span>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                      disabled={loading}
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateUser(false);
                        setNewUserName('');
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !newUserName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Placeholder for collection view (Phase 2)
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedUser.name}'s Collection</h1>
              <p className="text-gray-600">Welcome back!</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Switch User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Collection view coming in Phase 2!</p>
          <p className="text-sm text-gray-500">✓ User selection working</p>
          <p className="text-sm text-gray-500">✓ User creation working</p>
          <p className="text-sm text-gray-500">✓ Phase 1 complete!</p>
        </div>
      </div>
    </div>
  );
}
