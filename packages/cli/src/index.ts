import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { config } from './config';
import {
  buildTranslationFile,
  defaultTransform,
} from '@i18next-toolkit/extractor';
import {
  defaultIgnoreFiles,
  defaultIgnoreText,
  scanUntranslatedText,
} from '@i18next-toolkit/scanner';
import path from 'path';

export { configSchema } from './config';
export type { I18nextToolkitConfig } from './config';

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
    'extract',
    'extract all files which not existed translation key',
    () => {},
    (argv) => {
      console.log('Start extract files in:');
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
  .command(
    'scan',
    'scan untranslated text from js/jsx',
    () => {},
    async (argv) => {
      const scannerConfig = config.scanner;
      const tsConfigFilePath = path.resolve(
        process.cwd(),
        scannerConfig.tsconfigPath
      );

      const untranslatedText = await scanUntranslatedText(
        scannerConfig.source,
        {
          project: {
            tsConfigFilePath,
            manipulationSettings: {
              indentationText: scannerConfig.indentationText,
            },
          },
          autoImport: scannerConfig.autoImport,
          verbose: scannerConfig.verbose,
          ignoreFiles: [...defaultIgnoreFiles, ...scannerConfig.ignoreFiles],
          ignoreText: [...defaultIgnoreText, ...scannerConfig.ignoreText],
        }
      );
      let count = 0;

      Object.entries(untranslatedText).map(([path, list]) => {
        console.group(path);
        list.forEach((item) => {
          console.log(`- ${item}`);
          count++;
        });
        console.groupEnd();
      });

      console.log(`Scan completed, found ${count} words not to translate`);

      if (count > 0) {
        process.exit(1);
      }
    }
  )
  .help()
  .parse();
