import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const Route = createFileRoute('/_authenticated/applications/$benefitId')({
  component: ApplicationForm,
});

function ApplicationForm() {
  const { benefitId } = useParams({ from: '/_authenticated/applications/$benefitId' });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const benefitName = benefitId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: '/login' });
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profileData) setProfile(profileData);

      const { data: existing } = await supabase
        .from('application_forms')
        .select('*')
        .eq('user_id', user.id)
        .eq('benefit_id', benefitId)
        .single();

      if (existing?.form_data) setFormData(existing.form_data);

      setLoading(false);
    };

    loadData();
  }, [benefitId, navigate]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveApplication = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('application_forms').upsert({
      user_id: user.id,
      benefit_id: benefitId,
      benefit_name: benefitName,
      form_data: formData,
      status: 'In Progress',
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    alert('Progress saved successfully!');
  };

  if (loading) return <div className="p-8 text-center">Loading application form...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{benefitName}</h1>
        <Button variant="outline" onClick={() => navigate({ to: '/_authenticated/applications' })}>
          Back to Applications
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <p className="text-sm text-gray-600">Pre-filled from your profile where possible</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Full Name</Label>
            <Input 
              value={formData.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`} 
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          </div>

          <div>
            <Label>National Insurance Number</Label>
            <Input 
              value={formData.nino || ''} 
              onChange={(e) => handleChange('nino', e.target.value)} 
              placeholder="AB 12 34 56 C"
            />
          </div>

          <div>
            <Label>Additional Notes / Circumstances</Label>
            <Textarea 
              value={formData.notes || ''} 
              onChange={(e) => handleChange('notes', e.target.value)} 
              placeholder="Any extra information that may help your claim..."
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button onClick={saveApplication} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/_authenticated/applications' })} className="flex-1">
              Finish Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}