import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold mb-4">ClaimCompass</h1>
        <p className="text-xl mb-8">Never miss a UK benefit you're entitled to.</p>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="block bg-white text-blue-600 font-semibold py-4 rounded-2xl text-lg active:scale-[0.985] transition-all"
          >
            Sign In
          </Link>
          
          <Link
            to="/signup"
            className="block border border-white/50 font-semibold py-4 rounded-2xl text-lg active:scale-[0.985] transition-all"
          >
            Create Free Account
          </Link>
        </div>

        <p className="text-sm text-blue-100 mt-12">
          Over 79 benefits • AI assistance • Daily updates
        </p>
      </div>
    </div>
  );
}