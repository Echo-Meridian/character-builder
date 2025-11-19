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
  <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm py-4">
    <nav className="container mx-auto px-4 flex justify-between items-center">
      <span className="text-xl font-bold text-cyan-400">Sidonia: The Long Night</span>
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-cyan-300 transition-colors')} end>
            {item.label}
          </NavLink>
        ))}
      </div>
      <span className="text-sm text-slate-500 hidden md:block">Every choice demands a sacrifice</span>
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
