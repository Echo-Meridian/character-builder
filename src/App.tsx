import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { BuilderPage } from './pages/BuilderPage';
import { ManagementPage } from './pages/ManagementPage';
import { CharacterSheetPage } from './pages/CharacterSheetPage';
import { GmPortalPage } from './pages/GmPortalPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useCharacterData } from './data/DataContext';

export default function App() {
  const { status, error, refresh } = useCharacterData();

  let content: ReactNode;

  if (status === 'idle' || status === 'loading') {
    content = <LoadingSpinner />;
  } else if (status === 'error') {
    content = (
      <div>
        <h2>We lost the signal.</h2>
        <p>Character data failed to load. {error}</p>
        <button type="button" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  } else {
    content = (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/management" element={<ManagementPage />} />
        <Route path="/sheet/:buildId" element={<CharacterSheetPage />} />
        <Route path="/gm" element={<GmPortalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return <AppShell>{content}</AppShell>;
}
