import React from 'react';
import ReactDOM from 'react-dom/client';
import { setupI18nInstance } from '@i18next-toolkit/react';
import App from './App.tsx';
import './index.css';

setupI18nInstance();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
