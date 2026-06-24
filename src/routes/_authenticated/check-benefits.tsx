import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { runEligibility, type EligibilityResults } from '@/lib/claims/eligibility';
import { Profile } from '@/lib/schemas/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/check-benefits')({
  component: CheckBenefitsPage,
});

function CheckBenefitsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<EligibilityResults | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndCheck = async () => {
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
      const eligibilityResults = runEligibility(data as Profile);
      setResults(eligibilityResults);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndCheck();
  }, []);

  if (loading || !results) {
    return <div className="p-8 text-center">Checking your eligibility across all benefits...</div>;
  }

  const { likely, possible, unlikely, totalWeekly } = results;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Your Benefits Check</h1>
        <Button onClick={fetchProfileAndCheck} variant="outline">Refresh</Button>
      </div>

      {totalWeekly > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-blue-600 font-medium">Potential weekly support</p>
            <p className="text-5xl font-bold text-blue-600">£{totalWeekly}</p>
          </CardContent>
        </Card>
      )}

      {/* Likely Eligible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Likely Eligible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {likely.length > 0 ? (
            likely.map((item: any, i: number) => (
              <div
                key={i}
                onClick={() => navigate({ to: `/applications/${item.id || item.benefit.toLowerCase().replace(/\s+/g, '-')}` })}
                className="bg-white border border-green-200 rounded-3xl p-6 cursor-pointer active:scale-[0.985] transition-all hover:shadow-md"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-xl">{item.benefit}</div>
                    <div className="text-green-600">~£{item.weeklyAmount || item.weekly}/week</div>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{item.reason}</p>
                <div className="text-xs text-blue-600 mt-4 font-medium">Tap to start / continue application →</div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No strong matches at this time.</p>
          )}
        </CardContent>
      </Card>

      {/* Possibly Eligible */}
      {possible.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Possibly Eligible</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {possible.map((item: any, i: number) => (
              <div key={i} className="p-4 border rounded-2xl">
                <span className="font-medium">{item.benefit}</span> — {item.reason}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-gray-500 pt-4">
        Results based on your profile • We monitor for policy changes daily
      </div>
    </div>
  );
}