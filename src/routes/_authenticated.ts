import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: '/login' });
        return;
      }
      setUser(user);
      setLoading(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) {
        navigate({ to: '/login' });
      } else {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ClaimCompass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-safe">
      {/* Top Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow">
              CC
            </div>
            <div>
              <h1 className="font-semibold text-2xl tracking-tight text-gray-900">ClaimCompass</h1>
              <p className="text-[10px] text-gray-500 -mt-1">UK Benefits Assistant</p>
            </div>
          </div>

          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: '/login' }))}
            className="text-sm px-4 py-2 text-gray-600 hover:text-red-600 active:bg-gray-100 rounded-xl transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content - Responsive Padding */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 pt-6 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-1px_4px_rgb(0,0,0,0.1)] safe-area-bottom">
        <div className="max-w-2xl mx-auto flex justify-around items-center py-3 px-2">
          <a href="/_authenticated/dashboard" className="flex flex-col items-center justify-center flex-1 text-blue-600 active:opacity-70">
            <span className="text-3xl">🏠</span>
            <span className="text-[10px] font-medium mt-1">Home</span>
          </a>
          <a href="/_authenticated/check-benefits" className="flex flex-col items-center justify-center flex-1 text-gray-500 active:opacity-70">
            <span className="text-3xl">✅</span>
            <span className="text-[10px] font-medium mt-1">Benefits</span>
          </a>
          <a href="/_authenticated/conversational" className="flex flex-col items-center justify-center flex-1 text-gray-500 active:opacity-70">
            <span className="text-3xl">💬</span>
            <span className="text-[10px] font-medium mt-1">AI</span>
          </a>
          <a href="/_authenticated/profile" className="flex flex-col items-center justify-center flex-1 text-gray-500 active:opacity-70">
            <span className="text-3xl">👤</span>
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}