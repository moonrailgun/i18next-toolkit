import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { get } from 'lodash-es';
import { useMemo } from 'react';
import { readConfig, readTranslationFile } from '~/.server/translation';
import { TranslationTable } from '~/components/common/TranslationTable';

export async function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale;
  if (!locale) {
    return json({
      locale,
      defaultLocaleData: {} as Record<string, string>,
      currentlocaleData: {} as Record<string, string>,
    });
  }

  const config = await readConfig();
  const defaultLocale = get(config, 'defaultLocale', 'en') as string;

  const [defaultLocaleData, currentlocaleData] = await Promise.all([
    readTranslationFile(defaultLocale),
    readTranslationFile(locale),
  ]);

  return json({
    locale,
    defaultLocaleData,
    currentlocaleData,
  });
}

export default function Index() {
  const { defaultLocaleData, currentlocaleData } =
    useLoaderData<typeof loader>();

  const tableData = useMemo(() => {
    return Object.entries(defaultLocaleData).map(([key, original]) => {
      return {
        key,
        original: String(original),
        current: currentlocaleData[key] ?? null,
      };
    });
  }, [defaultLocaleData, currentlocaleData]);

  return (
    <div>
      <TranslationTable tableData={tableData} />
    </div>
  );
}
