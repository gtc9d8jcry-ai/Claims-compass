import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getBenefit } from "@/data/benefits";
import { getBenefitForm, prefillFromProfile, PROFILE_FORM_KEYS, validateApplication, STAGE_LABELS, SUBMISSION_STAGES, type FormField, type ValidationError } from "@/data/application-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, CheckCircle2, AlertTriangle, Clock, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/applications/$benefitId")({
  component: ApplicationForm,
});

const PROFILE_LABELS: Record<string, string> = {
  full_name: "Full name",
  date_of_birth: "Date of birth",
  gender: "Gender",
  ni_number: "NI number",
  phone: "Phone",
  email: "Email",
  address_line1: "Address",
  address_line2: "Address line 2",
  town: "Town",
  postcode: "Postcode",
  nationality: "Nationality",
  immigration_status: "Immigration status",
  bank_account_name: "Bank account name",
  bank_sort_code: "Sort code",
  bank_account_number: "Account number",
};

function ApplicationForm() {
  const { benefitId } = useParams({ from: "/_authenticated/applications/$benefitId" });
  const { user } = useAuth();
  const benefit = getBenefit(benefitId);
  const sections = getBenefitForm(benefitId);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [autoFilledKeys, setAutoFilledKeys] = useState<string[]>([]);
  const [showAutoFilled, setShowAutoFilled] = useState(false);
  const [status, setStatus] = useState("in_progress");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("application_forms").select("*").eq("user_id", user.id).eq("benefit_id", benefitId).maybeSingle(),
      supabase.from("application_events").select("*").eq("user_id", user.id).eq("benefit_id", benefitId).order("created_at", { ascending: false }),
    ]).then(([p, f, e]) => {
      const prof = p.data ?? {};
      setProfile(prof);

      const existing = (f.data?.answers as Record<string, any>) ?? {};
      const { answers: prefilled, autoFilledKeys: filled } = prefillFromProfile(benefitId, prof, existing);
      setAnswers(prefilled);
      setAutoFilledKeys(filled);

      if (f.data) setStatus(f.data.status);
      setEvents(e.data ?? []);
      setLoading(false);
    });
  }, [user, benefitId]);

  const set = (k: string, v: any) => setAnswers((a) => ({ ...a, [k]: v }));

  const refreshEvents = async () => {
    if (!user) return;
    const { data } = await supabase.from("application_events").select("*").eq("user_id", user.id).eq("benefit_id", benefitId).order("created_at", { ascending: false });
    setEvents(data ?? []);
  };

  const save = async (newStatus?: string) => {
    if (!user || !benefit) return;
    const finalStatus = newStatus ?? status;

    const { error } = await supabase.from("application_forms").upsert(
      { user_id: user.id, benefit_id: benefit.id, benefit_name: benefit.name, status: finalStatus, answers },
      { onConflict: "user_id,benefit_id" }
    );

    if (error) return toast.error(error.message);
    setStatus(finalStatus);
    toast.success(newStatus === "ready" ? "Marked ready to submit" : "Application saved");
  };

  const runCheck = (): ValidationError[] => {
    const found = validateApplication(benefitId, profile, answers);
    setErrors(found);
    if (found.length === 0) toast.success("No errors found — ready to submit");
    else toast.error(`${found.length} thing${found.length > 1 ? "s" : ""} to fix before submitting`);
    return found;
  };

  const submit = async () => {
    if (!user || !benefit) return;
    const found = runCheck();
    if (found.length > 0) return;

    setSubmitting(true);

    const { error } = await supabase.from("application_forms").upsert(
      { user_id: user.id, benefit_id: benefit.id, benefit_name: benefit.name, status: "submitted", answers, submitted_at: new Date().toISOString() },
      { onConflict: "user_id,benefit_id" }
    );

    if (!error) {
      await supabase.from("application_events").insert({
        user_id: user.id,
        benefit_id: benefit.id,
        status: "submitted",
        note: "Application checked and submitted.",
      });
      setStatus("submitted");
      await refreshEvents();
      toast.success("Application submitted");
    } else {
      toast.error(error.message);
    }
    setSubmitting(false);
  };

  const advance = async (stage: string, note: string) => {
    if (!user || !benefit) return;

    await supabase.from("application_forms").update({ status: stage }).eq("user_id", user.id).eq("benefit_id", benefit.id);
    await supabase.from("application_events").insert({ user_id: user.id, benefit_id: benefit.id, status: stage, note });
    setStatus(stage);
    await refreshEvents();
    toast.success(`Updated: ${STAGE_LABELS[stage]}`);
  };

  if (!benefit) return <p className="text-muted-foreground">Benefit not found.</p>;
  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  const missingProfile = PROFILE_FORM_KEYS.filter((k) => !profile[k]);
  const submitted = ["submitted", "acknowledged", "in_review", "decision"].includes(status);
  const stageIndex = SUBMISSION_STAGES.indexOf(status as any);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/applications"><ArrowLeft className="mr-1 h-4 w-4" /> All applications</Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold">{benefit.name}</h1>
        <p className="text-muted-foreground">{benefit.summary}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Your details (from your profile)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {PROFILE_FORM_KEYS.map((k) => (
              <div key={k} className="text-sm">
                <span className="text-muted-foreground">{PROFILE_LABELS[k]}: </span>
                <span className="font-medium">{profile[k] ? String(profile[k]) : "—"}</span>
              </div>
            ))}
          </div>
          {missingProfile.length > 0 && (
            <p className="rounded-lg bg-accent/40 p-3 text-sm">
              Some details are missing. <Link to="/profile" className="font-semibold underline">Complete them here</Link>
            </p>
          )}
        </CardContent>
      </Card>

      {autoFilledKeys.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          We pre-filled {autoFilledKeys.length} field{autoFilledKeys.length > 1 ? "s" : ""} from your profile.
          <button type="button" className="font-semibold text-primary underline" onClick={() => setShowAutoFilled((s) => !s)}>
            {showAutoFilled ? "Hide pre-filled" : "Review pre-filled"}
          </button>
        </p>
      )}

      {sections.map((section) => {
        const visibleFields = section.fields.filter((f) => showAutoFilled || !autoFilledKeys.includes(f.key));
        if (visibleFields.length === 0) return null;

        return (
          <Card key={section.title}>
            <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {visibleFields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={answers[field.key]}
                  onChange={(v) => set(field.key, v)}
                  autoFilled={autoFilledKeys.includes(field.key)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {errors && errors.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Fix these before submitting</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {errors.map((e, i) => (
              <p key={i} className="text-sm">
                <span className="font-medium">{e.where === "profile" ? "Your details" : "This form"}:</span> {e.message}
                {e.where === "profile" && <Link to="/profile" className="ml-1 underline">Fix</Link>}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => save()} size="lg" variant="outline">Save progress</Button>
          <Button onClick={runCheck} size="lg" variant="secondary">Check for errors</Button>
          <Button onClick={submit} size="lg" disabled={submitting}>
            <Send className="mr-1 h-4 w-4" /> {submitting ? "Submitting…" : "Check & submit"}
          </Button>
        </div>
      )}

      {(submitted || events.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {SUBMISSION_STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${i <= stageIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i <= stageIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {STAGE_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-l-2 border-border/60 pl-4">
              {events.map((ev) => (
                <div key={ev.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm font-medium">{STAGE_LABELS[ev.status] ?? ev.status}</p>
                  {ev.note && <p className="text-sm text-muted-foreground">{ev.note}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString("en-GB")}</p>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" size="sm">
              <a href={benefit.applyUrl} target="_blank" rel="noopener noreferrer">
                Open GOV.UK claim page <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange, autoFilled }: { field: FormField; value: any; onChange: (v: any) => void; autoFilled?: boolean }) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
        <span className="text-sm">{field.label}{field.help && <span className="block text-xs text-muted-foreground">{field.help}</span>}</span>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-2">
        {field.label}{field.required && <span className="text-destructive"> *</span>}
        {autoFilled && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">From your profile</span>}
      </Label>

      {field.type === "textarea" ? (
        <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <Input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}