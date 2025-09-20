import { useCharacterData } from '../../data/DataContext';
import './legal-footer.css';

export function LegalFooter() {
  const { data } = useCharacterData();

  const notice = data?.legal?.copyright;
  if (!notice || notice.display?.footer === false) {
    return null;
  }

  return (
    <footer className="legal-footer" aria-label="Legal notice" role="contentinfo">
      <span className="legal-footer__text">{notice.text}</span>
      {notice.licenseUrl ? (
        <a href={notice.licenseUrl} target="_blank" rel="noreferrer" className="legal-footer__link">
          {notice.license}
        </a>
      ) : (
        <span className="legal-footer__link">{notice.license}</span>
      )}
    </footer>
  );
}
