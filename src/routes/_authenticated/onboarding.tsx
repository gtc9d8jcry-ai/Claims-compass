// src/routes/_authenticated/onboarding.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, type Profile, toWeekly } from "@/lib/schemas/profile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DateWheelPicker } from "@/components/date-wheel-picker";
import { NationalitySelect } from "@/components/nationality-select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"about" | "contact" | "status" | "money" | "circumstances">("about");
  const [editingDob, setEditingDob] = useState(false);

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      gender: null,
      ni_number: null,
      phone: null,
      email: null,
      address_line1: null,
      address_line2: null,
      town: null,
      postcode: null,
      region: null,
      nationality: null,
      immigration_status: null,
      residency_status: null,
      uk_residency_years: null,
      income_amount: 0,
      income_frequency: "weekly",
      weekly_income: 0,
      savings: 0,
      employment_status: null,
      household_status: null,
      number_of_children: 0,
      children_ages: null,
      is_pregnant: false,
      baby_due_date: null,
      is_carer: false,
      caring_hours: null,
      cared_for_gets_disability_benefit: false,
      has_disability: false,
      disability_work_related: false,
      partner_bereaved_date: null,
    },
  });

  const { register, handleSubmit, watch, setValue, control } = form;

  const onSubmit = async (data: Profile) => {
    if (!user) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast.error("Session expired. Please sign in again.");
      navigate({ to: "/login" });
      return;
    }

    const payload: any = {
      ...data,
      user_id: authData.user.id,
      weekly_income: toWeekly(data.income_amount || 0, data.income_frequency || "weekly"),
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile saved");
      navigate({ to: "/dashboard" });
    }
  };

  const nextStep = () => {
    if (step === "about") setStep("contact");
    else if (step === "contact") setStep("status");
    else if (step === "status") setStep("money");
    else if (step === "money") setStep("circumstances");
  };

  const prevStep = () => {
    if (step === "contact") setStep("about");
    else if (step === "status") setStep("contact");
    else if (step === "money") setStep("status");
    else if (step === "circumstances") setStep("money");
  };

  const stepTitle =
    step === "about"
      ? "About you"
      : step === "contact"
        ? "Contact & address"
        : step === "status"
          ? "Residency & status"
          : step === "money"
            ? "Money & work"
            : "Your circumstances";

  return (
    <div className="mx-auto max-w-xl space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{stepTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* STEP 1: About you */}
            {step === "about" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" {...register("full_name")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Date of birth</Label>
                  {watch("date_of_birth") && !editingDob ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{watch("date_of_birth")}</span>
                      <button
                        type="button"
                        onClick={() => setEditingDob(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <DateWheelPicker
                      value={watch("date_of_birth")}
                      onChange={(iso) => {
                        setValue("date_of_birth", iso);
                        setEditingDob(false);
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("gender")}
                  >
                    <option value="">Choose…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ni_number">National Insurance number</Label>
                  <Input id="ni_number" {...register("ni_number")} placeholder="e.g. QQ 12 34 56 C" />
                </div>
              </div>
            )}

            {/* STEP 2: Contact & Address */}
            {step === "contact" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" {...register("phone")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="address_line1">Address line 1</Label>
                  <Input id="address_line1" {...register("address_line1")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="address_line2">Address line 2</Label>
                  <Input id="address_line2" {...register("address_line2")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="town">Town / city</Label>
                  <Input id="town" {...register("town")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" {...register("postcode")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="region">Which nation do you live in?</Label>
                  <select
                    id="region"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("region")}
                  >
                    <option value="">Choose…</option>
                    <option value="england">England</option>
                    <option value="scotland">Scotland</option>
                    <option value="wales">Wales</option>
                    <option value="northern_ireland">Northern Ireland</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Residency & Status */}
            {step === "status" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Nationality</Label>
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => (
                      <NationalitySelect value={field.value} onChange={(val) => field.onChange(val)} />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="immigration_status">Immigration / residency status</Label>
                  <select
                    id="immigration_status"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("immigration_status")}
                  >
                    <option value="">Choose…</option>
                    <option value="british_irish">British or Irish citizen</option>
                    <option value="settled">Settled status / ILR</option>
                    <option value="pre_settled">Pre-settled status</option>
                    <option value="visa_public_funds">Visa with recourse to public funds</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="residency_status">Residency status</Label>
                  <select
                    id="residency_status"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("residency_status")}
                  >
                    <option value="">Choose…</option>
                    <option value="uk_resident">UK resident</option>
                    <option value="eea">EEA national</option>
                    <option value="refugee">Refugee / humanitarian protection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="uk_residency_years">How long have you lived in the UK?</Label>
                  <select
                    id="uk_residency_years"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("uk_residency_years")}
                  >
                    <option value="">Choose…</option>
                    <option value="born">Born here</option>
                    <option value="10+">10+ years</option>
                    <option value="5-9">5-9 years</option>
                    <option value="3-4">3-4 years</option>
                    <option value="1-2">1-2 years</option>
                    <option value="<1">Less than 1 year</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 4: Money & Work */}
            {step === "money" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="income_amount">Take-home pay (after tax &amp; NI) (£)</Label>
                  <Input id="income_amount" type="number" min={0} {...register("income_amount")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="income_frequency">How often are you paid?</Label>
                  <select
                    id="income_frequency"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    {...register("income_frequency")}
                  >