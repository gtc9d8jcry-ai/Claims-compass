import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/schemas/profile';
import { BENEFITS, Benefit } from '@/data/benefits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/check-benefits')({
  component: CheckBenefitsPage,
});

function CheckBenefitsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
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

      if (data) setProfile(data as Profile);
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  // Simple eligibility check (we can make this smarter later)
  const getEligibility = (benefit: Benefit) => {
    if (!profile) return 'possible';

    const lowerIncome = (profile.income || 0) < 2500;
    const hasDisability = profile.hasDisability === true;
    const needsCare = profile.needsCare === true;
    const isCaring = profile.isCaring === true;
    const over66 = profile.age && profile.age >= 66;

    if (benefit.id === 'universal-credit' && lowerIncome) return 'likely';
    if (benefit.id === 'pip' && hasDisability) return 'likely';
    if (benefit.id === 'attendance-allowance' && over66 && needsCare) return 'likely';
    if (benefit.id === 'carers-allowance' && isCaring) return 'likely';
    if (benefit.id === 'pension-credit' && over66 && lowerIncome) return 'likely';

    return 'possible';
  };

  if (loading) {
    return <div className="p-8 text-center">Checking your eligibility...</div>;
  }

  const likelyBenefits = BENEFITS.filter(b => getEligibility(b) === 'likely');
  const possibleBenefits = BENEFITS.filter(b => getEligibility(b) === 'possible');

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Your Benefits Check</h1>
        <p className="text-gray-600 mt-1">Based on the information in your profile</p>
      </div>

      {/* Likely Eligible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Likely Eligible ({likelyBenefits.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {likelyBenefits.length > 0 ? (
            likelyBenefits.map((benefit) => (
              <div
                key={benefit.id}
                onClick={() => navigate({ to: `/applications/${benefit.id}` })}
                className="benefit-card p-5 border border-green-200 bg-green-50 rounded-3xl cursor-pointer active:scale-[0.985]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-xl">{benefit.name}</div>
                    {benefit.weeklyAmount && (
                      <div className="text-green-700 font-medium">~£{benefit.weeklyAmount}/week</div>
                    )}
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{benefit.eligibilitySummary}</p>
                <div className="text-xs text-blue-600 mt-3 font-medium">Tap to start application →</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No strong matches yet. Add more details to your profile.</p>
          )}
        </CardContent>
      </Card>

      {/* Possibly Eligible */}
      {possibleBenefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Possibly Eligible ({possibleBenefits.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {possibleBenefits.map((benefit) => (
              <div
                key={benefit.id}
                onClick={() => navigate({ to: `/applications/${benefit.id}` })}
                className="benefit-card p-5 border rounded-3xl cursor-pointer active:scale-[0.985]"
              >
                <div className="font-semibold">{benefit.name}</div>
                <p className="text-sm text-gray-600 mt-1">{benefit.eligibilitySummary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-gray-500 pt-4">
        Results are estimates • Update your profile for better accuracy
      </div>
    </div>
  );
}