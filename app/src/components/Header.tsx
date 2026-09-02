import { useTheme } from '../theme';
import { useLang, useT } from '../i18n';

export function Header() {
  const t = useT();
  const lang = useLang(s => s.lang);
  const setLang = useLang(s => s.setLang);
  const theme = useTheme(s => s.theme);
  const toggle = useTheme(s => s.toggle);

  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <span>{t('appName') as string}</span>
      </div>
      <div className="spacer" />

      <div className="lang-toggle" role="group" aria-label="Language">
        <button className={lang === 'pt' ? 'active' : ''} onClick={() => setLang('pt')}>PT</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>

      <button className="icon-btn" onClick={toggle} aria-label="Toggle theme" title={theme === 'light' ? (t('themeDark') as string) : (t('themeLight') as string)}>
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <a className="icon-btn" href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <GitHubIcon />
        <span>{t('github') as string}</span>
      </a>
    </header>
  );
}

function Logo() {
  // The ticket number rolls over like an odometer -- one draw handing off to
  // the next, which is what a rifa is. Motion lives in styles.css so it stops
  // under prefers-reduced-motion.
  return (
    <svg className="logo-mark" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="6" x2="8" y2="18" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
      <text className="anim-rifas-num" x="13" y="15" fontSize="7" fontWeight="700" fill="currentColor">№</text>
      <text className="anim-rifas-next" x="13" y="15" fontSize="7" fontWeight="700" fill="currentColor" opacity="0">№</text>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>
    </svg>
  );
}
