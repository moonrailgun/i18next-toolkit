import '@/styles/globals.css';
import { appWithTranslation } from '@i18next-toolkit/react-nextjs';
import type { AppProps } from 'next/app';
import i18nConfig from '../../.i18next-toolkitrc.json';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(App, i18nConfig);
