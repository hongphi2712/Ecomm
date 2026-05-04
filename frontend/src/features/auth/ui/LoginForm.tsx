'use client';
import { useState } from 'react';
import { useAuthStore } from '../model/auth.store';
import { apiClient } from '@/shared/lib/axios';
import { ApiResponse } from '@/shared/types/api';
import { User } from '@/shared/types/auth';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await apiClient.post<ApiResponse<{ accessToken: string, refreshToken: string, user: User }>>('/auth/login', {
        email,
        password
      });
      
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      // Giả lập redirect, trong thực tế dùng useRouter của next/navigation
      window.location.href = '/profile';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Please sign in to your account</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
          placeholder="you@example.com"
          required 
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
        </div>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
          placeholder="••••••••"
          required 
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account? <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign up</a>
      </p>
    </form>
  );
};
