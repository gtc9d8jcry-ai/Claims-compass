'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Users, TrendingUp, Target } from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handleGenerateWithAI = () => {
    if (!aiPrompt.trim()) return;
    alert(`AI Analysis for claim:\n\n${aiPrompt}\n\n(Real AI integration ready)`);
    setAiPrompt('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Claims Compass</h1>
            <p className="text-gray-600">Dashboard</p>
          </div>
          <Button onClick={() => router.push('/new-claim')}>
            <Plus className="mr-2 h-4 w-4" /> New Claim
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Target className="w-5 h-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-600">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">$248k</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">8</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Quick Access */}
        <Button 
          onClick={() => setShowAIPrompt(!showAIPrompt)} 
          className="w-full mb-8"
          size="lg"
        >
          <Lightbulb className="mr-2 h-5 w-5" /> Open AI Claims Assistant (CMD + SHIFT + K)
        </Button>

        {showAIPrompt && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the claim or ask for analysis..."
                className="w-full h-32 p-4 border rounded-lg resize-y"
              />
              <Button onClick={handleGenerateWithAI} className="mt-4 w-full" size="lg">
                Generate with AI
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add your recent claims list here from the original code */}
            <p className="text-muted-foreground">Recent claims list would go here...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;