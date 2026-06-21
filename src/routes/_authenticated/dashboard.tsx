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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate({ to: '/login' });
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          setError('Failed to load profile');
        } else if (profileData) {
          setProfile(profileData as Profile);
          const eligibilityResults = runEligibility(profileData as Profile);
          setResults(eligibilityResults);
        } else {
          // No profile yet → nudge to onboarding
          navigate({ to: '/_authenticated/onboarding' });
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-600">Your benefits overview • Updated just now</p>
      </div>

      {/* Quick Stats */}
      {results && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-green-100 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Likely Eligible</p>
            <p className="text-5xl font-bold text-green-600 mt-2">{results.likely?.length || 0}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Est. Weekly</p>
            <p className="text-5xl font-bold text-blue-600 mt-2">£{results.totalWeekly || 0}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <button
          onClick={() => navigate({ to: '/_authenticated/check-benefits' })}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-3xl p-6 text-left flex items-center justify-between active:scale-[0.985] transition-all"
        >
          <div>
            <div className="font-semibold text-xl">Check My Benefits</div>
            <div className="text-blue-100 text-sm mt-1">Full eligibility breakdown</div>
          </div>
          <div className="text-4xl">✅</div>
        </button>

        <button
          onClick={() => navigate({ to: '/_authenticated/conversational' })}
          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-3xl p-6 text-left flex items-center justify-between active:scale-[0.985] transition-all"
        >
          <div>
            <div className="font-semibold text-xl">Talk to AI Assistant</div>
            <div className="text-gray-500 text-sm mt-1">Update details or ask questions</div>
          </div>
          <div className="text-4xl">💬</div>
        </button>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500">
        Your data is private • We monitor benefit changes daily
      </div>
    </div>
  );
}