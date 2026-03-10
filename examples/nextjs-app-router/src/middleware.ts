import { createI18nMiddleware } from '@i18next-toolkit/react-nextjs-approuter/middleware';
import { i18nConfig } from './i18n.config';

export default createI18nMiddleware(i18nConfig);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
