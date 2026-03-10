import { createNavigation } from '@i18next-toolkit/react-nextjs-approuter/navigation';
import { i18nConfig } from '../i18n.config';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(i18nConfig);
