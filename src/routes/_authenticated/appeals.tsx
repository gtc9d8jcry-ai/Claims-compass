import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const Route = createFileRoute('/_authenticated/appeals')({
  component: AppealsPage,
});

function AppealsPage() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    benefitName: '',
    decisionDate: '',
    reason: '',
    notes: '',
  });

  const loadAppeals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('appeals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setAppeals(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  const saveAppeal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('appeals').insert({
      user_id: user.id,
      benefit_name: formData.benefitName,
      decision_date: formData.decisionDate,
      reason: formData.reason,
      notes: formData.notes,
      status: 'Draft',
    });

    setFormData({ benefitName: '', decisionDate: '', reason: '', notes: '' });
    setShowForm(false);
    loadAppeals();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appeals</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Appeal'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Appeal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Benefit Name</Label>
              <Input 
                value={formData.benefitName} 
                onChange={(e) => setFormData({ ...formData, benefitName: e.target.value })} 
              />
            </div>
            <div>
              <Label>Decision Date</Label>
              <Input 
                type="date" 
                value={formData.decisionDate} 
                onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} 
              />
            </div>
            <div>
              <Label>Reason for Appeal</Label>
              <Textarea 
                value={formData.reason} 
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
            <Button onClick={saveAppeal} className="w-full">Save Appeal</Button>
          </CardContent>
        </Card>
      )}

      <h2 className="font-semibold mb-3">Your Appeals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : appeals.length === 0 ? (
        <p className="text-gray-500">No appeals yet.</p>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <Card key={appeal.id}>
              <CardContent className="pt-4">
                <div className="font-medium">{appeal.benefit_name}</div>
                <div className="text-sm text-gray-600">Status: {appeal.status}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(appeal.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}