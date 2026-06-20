import { Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthenticatedLayout() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ClaimCompass</h1>
        <div className="text-sm text-gray-500">{user?.email}</div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-2xl mx-auto">
        <div className="flex justify-around py-2">
          <a href="/dashboard" className="flex flex-col items-center text-xs text-gray-600">
            🏠 Home
          </a>
          <a href="/check-benefits" className="flex flex-col items-center text-xs text-blue-600 font-medium">
            ✅ Check
          </a>
          <a href="/conversational" className="flex flex-col items-center text-xs text-gray-600">
            💬 AI
          </a>
          <a href="/profile" className="flex flex-col items-center text-xs text-gray-600">
            👤 Profile
          </a>
        </div>
      </div>
    </div>
  );
}
