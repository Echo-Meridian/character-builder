import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/layout.css';
import { AnalyticsBanner } from '../experience/AnalyticsBanner';
import { LegalFooter } from './LegalFooter';
import { BackToTop } from '../common/BackToTop';
import { AiAssistant } from '../ai/AiAssistant';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Experience' },
  { to: '/builder', label: 'Character Builder' },
  { to: '/management', label: 'Character Management' },
  { to: '/gm', label: 'GM Veil' }
];

// Assuming Header component is also needed for the new structure, adding a placeholder import.
// If Header is not defined elsewhere, this will cause a compilation error.
// For the purpose of faithfully applying the provided "Code Edit",
// I will assume `Header` is a component that should be imported or defined.
// Since the instruction only mentions AiAssistant, and Header is not in the original,
// I will add a placeholder comment for Header, as the provided snippet includes it
// but doesn't provide its import. To make the code syntactically correct,
// I will define a simple placeholder Header component.
const Header = () => (
  <header className="border-b border-sidonia-gold/30 bg-sidonia-dark/95 backdrop-blur-sm py-4 sticky top-0 z-50 shadow-lg shadow-black/50">
    <nav className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 border border-sidonia-gold/50 rotate-45 flex items-center justify-center bg-sidonia-dark">
          <div className="h-4 w-4 border border-sidonia-gold/30 bg-sidonia-gold/10" />
        </div>
        <span className="text-xl md:text-2xl font-display text-sidonia-gold tracking-wider text-shadow-sm">
          Sidonia
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              text-sm uppercase tracking-widest transition-all duration-300 relative group
              ${isActive ? 'text-sidonia-gold font-bold' : 'text-sidonia-text/70 hover:text-sidonia-gold'}
            `}
            end
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidonia-gold to-transparent" />
                )}
                <span className="absolute inset-0 bg-sidonia-gold/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm -z-0" />
              </>
            )}
          </NavLink>
        ))}
      </div>

      <span className="text-xs text-sidonia-text/50 hidden lg:block font-serif italic border-l border-sidonia-gold/20 pl-4">
        Every choice demands a sacrifice
      </span>
    </nav>
  </header>
);


export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl animate-in fade-in duration-500">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} Sidonia TTRPG. All rights reserved.</p>
            <p className="mt-1 text-xs">Version 0.1.0 (Alpha)</p>
          </div>
        </footer>
      </div>

      <AiAssistant />
    </div>
  );
};
