'use client';

import {
  useLocale,
  useChangeLocale,
} from '@i18next-toolkit/react-nextjs-approuter';

export function LocaleSwitcher() {
  const locale = useLocale();
  const changeLocale = useChangeLocale();

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={() => changeLocale('en')}
        style={{ fontWeight: locale === 'en' ? 'bold' : 'normal' }}
      >
        English
      </button>
      <button
        onClick={() => changeLocale('zh')}
        style={{ fontWeight: locale === 'zh' ? 'bold' : 'normal' }}
      >
        中文
      </button>
    </div>
  );
}
