import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, ProfileSchema } from '@/lib/schemas/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: '/login' });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setProfile(data as Profile);
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const saveProfile = async () => {
    if (!profile) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').upsert({ user_id: user.id, ...profile });
    setEditing(false);
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && (
            <>
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={`${profile.firstName || ''} ${profile.lastName || ''}`} 
                  disabled={!editing}
                  onChange={(e) => {
                    const names = e.target.value.split(' ');
                    setProfile({ ...profile, firstName: names[0] || '', lastName: names.slice(1).join(' ') });
                  }}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={profile.email || ''} disabled />
              </div>

              <div>
                <Label>Postcode</Label>
                <Input 
                  value={profile.postcode || ''} 
                  disabled={!editing}
                  onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <Button onClick={saveProfile} disabled={!editing} className="w-full">
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}