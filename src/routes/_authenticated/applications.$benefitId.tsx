import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const benefitName = benefitId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: '/login' });
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Load existing application if any
      const { data: existing } = await supabase
        .from('application_forms')
        .select('*')
        .eq('user_id', user.id)
        .eq('benefit_id', benefitId)
        .single();

      if (existing?.form_data) {
        setFormData(existing.form_data);
      }

      setLoading(false);
    };

    loadData();
  }, [benefitId, navigate]);

  const handleChange = (field: string, value: string) => {
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
    alert('Application saved!');
  };

  if (loading) return <div className="p-8 text-center">Loading form...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{benefitName}</h1>
        <Button onClick={() => navigate({ to: '/_authenticated/applications' })} variant="outline">
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <p className="text-sm text-gray-600">Pre-filled where possible from your profile</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic pre-filled fields example */}
          <div>
            <Label>Full Name</Label>
            <Input 
              value={formData.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`} 
              onChange={(e) => handleChange('fullName', e.target.value)} 
            />
          </div>

          <div>
            <Label>Date of Birth</Label>
            <Input 
              value={formData.dateOfBirth || profile?.dateOfBirth || ''} 
              onChange={(e) => handleChange('dateOfBirth', e.target.value)} 
            />
          </div>

          <div>
            <Label>National Insurance Number</Label>
            <Input 
              value={formData.nino || ''} 
              onChange={(e) => handleChange('nino', e.target.value)} 
              placeholder="Enter your NI number"
            />
          </div>

          {/* Add more fields dynamically based on benefitId in a full version */}

          <div className="flex gap-4 pt-4">
            <Button onClick={saveApplication} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button 
              onClick={() => navigate({ to: '/_authenticated/applications' })} 
              variant="outline" 
              className="flex-1"
            >
              Done for now
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-500 mt-8">
        This form will eventually auto-fill from your profile and match official DWP forms.
      </p>
    </div>
  );
}