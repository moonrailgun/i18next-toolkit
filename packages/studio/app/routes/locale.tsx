import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Outlet, redirect, useLoaderData, useParams } from '@remix-run/react';
import {
  readAllTranslationFile,
  readTranslationFile,
} from '~/.server/translation';
import { LanguageList } from '~/components/common/LanguageList';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable';

export const meta: MetaFunction = () => {
  return [
    { title: 'I18Next Studio' },
    { name: 'description', content: 'I18Next Toolkit Studio!' },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { namespaces, fileList, defaultLocale, locales } =
    await readAllTranslationFile();

  if (!params.locale) {
    return redirect(`${defaultLocale}`);
  }

  const defaultLocaleData = await readTranslationFile(defaultLocale);

  return {
    namespaces,
    fileList,
    defaultLocale,
    locales,
    defaultLocaleData,
  };
}
export default function LocaleLayout() {
  const { locales, defaultLocale } = useLoaderData<typeof loader>();
  const params = useParams();
  const locale = params.locale ?? defaultLocale; // 获取 $locale 参数

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>
          <LanguageList
            allLanguages={locales}
            defaultLanguage={defaultLocale}
            currentLanguage={locale}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <div className="p-2">
            <Outlet />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
