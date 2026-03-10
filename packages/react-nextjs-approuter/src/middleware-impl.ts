import { NextRequest, NextResponse } from 'next/server';
import { I18nConfig } from './config';
import { parseAcceptLanguage } from './utils';

function detectLocale(request: NextRequest, config: I18nConfig): string {
  const cookieLocale = request.cookies.get(config.localeCookieName)?.value;
  if (cookieLocale && config.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  const negotiated = parseAcceptLanguage(acceptLanguage, config.locales);
  if (negotiated) {
    return negotiated;
  }

  return config.defaultLocale;
}

function handleUrlSegment(
  request: NextRequest,
  config: I18nConfig
): NextResponse {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = config.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    const segments = pathname.split('/');
    const locale = segments[1];
    response.cookies.set(config.localeCookieName, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
    return response;
  }

  const locale = detectLocale(request, config);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl);
  response.cookies.set(config.localeCookieName, locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  });
  return response;
}

function handleCookieHeader(
  request: NextRequest,
  config: I18nConfig
): NextResponse {
  const locale = detectLocale(request, config);

  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  response.cookies.set(config.localeCookieName, locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  });
  return response;
}

export function createI18nMiddleware(config: I18nConfig) {
  return function i18nMiddleware(request: NextRequest): NextResponse {
    if (config.routingStrategy === 'url-segment') {
      return handleUrlSegment(request, config);
    }
    return handleCookieHeader(request, config);
  };
}
