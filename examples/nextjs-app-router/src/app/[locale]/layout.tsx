import { I18nProvider } from '@i18next-toolkit/react-nextjs-approuter';
import {
  getMessages,
  initServerI18n,
} from '@i18next-toolkit/react-nextjs-approuter/server';
import { i18nConfig } from '../../i18n.config';

initServerI18n(i18nConfig);

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <I18nProvider
          locale={locale}
          locales={i18nConfig.locales}
          defaultLocale={i18nConfig.defaultLocale}
          messages={messages}
          routingStrategy={i18nConfig.routingStrategy}
          localeCookieName={i18nConfig.localeCookieName}
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
