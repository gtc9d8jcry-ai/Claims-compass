import { Outlet, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export default function AuthenticatedLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ClaimCompass</h1>
        <div className="text-sm text-gray-500 truncate max-w-[160px]">
          {user?.email}
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-2xl mx-auto">
        <div className="flex justify-around py-3">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center text-xs text-gray-600 active:text-blue-600"
            activeProps={{ className: "text-blue-600 font-medium" }}
          >
            🏠<span className="mt-0.5">Home</span>
          </Link>
          <Link 
            to="/check-benefits" 
            className="flex flex-col items-center text-xs text-gray-600 active:text-blue-600"
            activeProps={{ className: "text-blue-600 font-medium" }}
          >
            ✅<span className="mt-0.5">Check</span>
          </Link>
          <Link 
            to="/conversational" 
            className="flex flex-col items-center text-xs text-gray-600 active:text-blue-600"
            activeProps={{ className: "text-blue-600 font-medium" }}
          >
            💬<span className="mt-0.5">AI</span>
          </Link>
          <Link 
            to="/profile" 
            className="flex flex-col items-center text-xs text-gray-600 active:text-blue-600"
            activeProps={{ className: "text-blue-600 font-medium" }}
          >
            👤<span className="mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}