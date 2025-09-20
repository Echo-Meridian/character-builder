import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/layout.css';
import { AnalyticsBanner } from '../experience/AnalyticsBanner';
import { LegalFooter } from './LegalFooter';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Experience' },
  { to: '/builder', label: 'Character Builder' },
  { to: '/management', label: 'Character Management' },
  { to: '/gm', label: 'GM Veil' }
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <nav className="app-shell__nav">
          <span className="brand">Sidonia: The Long Night</span>
          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
                {item.label}
              </NavLink>
            ))}
          </div>
          <span className="nav-meta">Every choice demands a sacrifice</span>
        </nav>
      </header>
      <main className="app-shell__main">{children}</main>
      <LegalFooter />
      <AnalyticsBanner />
    </div>
  );
}
