import { Link } from 'react-router-dom';
import { DecoButton } from '../components/ui/DecoButton';
import { DecoCard } from '../components/ui/DecoCard';

export function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-deco-md py-deco-xl">
      <div className="max-w-4xl w-full space-y-deco-lg">
        {/* Hero Section */}
        <header className="text-center space-y-deco-md mb-deco-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-display-lg text-shadow-gold px-4">
            Character Creation as Descent
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-sidonia-gold to-transparent" />
          <p className="text-body-lg text-sidonia-text max-w-2xl mx-auto leading-relaxed">
            Step through Sidonia&apos;s dark wards with a guide that teaches while it tempts.
            Assign priorities, face the consequences, and build a persona that balances
            humanity, power, and the whispers of corruption.
          </p>
        </header>

        {/* Main Content Card */}
        <DecoCard className="space-y-deco-md">
          <div className="space-y-deco-sm">
            <p className="text-body text-sidonia-text/90 leading-relaxed">
              Begin with the priority grid, explore lineage aesthetics, and unlock deeper
              mechanical truths only when you are ready to commit. Every page layers narrative
              first and detail second, ensuring newcomers learn through meaningful choice.
            </p>
            <p className="text-body text-sidonia-text/90 leading-relaxed">
              Continue to the Character Builder to start a new dossier or revisit existing
              souls you are shepherding through the night.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-deco-sm pt-deco-md border-t border-sidonia-gold/60">
            <Link to="/builder" className="block">
              <DecoButton variant="primary" size="lg" className="w-full">
                New Character
              </DecoButton>
            </Link>
            <Link to="/management" className="block">
              <DecoButton variant="secondary" size="lg" className="w-full">
                Manage Characters
              </DecoButton>
            </Link>
            <Link to="/gm" className="block">
              <DecoButton variant="ghost" size="lg" className="w-full">
                GM Portal
              </DecoButton>
            </Link>
          </div>
        </DecoCard>

        {/* Atmospheric Quote */}
        <blockquote className="text-center">
          <p className="font-display text-xl tracking-wider text-sidonia-muted italic">
            "Every power has a price. Every choice leaves its mark."
          </p>
          <footer className="mt-2 text-label">
            — The Republic Archives
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
