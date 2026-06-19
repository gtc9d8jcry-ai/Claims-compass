import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase'; // Adjust path if your supabase client is elsewhere
import { runEligibility, EligibilityResults } from '@/lib/claims/eligibility';
import { Profile } from '@/lib/schemas/profile';

export const Route = createFileRoute('/_authenticated/check-benefits')({
  component: CheckBenefits,
});

function CheckBenefits() {
  const [results, setResults] = useState<EligibilityResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to check your benefits');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        setError('Please complete your profile first');
        setLoading(false);
        return;
      }

      const eligibilityResults = runEligibility(profileData as Profile);
      setResults(eligibilityResults);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCheck();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking your benefits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchAndCheck}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Benefits Check</h1>
        <button 
          onClick={fetchAndCheck}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Refresh
        </button>
      </div>

      {/* Total Weekly Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
        <p className="text-sm text-blue-700 mb-1">Estimated weekly total</p>
        <p className="text-4xl font-bold text-blue-900">£{results.totalWeekly}</p>
        <p className="text-xs text-blue-600 mt-1">From likely + possible benefits</p>
      </div>

      {/* Likely Eligible */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h2 className="font-semibold text-lg">Likely Eligible ({results.likely.length})</h2>
        </div>
        
        {results.likely.length > 0 ? (
          <div className="space-y-3">
            {results.likely.map((benefit, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{benefit.benefit}</h3>
                    <p className="text-sm text-gray-600 mt-1">{benefit.reason}</p>
                  </div>
                  {benefit.weeklyAmount && (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-700">£{benefit.weeklyAmount}</p>
                      <p className="text-xs text-gray-500">per week</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No likely eligible benefits found yet.</p>
        )}
      </div>

      {/* Possible */}
      {results.possible.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <h2 className="font-semibold text-lg">Possible ({results.possible.length})</h2>
          </div>
          <div className="space-y-3">
            {results.possible.map((benefit, index) => (
              <div key={index} className="bg-white border border-amber-200 rounded-xl p-4">
                <h3 className="font-medium">{benefit.benefit}</h3>
                <p className="text-sm text-gray-600 mt-1">{benefit.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlikely Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          {results.unlikely.length} benefits checked as unlikely based on your current information.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Update your profile if your circumstances change — new opportunities may appear.
        </p>
      </div>
    </div>
  );
}
