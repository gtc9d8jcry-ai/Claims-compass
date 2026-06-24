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
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/evidence")({
  component: Evidence,
});

type Doc = {
  id: string;
  title: string;
  doc_type: string | null;
  notes: string | null;
};

function Evidence() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [form, setForm] = useState({
    title: "",
    doc_type: "",
    notes: "",
  });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("evidence_documents")
      .select("id, title, doc_type, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setDocs((data ?? []) as Doc[]);
  };

  useEffect(() => {
    load();
  }, [user]);

  const add = async () => {
    if (!user || !form.title.trim()) {
      return toast.error("Please give it a title");
    }

    const { error } = await supabase.from("evidence_documents").insert({
      user_id: user.id,
      title: form.title.trim(),
      doc_type: form.doc_type || null,
      notes: form.notes || null,
    });

    if (error) return toast.error(error.message);

    setForm({ title: "", doc_type: "", notes: "" });
    toast.success("Evidence added");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("evidence_documents").delete().eq("id", id);
    toast.success("Evidence deleted");
    load();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evidence Vault</h1>
        <p className="text-muted-foreground">
          Keep track of documents and proof you’ll need for your claims.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add new evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Tenancy agreement"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Type (optional)</Label>
            <Input
              value={form.doc_type}
              onChange={(e) => setForm((f) => ({ ...f, doc_type: e.target.value }))}
              placeholder="e.g. Proof of rent, Medical letter, ID"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any extra details..."
            />
          </div>

          <Button onClick={add}>Add to vault</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {docs.length === 0 && (
          <p className="text-sm text-muted-foreground">No evidence saved yet.</p>
        )}

        {docs.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-semibold">{doc.title}</p>
                {doc.doc_type && (
                  <p className="text-sm text-muted-foreground">{doc.doc_type}</p>
                )}
                {doc.notes && <p className="mt-1 text-sm">{doc.notes}</p>}
              </div>

              <Button variant="ghost" size="icon" onClick={() => remove(doc.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}