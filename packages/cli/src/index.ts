import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { config } from './config';
import {
  buildTranslationFile,
  defaultTransform,
} from '@i18next-toolkit/scanner';
import path from 'path';

yargs(hideBin(process.argv))
  .scriptName('i18next-toolkit')
  .usage('$0 <cmd> [args]')
  .command(
    'init',
    'init i18n translation file',
    () => {},
    async (argv) => {
      for (const locale of config.locales) {
        const targetFile = `${config.publicDir}/locales/${locale}/translation.json`;
        const existed = await fs.exists(targetFile);

        if (existed) {
          console.log(`Translation file [${targetFile}] existed, skip.`);
          continue;
        }

        await fs.mkdirp(path.dirname(targetFile));
        await fs.writeJSON(targetFile, {});
        console.log(`Translation file [${targetFile}] generated!`);
      }
    }
  )
  .command(
    'scan',
    'scan all files which can be generate translation',
    () => {},
    (argv) => {
      console.log('Start scan files in:');
      const input = ['./**/*.{js,jsx,ts,tsx}', '!./**/*.spec.{js,jsx,ts,tsx}'];
      console.log('File matched: ' + input.join(', '));

      buildTranslationFile({
        input,
        output: path.resolve(process.cwd(), './public/locales'),
        lngs: config.locales,
        transform: config.transform ?? defaultTransform,
      });
    }
  )
  .help()
  .parse();
