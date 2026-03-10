import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from './helper';

/**
 * @example
 * export const getServerSideProps = buildI18NServerSideProps()
 *
 * export const getServerSideProps = buildI18NServerSideProps(({req}) => {...})
 */

export const buildI18NServerSideProps = (fn: GetServerSideProps) => {
  const getServerSideProps: GetServerSideProps = async (context) => {
    const languageProps = await serverSideTranslations(context.locale ?? 'en', [
      'translation',
    ]);

    if (!fn) {
      return {
        props: {
          ...languageProps,
        },
      };
    }

    const res = await fn(context);

    if ('props' in res) {
      return {
        ...res,
        props: {
          ...languageProps,
          ...res.props,
        },
      };
    } else {
      // maybe redirect, not need translation
      return res;
    }
  };

  return getServerSideProps;
};
