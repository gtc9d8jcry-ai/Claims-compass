import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate({ to: '/login' });
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) navigate({ to: '/login' });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">CC</div>
          <div>
            <h1 className="font-semibold text-2xl">ClaimCompass</h1>
            <p className="text-xs text-gray-500">Benefits & Claims</p>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: '/login' }))} className="text-sm text-gray-500">Sign out</button>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="max-w-2xl mx-auto flex justify-around py-3">
          <a href="/_authenticated/dashboard" className="flex flex-col items-center text-blue-600">🏠<span className="text-xs">Home</span></a>
          <a href="/_authenticated/check-benefits" className="flex flex-col items-center text-gray-500">✅<span className="text-xs">Benefits</span></a>
          <a href="/_authenticated/conversational" className="flex flex-col items-center text-gray-500">💬<span className="text-xs">AI</span></a>
          <a href="/_authenticated/profile" className="flex flex-col items-center text-gray-500">👤<span className="text-xs">Profile</span></a>
        </div>
      </nav>
    </div>
  );
}