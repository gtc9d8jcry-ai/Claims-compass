import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authenticated/documents')({
  component: DocumentsPage,
});

function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Other');

  const loadDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('evidence_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const addDocument = async () => {
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('evidence_documents').insert({
      user_id: user.id,
      title,
      doc_type: docType,
      file_url: '',
      notes: '',
    });

    setTitle('');
    loadDocuments();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Document title" 
            />
          </div>

          <div>
            <Label>Type</Label>
            <select 
              value={docType} 
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option>Medical Evidence</option>
              <option>Bank Statement</option>
              <option>Identity</option>
              <option>Assessment Letter</option>
              <option>Other</option>
            </select>
          </div>

          <Button onClick={addDocument} disabled={!title} className="w-full">
            Add Document
          </Button>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Your Documents</h2>

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-gray-500">No documents yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-4">
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-gray-600">{doc.doc_type}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}