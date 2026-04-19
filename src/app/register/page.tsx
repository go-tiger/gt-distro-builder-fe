'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', { username, password });
      router.push('/login?message=가입이 완료되었습니다. 로그인해주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700'>
          <h1 className='text-3xl font-bold text-center text-white mb-8'>회원가입</h1>

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
                placeholder='6자 이상의 비밀번호'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>비밀번호 확인</label>
              <input
                type='password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                placeholder='비밀번호를 다시 입력하세요'
                required
              />
            </div>

            {error && <div className='bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded'>{error}</div>}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition duration-200'
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className='mt-4 text-center text-slate-400'>
            이미 계정이 있으신가요?{' '}
            <a href='/login' className='text-blue-400 hover:text-blue-300'>
              로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
