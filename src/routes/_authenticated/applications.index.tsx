import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/_authenticated/applications/')({
  component: ApplicationsIndex,
});

const BENEFITS = [
  { id: 'universal-credit', name: 'Universal Credit', category: 'Income' },
  { id: 'pip', name: 'Personal Independence Payment (PIP)', category: 'Disability' },
  { id: 'attendance-allowance', name: 'Attendance Allowance', category: 'Disability' },
  { id: 'carers-allowance', name: "Carer's Allowance", category: 'Caring' },
  // Add more from your full 79 benefits list as needed
];

function ApplicationsIndex() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('application_forms')
        .select('*')
        .eq('user_id', user.id);

      if (data) setApplications(data);
      setLoading(false);
    };

    loadApplications();
  }, []);

  const getStatus = (benefitId: string) => {
    const app = applications.find(a => a.benefit_id === benefitId);
    return app ? app.status : 'Not started';
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Your Applications</h1>

      <div className="space-y-4">
        {BENEFITS.map((benefit) => {
          const status = getStatus(benefit.id);
          return (
            <Link 
              key={benefit.id} 
              to={`/applications/${benefit.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-all active:scale-[0.985]">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <CardTitle className="text-xl">{benefit.name}</CardTitle>
                  <Badge variant={status === 'Not started' ? 'outline' : 'default'}>
                    {status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Tap to start or continue application</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}