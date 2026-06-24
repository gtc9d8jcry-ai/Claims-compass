import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BENEFITS } from "@/data/benefits";
import { STAGE_LABELS } from "@/data/application-forms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/applications/")({
  component: Applications,
});

function Applications() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Record<string, { status: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("application_forms")
      .select("benefit_id, status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<string, { status: string }> = {};
        (data ?? []).forEach((r) => {
          map[r.benefit_id] = { status: r.status };
        });
        setForms(map);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application forms</h1>
        <p className="text-muted-foreground">
          A complete form for every benefit. Pick one to fill in.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((b) => {
          const f = forms[b.id];
          return (
            <Card key={b.id}>
              <CardContent className="flex h-full flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{b.name}</h2>
                  {f && <Badge variant="outline">{STAGE_LABELS[f.status] ?? f.status}</Badge>}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{b.summary}</p>
                <Button asChild className="w-full">
                  <Link
                    to="/_authenticated/applications/$benefitId"
                    params={{ benefitId: b.id }}
                  >
                    {f ? "Continue application" : "Start application"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}