# @i18next-toolkit/react-nextjs-approuter

Next.js App Router integration for [i18next-toolkit](https://github.com/moonrailgun/i18next-toolkit). Supports both **URL segment** (`/en/about`) and **cookie/header** based routing strategies.

## Installation

```bash
npm install @i18next-toolkit/react-nextjs-approuter
```

## Quick Start

### 1. Create config

```ts
// src/i18n.config.ts
import { createI18nConfig } from '@i18next-toolkit/react-nextjs-approuter';

export const i18nConfig = createI18nConfig({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localeDir: './public/locales',
  namespaces: ['translation'],
  routingStrategy: 'url-segment', // or 'cookie-header'
});
```

### 2. Setup Middleware

```ts
// src/middleware.ts
import { createI18nMiddleware } from '@i18next-toolkit/react-nextjs-approuter/middleware';
import { i18nConfig } from './i18n.config';

export default createI18nMiddleware(i18nConfig);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### 3. Setup Layout

```tsx
// app/[locale]/layout.tsx  (url-segment mode)
import { I18nProvider } from '@i18next-toolkit/react-nextjs-approuter';
import { getMessages, initServerI18n } from '@i18next-toolkit/react-nextjs-approuter/server';
import { i18nConfig } from '../../i18n.config';

initServerI18n(i18nConfig);

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
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 4. Use in Server Components

```tsx
import { getTranslation } from '@i18next-toolkit/react-nextjs-approuter/server';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return <h1>{t('Hello World')}</h1>;
}
```

### 5. Use in Client Components

```tsx
'use client';
import { useTranslation } from '@i18next-toolkit/react-nextjs-approuter';

export function Greeting() {
  const { t } = useTranslation();
  return <p>{t('Welcome back')}</p>;
}
```

### 6. Language Switching

```tsx
'use client';
import { useLocale, useChangeLocale } from '@i18next-toolkit/react-nextjs-approuter';

export function LocaleSwitcher() {
  const locale = useLocale();
  const changeLocale = useChangeLocale();

  return (
    <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );
}
```

## Navigation (url-segment mode only)

```ts
// src/lib/navigation.ts
import { createNavigation } from '@i18next-toolkit/react-nextjs-approuter/navigation';
import { i18nConfig } from '../i18n.config';

export const { Link, redirect, usePathname, useRouter } = createNavigation(i18nConfig);
```

```tsx
import { Link } from '@/lib/navigation';

// Automatically prefixes href with current locale
<Link href="/about">About</Link>
```

## Routing Strategies

| | `url-segment` | `cookie-header` |
|---|---|---|
| URL format | `/en/about` | `/about` |
| SEO | Separate URLs per locale | Same URL, different content |
| Directory structure | `app/[locale]/` required | No `[locale]` segment needed |
| Language switch | URL navigation | Cookie + page refresh |
| Best for | Public-facing websites | Admin dashboards |

## API Reference

### Main (`@i18next-toolkit/react-nextjs-approuter`)

- `createI18nConfig(input)` — Create i18n configuration
- `I18nProvider` — Client-side provider component
- `useTranslation()` — Translation hook for client components
- `useLocale()` — Get current locale
- `useChangeLocale()` — Returns a function to switch locale
- `Trans` — Translation component with JSX interpolation

### Server (`@i18next-toolkit/react-nextjs-approuter/server`)

- `initServerI18n(config)` — Initialize server-side i18n
- `getTranslation(locale?)` — Get `t` function for server components
- `getMessages(locale?)` — Load all translation messages
- `getLocale()` — Detect locale from cookies/headers

### Middleware (`@i18next-toolkit/react-nextjs-approuter/middleware`)

- `createI18nMiddleware(config)` — Create Next.js middleware for locale routing

### Navigation (`@i18next-toolkit/react-nextjs-approuter/navigation`)

- `createNavigation(config)` — Returns `{ Link, useRouter, usePathname, redirect }`

## License

MIT
