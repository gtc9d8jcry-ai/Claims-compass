import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { runEligibility } from '@/lib/claims/eligibility';
import { Profile } from '@/lib/schemas/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/check-benefits')({
  component: CheckBenefits,
});

function CheckBenefits() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setResults(runEligibility(data));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Checking your eligibility across all benefits...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Your Benefits Eligibility</h1>

      {results && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Likely Eligible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-green-600">{results.likely?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Est. Weekly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-blue-600">£{results.totalWeekly || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {results.likely?.map((b: any) => (
              <Card key={b.id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{b.description}</p>
                  {b.weeklyAmount && <p className="text-green-600 font-medium mt-3">≈ £{b.weeklyAmount} per week</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="text-center text-xs text-gray-500 pt-4">
        Results based on your profile • We monitor policy changes daily
      </div>
    </div>
  );
}