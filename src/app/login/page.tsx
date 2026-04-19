'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      auth.setToken(response.access_token);
      router.push('/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700'>
          <h1 className='text-3xl font-bold text-center text-white mb-8'>Distro Builder</h1>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>사용자명</label>
              <input
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                placeholder='사용자명을 입력하세요'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>비밀번호</label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                placeholder='비밀번호를 입력하세요'
                required
              />
            </div>

            {error && <div className='bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded'>{error}</div>}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition duration-200'
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className='mt-4 text-center text-slate-400'>
            계정이 없으신가요?{' '}
            <a href='/register' className='text-blue-400 hover:text-blue-300'>
              회원가입
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
