import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/appeals")({
  component: Appeals,
});

type Appeal = {
  id: string;
  benefit_name: string;
  decision_date: string | null;
  grounds: string | null;
  generated_letter: string | null;
  status: string;
};

function Appeals() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [form, setForm] = useState({
    benefit_name: "",
    decision_date: "",
    grounds: "",
    generated_letter: "",
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appeals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setAppeals((data ?? []) as Appeal[]);
  };

  useEffect(() => {
    load();
  }, [user]);

  const generateLetter = async () => {
    if (!form.benefit_name || !form.grounds) {
      return toast.error("Please enter benefit name and grounds first");
    }

    setBusy(true);
    try {
      // This calls the AI function (we'll improve this later)
      const response = await fetch("/api/generate-appeal-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          benefit_name: form.benefit_name,
          decision_date: form.decision_date,
          grounds: form.grounds,
        }),
      });

      const data = await response.json();
      if (data.letter) {
        setForm((f) => ({ ...f, generated_letter: data.letter }));
        toast.success("AI draft generated");
      } else {
        toast.error("Could not generate letter");
      }
    } catch (e) {
      toast.error("AI generation failed");
    }
    setBusy(false);
  };

  const saveAppeal = async () => {
    if (!user || !form.benefit_name.trim()) {
      return toast.error("Benefit name is required");
    }

    const { error } = await supabase.from("appeals").insert({
      user_id: user.id,
      benefit_name: form.benefit_name.trim(),
      decision_date: form.decision_date || null,
      grounds: form.grounds || null,
      generated_letter: form.generated_letter || null,
      status: "draft",
    });

    if (error) return toast.error(error.message);

    setForm({ benefit_name: "", decision_date: "", grounds: "", generated_letter: "" });
    toast.success("Appeal saved");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("appeals").delete().eq("id", id);
    toast.success("Appeal deleted");
    load();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appeals</h1>
        <p className="text-muted-foreground">
          Create and track benefit appeals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create new appeal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label>Benefit name</Label>
            <Input
              value={form.benefit_name}
              onChange={(e) => setForm((f) => ({ ...f, benefit_name: e.target.value }))}
              placeholder="e.g. Personal Independence Payment"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Decision date (optional)</Label>
            <Input
              type="date"
              value={form.decision_date}
              onChange={(e) => setForm((f) => ({ ...f, decision_date: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Why is the decision wrong?</Label>
            <Textarea
              rows={4}
              value={form.grounds}
              onChange={(e) => setForm((f) => ({ ...f, grounds: e.target.value }))}
            />
          </div>

          <Button onClick={generateLetter} disabled={busy} variant="secondary">
            <Sparkles className="mr-1 h-4 w-4" />
            {busy ? "Drafting…" : "Draft letter with AI"}
          </Button>

          {form.generated_letter && (
            <div className="flex flex-col gap-1.5">
              <Label>Draft letter (edit as needed)</Label>
              <Textarea
                rows={12}
                value={form.generated_letter}
                onChange={(e) => setForm((f) => ({ ...f, generated_letter: e.target.value }))}
              />
            </div>
          )}

          <Button onClick={saveAppeal}>Save appeal</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {appeals.length === 0 && (
          <p className="text-sm text-muted-foreground">No appeals yet.</p>
        )}

        {appeals.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-semibold">{a.benefit_name}</p>
                {a.grounds && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.grounds}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}