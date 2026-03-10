import { getTranslation } from '@i18next-toolkit/nextjs-approuter/server';
import { LocaleSwitcher } from '../../components/LocaleSwitcher';
import { ClientGreeting } from '../../components/ClientGreeting';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>{t('Create Next App')}</h1>

      <p>{t('Welcome to our website')}</p>

      <p style={{ color: '#666' }}>
        {t(
          'Find in-depth information about Next.js features and API.'
        )}
      </p>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Client Component Demo</h2>
      <ClientGreeting />

      <hr style={{ margin: '2rem 0' }} />

      <h2>Language</h2>
      <LocaleSwitcher />
    </main>
  );
}
