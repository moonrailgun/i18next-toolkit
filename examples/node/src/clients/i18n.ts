import { initI18NInstance } from '@i18next-toolkit/node/lib/instance';
import { readdirSync, lstatSync } from 'fs';
import { join } from 'path';

const { getTranslation } = initI18NInstance({
  initOptions: {
    preload: readdirSync('assets/locales').filter((fileName) => {
      const joinedPath = join('assets/locales', fileName);
      const isDirectory = lstatSync(joinedPath).isDirectory();
      return isDirectory;
    }),
  },
});

export { getTranslation };
