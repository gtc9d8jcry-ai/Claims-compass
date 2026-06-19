import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { runEligibility } from '@/lib/claims/eligibility';
import { Profile } from '@/lib/schemas/profile';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        const eligibilityResults = runEligibility(profileData as Profile);
        setResults(eligibilityResults);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-600">Here's your benefits overview</p>
      </div>

      {/* Quick Stats */}
      {results && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Likely eligible</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{results.likely.length}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Est. weekly total</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">£{results.totalWeekly}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <button
          onClick={() => navigate({ to: '/_authenticated/check-benefits' })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 text-left flex items-center justify-between active:scale-[0.985] transition-transform"
        >
          <div>
            <div className="font-semibold text-lg">Check My Benefits</div>
            <div className="text-blue-100 text-sm mt-1">See full eligibility breakdown</div>
          </div>
          <div className="text-3xl">✅</div>
        </button>

        <button
          onClick={() => navigate({ to: '/_authenticated/conversational' })}
          className="w-full bg-white border hover:bg-gray-50 rounded-2xl p-6 text-left flex items-center justify-between active:scale-[0.985] transition-transform"
        >
          <div>
            <div className="font-semibold text-lg">Talk to AI Assistant</div>
            <div className="text-gray-500 text-sm mt-1">Update your details conversationally</div>
          </div>
          <div className="text-3xl">💬</div>
        </button>
      </div>

      {/* Helpful note */}
      <div className="mt-8 text-center text-xs text-gray-500">
        Keep your profile up to date — new benefits can appear when rules change.
      </div>
    </div>
  );
}
