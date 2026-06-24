import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, type Profile } from '@/lib/schemas/profile';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DateWheelPicker } from '@/components/date-wheel-picker';
import { NationalitySelect } from '@/components/nationality-select';

export const Route = createFileRoute('/_authenticated/onboarding')({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const form = useForm<Profile>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      nationality: 'British',
      residency: 'UK',
      income: 0,
      savings: 0,
      hasDisability: false,
      needsCare: false,
      isCaring: false,
      hasPartner: false,
      hasChildren: false,
    },
  });

  const onSubmit = async (data: Profile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...data });

    if (!error) {
      navigate({ to: '/_authenticated/dashboard' });
    } else {
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Let's get to know you</CardTitle>
          <p className="text-center text-gray-600">This helps us find every benefit you're eligible for</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Step 1: About You */}
              <div>
                <h3 className="font-semibold mb-4 text-lg">About You</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField name="dateOfBirth" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Date of Birth</FormLabel>
                    <DateWheelPicker {...field} />
                  </FormItem>
                )} />
              </div>

              {/* Step 2: Contact & Address */}
              <div>
                <h3 className="font-semibold mb-4 text-lg">Contact & Address</h3>
                <FormField name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField name="phone" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField name="postcode" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Postcode</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Step 3: Circumstances */}
              <div>
                <h3 className="font-semibold mb-4 text-lg">Your Circumstances</h3>
                <div className="space-y-4">
                  <FormField name="hasDisability" render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Do you have a disability or long-term health condition?</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="needsCare" render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Do you need help with personal care?</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="isCaring" render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Are you caring for someone else?</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full py-6 text-lg">
                Save Profile & See My Benefits
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}