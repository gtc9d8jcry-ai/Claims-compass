import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/schemas/profile';

export const Route = createFileRoute('/_authenticated/conversational')({
  component: ConversationalChat,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ConversationalChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm here to help you with your benefits. Just tell me about yourself in your own words — your age, health, caring responsibilities, children, work, income, etc. I'll pick up the important details and save them for you." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simple relaxed extractor (we can make this much smarter later)
  const extractProfileFromText = (text: string): Partial<Profile> => {
    const lower = text.toLowerCase();
    const updates: Partial<Profile> = {};

    // Age / DOB
    const ageMatch = lower.match(/(\d{1,3})\s*(years?|yrs?|old)/);
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age > 16 && age < 120) {
        const birthYear = new Date().getFullYear() - age;
        updates.date_of_birth = `${birthYear}-01-01`;
      }
    }

    // Disability
    if (lower.includes('disabl') || lower.includes('arthritis') || lower.includes('mobility') || lower.includes('blind') || lower.includes('deaf')) {
      updates.has_disability = true;
    }

    // Carer
    if (lower.includes('care') || lower.includes('look after') || lower.includes('caring for')) {
      updates.is_carer = true;
      const hoursMatch = lower.match(/(\d+)\s*(hours?|hrs?)/);
      if (hoursMatch) updates.caring_hours = parseInt(hoursMatch[1]);
    }

    // Children
    const childrenMatch = lower.match(/(\d+)\s*(child|children|kid|kids)/);
    if (childrenMatch) updates.number_of_children = parseInt(childrenMatch[1]);

    // Income (very rough)
    const incomeMatch = lower.match(/£?(\d+)\s*(a week|per week|weekly)/);
    if (incomeMatch) {
      updates.weekly_income = parseInt(incomeMatch[1]);
      updates.income_frequency = 'weekly';
    }

    // Partner
    if (lower.includes('partner') || lower.includes('wife') || lower.includes('husband') || lower.includes('married')) {
      updates.has_partner = true;
    }

    return updates;
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 600));

    const extracted = extractProfileFromText(input);

    let assistantReply = "Thanks — I've noted that down.";

    if (Object.keys(extracted).length > 0) {
      assistantReply += " I've updated your profile with what you told me.";
      
      // Save to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .upsert({ 
              user_id: user.id, 
              ...extracted,
              last_updated: new Date().toISOString()
            }, { onConflict: 'user_id' });
          setSaved(true);
        }
      } catch (e) {
        console.error('Failed to save profile', e);
      }
    } else {
      assistantReply += " Tell me a bit more (age, health, caring, children, income, etc.) and I'll save it for you.";
    }

    const assistantMessage: Message = { role: 'assistant', content: assistantReply };
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Talk to AI Assistant</h1>
        <p className="text-sm text-gray-600">Just chat naturally — I’ll save the important details</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl px-4 py-3 text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        {saved && (
          <div className="mb-3 text-center">
            <button
              onClick={() => navigate({ to: '/_authenticated/check-benefits' })}
              className="text-sm px-4 py-2 bg-green-600 text-white rounded-full"
            >
              See what benefits you might be eligible for →
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me about yourself..."
            className="flex-1 border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-6 rounded-full bg-blue-600 text-white disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Example: “I’m 68, have arthritis, care for my wife 40 hours a week”
        </p>
      </div>
    </div>
  );
}
