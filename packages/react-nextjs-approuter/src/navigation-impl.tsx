'use client';

import React, { forwardRef, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
} from 'next/navigation';
import { I18nConfig } from './config';
import { useI18nContext } from './context';

function prefixPathname(locale: string, pathname: string): string {
  if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
    return pathname;
  }
  return `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

function stripLocalePrefix(pathname: string, locales: string[]): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

export function createNavigation(config: I18nConfig) {
  type LinkProps = Omit<React.ComponentProps<typeof NextLink>, 'locale'> & {
    locale?: string;
  };

  const Link = forwardRef<HTMLAnchorElement, LinkProps>(function I18nLink(
    { href, locale, ...rest },
    ref
  ) {
    const { locale: currentLocale } = useI18nContext();
    const targetLocale = locale ?? currentLocale;

    const localizedHref = useMemo(() => {
      if (typeof href === 'string') {
        return prefixPathname(targetLocale, href);
      }
      return {
        ...href,
        pathname: href.pathname
          ? prefixPathname(targetLocale, href.pathname)
          : undefined,
      };
    }, [href, targetLocale]);

    return <NextLink ref={ref} href={localizedHref} {...rest} />;
  });

  function useRouter() {
    const nextRouter = useNextRouter();
    const { locale, locales } = useI18nContext();

    const push = useCallback(
      (href: string, options?: Parameters<typeof nextRouter.push>[1]) => {
        nextRouter.push(prefixPathname(locale, href), options);
      },
      [nextRouter, locale]
    );

    const replace = useCallback(
      (href: string, options?: Parameters<typeof nextRouter.replace>[1]) => {
        nextRouter.replace(prefixPathname(locale, href), options);
      },
      [nextRouter, locale]
    );

    const prefetch = useCallback(
      (href: string) => {
        nextRouter.prefetch(prefixPathname(locale, href));
      },
      [nextRouter, locale]
    );

    return useMemo(
      () => ({
        ...nextRouter,
        push,
        replace,
        prefetch,
      }),
      [nextRouter, push, replace, prefetch]
    );
  }

  function usePathname(): string {
    const pathname = useNextPathname();
    return stripLocalePrefix(pathname, config.locales);
  }

  function redirect(href: string, locale: string): string {
    return prefixPathname(locale, href);
  }

  return { Link, useRouter, usePathname, redirect };
}
