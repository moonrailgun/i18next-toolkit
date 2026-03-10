'use client';

import { useTranslation } from '@i18next-toolkit/nextjs-approuter';

export function ClientGreeting() {
  const { t } = useTranslation();

  return (
    <div>
      <p>
        {t('Learn about Next.js in an interactive course with quizzes!')}
      </p>
    </div>
  );
}
