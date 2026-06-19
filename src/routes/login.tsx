import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: '/_authenticated/dashboard' });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email to confirm your account, then log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">CC</span>
          </div>
          <h1 className="text-3xl font-semibold">ClaimCompass</h1>
          <p className="text-gray-600 mt-2">Find every benefit you're entitled to</p>
        </div>

        <div className="bg-white rounded-3xl shadow p-8">
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 font-medium ${isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Log in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 font-medium ${!isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              required
            />

            {message && (
              <p className="text-sm text-center text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
