import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runEligibility, type EligibilityResults } from "@/lib/claims/eligibility";
import { Profile } from "@/lib/schemas/profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<EligibilityResults | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setResults(runEligibility(data as Profile));
      }
    };

    fetchData();
  }, [user]);

  const likelyCount = results?.likely?.length || 0;
  const totalWeekly = results?.totalWeekly || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Likely Eligible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{likelyCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Weekly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">£{totalWeekly}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-lg">
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="font-semibold">Check My Benefits</p>
              <p className="text-sm text-muted-foreground">
                See exactly what you’re eligible for
              </p>
            </div>
            <Button asChild>
              <Link to="/check-benefits">Check Eligibility</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="font-semibold">Talk to AI Assistant</p>
              <p className="text-sm text-muted-foreground">
                Update your details or ask questions
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/conversational">Start Conversation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}