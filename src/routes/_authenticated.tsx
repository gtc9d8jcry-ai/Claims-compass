import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export default function AuthenticatedLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(currentUser);
        setLoading(false);
        if (!currentUser) {
          navigate({ to: '/login' });
        }
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          if (!session?.user) {
            navigate({ to: '/login' });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">ClaimCompass</h1>
        <div className="text-sm text-gray-500 truncate max-w-[180px]">
          {user?.email || 'User'}
        </div>
      </div>

      <main className="max-w-2xl mx-auto pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-2xl mx-auto">
        <div className="flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-xs text-gray-600 hover:text-blue-600" activeProps={{ className: "text-blue-600 font-medium" }}>🏠 Home</Link>
          <Link to="/check-benefits" className="flex flex-col items-center text-xs text-gray-600 hover:text-blue-600" activeProps={{ className: "text-blue-600 font-medium" }}>✅ Check</Link>
          <Link to="/conversational" className="flex flex-col items-center text-xs text-gray-600 hover:text-blue-600" activeProps={{ className: "text-blue-600 font-medium" }}>💬 AI</Link>
          <Link to="/profile" className="flex flex-col items-center text-xs text-gray-600 hover:text-blue-600" activeProps={{ className: "text-blue-600 font-medium" }}>👤 Profile</Link>
        </div>
      </nav>
    </div>
  );
}