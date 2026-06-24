import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { runEligibility, type EligibilityResults } from '@/lib/claims/eligibility';
import { Profile } from '@/lib/schemas/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<EligibilityResults | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate({ to: '/login' });
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data as Profile);
      const eligibility = runEligibility(data as Profile);
      setResults(eligibility);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading your dashboard...</div>;
  }

  const totalWeekly = results?.totalWeekly || 0;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600">Welcome back</h1>
        <p className="text-gray-600 mt-1">ClaimCompass</p>
      </div>

      {totalWeekly > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-blue-600 font-medium">You could be receiving</p>
            <p className="text-6xl font-bold text-blue-600 mt-1">£{totalWeekly}</p>
            <p className="text-sm text-gray-500">per week in benefits</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate({ to: '/_authenticated/check-benefits' })}
          className="h-28 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700"
        >
          <span className="text-3xl mb-1">✅</span>
          <span>Check Benefits</span>
        </Button>

        <Button 
          onClick={() => navigate({ to: '/_authenticated/conversational' })}
          className="h-28 flex flex-col items-center justify-center border-2 border-gray-200 hover:bg-gray-50"
          variant="outline"
        >
          <span className="text-3xl mb-1">💬</span>
          <span>Talk to AI</span>
        </Button>
      </div>

      <div className="text-center text-xs text-gray-500 pt-8">
        Your data is secure • We monitor government changes daily
      </div>
    </div>
  );
}