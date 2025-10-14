'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { syncUsersFromServer } from '@/lib/db/sync';
import type { User } from '@/lib/types';
import { CardGrid } from '@/components/features/CardGrid';

export default function UserCollectionPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const users = await syncUsersFromServer();
        const foundUser = users.find(u => u.id === params.userId);
        
        if (!foundUser) {
          setError('User not found');
          // Redirect to home after a brief delay
          setTimeout(() => router.push('/'), 2000);
        } else {
          setUser(foundUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [params.userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'User not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Redirecting to user selection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}&apos;s Collection</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back!</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Switch User
          </button>
        </div>

        <CardGrid userId={user.id} />
      </div>
    </div>
  );
}
