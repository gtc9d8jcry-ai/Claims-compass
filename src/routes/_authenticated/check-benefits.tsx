import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runEligibility, type EligibilityResults } from "@/lib/claims/eligibility";
import { Profile } from "@/lib/schemas/profile";

export const Route = createFileRoute("/_authenticated/check-benefits")({
  component: CheckBenefitsPage,
});

function CheckBenefitsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<EligibilityResults | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndCheck = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setResults(runEligibility(data as Profile));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndCheck();
  }, [user]);

  if (loading || !results) {
    return <p className="text-muted-foreground">Checking your eligibility…</p>;
  }

  const { likely, possible, unlikely, totalWeekly } = results;

  const handleBenefitClick = (benefitName: string) => {
    // Map benefit names to their route IDs
    const benefitRoutes: Record<string, string> = {
      "Universal Credit": "universal-credit",
      "Personal Independence Payment": "pip",
      "Attendance Allowance": "attendance-allowance",
      "Carer's Allowance": "carers-allowance",
      "Pension Credit": "pension-credit",
      "Housing Benefit": "housing-benefit",
      "Council Tax Reduction": "council-tax-reduction",
    };

    const routeId = benefitRoutes[benefitName] || benefitName.toLowerCase().replace(/\s+/g, "-");
    navigate({ to: "/_authenticated/applications/$benefitId", params: { benefitId: routeId } });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Benefit Check</h1>
        <Button variant="outline" onClick={fetchProfileAndCheck}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Likely Eligible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {likely.length > 0 ? (
            likely.map((item, i) => (
              <div
                key={i}
                onClick={() => handleBenefitClick(item.benefit)}
                className="rounded-xl border border-border/60 p-4 cursor-pointer active:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.benefit}</span>
                  <span className="text-sm font-medium text-primary">
                    ~£{item.weeklyAmount || 0}/week
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                <p className="mt-2 text-xs text-blue-600 font-medium">Tap to start application →</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No strong matches found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Possibly Eligible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {possible.length > 0 ? (
            possible.map((item, i) => (
              <div
                key={i}
                onClick={() => handleBenefitClick(item.benefit)}
                className="rounded-xl border border-border/60 p-4 cursor-pointer active:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.benefit}</span>
                  <span className="text-sm text-muted-foreground">~£{item.weeklyAmount || 0}/week</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No possible matches.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unlikely</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {unlikely.length} benefits checked and unlikely based on current information.
          </p>
        </CardContent>
      </Card>

      {totalWeekly > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Estimated weekly total
            </p>
            <p className="mt-1 text-4xl font-bold text-primary">£{totalWeekly}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}