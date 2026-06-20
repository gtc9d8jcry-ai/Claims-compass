export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Welcome to ClaimCompass</h1>
      <p className="text-gray-600 mb-8">Your personal UK benefits assistant</p>

      <div className="grid grid-cols-2 gap-4">
        <a href="/check-benefits" className="bg-white p-6 rounded-xl border border-blue-200 hover:border-blue-400">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-semibold">Check Benefits</h3>
          <p className="text-sm text-gray-500">See what you're eligible for</p>
        </a>

        <a href="/conversational" className="bg-white p-6 rounded-xl border border-blue-200 hover:border-blue-400">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-semibold">Talk to AI</h3>
          <p className="text-sm text-gray-500">Ask anything about benefits</p>
        </a>
      </div>
    </div>
  );
}
