'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { apiClient } from '@/shared/lib/axios';

export const ProfileForm = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      // Gọi User Service (Phase 4)
      const res = await apiClient.patch('/users/me', formData);
      updateUser(formData);
      setMessage('Profile updated successfully');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="p-4 text-gray-500">Loading profile...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            value={user.email} 
            disabled
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed" 
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text" 
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input 
            type="tel" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mt-1">
            {user.role}
          </span>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
