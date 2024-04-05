import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import {
  useTranslation,
  setLanguage,
  Trans,
  i18next,
} from '@i18next-toolkit/react';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div>
        <span>{t('Switch Language to')}:</span>
        <button style={{ margin: 10 }} onClick={() => setLanguage('en')}>
          en
        </button>
        <button onClick={() => setLanguage('fr')}>fr</button>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {t('count is {{count}}', {
            count,
          })}
        </button>
        <Trans>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </Trans>
      </div>
      <p className="read-the-docs">
        {t('Click on the Vite and React logos to learn more')}
      </p>

      <div>{t('common::And support namespace')}</div>

      <Trans ns="common" key={count}>
        And support namespace with Trans component
      </Trans>
    </>
  );
}

(window as any).i18n = i18next;

export default App;
