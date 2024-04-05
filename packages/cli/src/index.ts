#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { config, configSchema, configExisted } from './config';
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
import { findSameValueMap, mergeObject } from './utils';
import { generateLLMTranslatePrompt } from './translator/llm';
import inquirer from 'inquirer';
import { generateTranslationFromOpenai } from './translator/openai';
import 'dotenv/config';

export { configSchema };
export type { I18nextToolkitConfig } from './config';

yargs(hideBin(process.argv))
  .scriptName('i18next-toolkit')
  .usage('$0 <cmd> [args]')
  .command(
    'init',
    'init i18n translation file',
    () => {},
    async (argv) => {
      // generate init locale
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

      // Update config
      if (!configExisted) {
        const configPath = './.i18next-toolkitrc.json';
        await fs.writeJson(configPath, configSchema.parse({}), {
          spaces: config.indentSpaces,
        });
        console.log(`Generate default config in ${configPath}`);
      }

      // Update package.json
      const packageConfig = await fs.readJson('./package.json');
      if (packageConfig) {
        let changed = false;
        if (!packageConfig.scripts) {
          changed = true;
          packageConfig.scripts = {};
        }

        if (!packageConfig.scripts['translation:extract']) {
          changed = true;
          packageConfig.scripts['translation:extract'] =
            'i18next-toolkit extract';
        }

        if (!packageConfig.scripts['translation:scan']) {
          changed = true;
          packageConfig.scripts['translation:scan'] = 'i18next-toolkit scan';
        }

        if (!packageConfig.scripts['translation:translate']) {
          changed = true;
          packageConfig.scripts['translation:translate'] =
            'i18next-toolkit translate';
        }

        if (changed) {
          await fs.writeJson('./package.json', packageConfig, {
            spaces: config.indentSpaces,
          });
          console.log('Updated package.json scripts');
        }
      }
    }
  )
  .command(
    'extract',
    'extract all files which not existed translation key',
    () => {},
    (argv) => {
      console.log('Start extract files');
      console.log('File matched: ' + config.extractor.input.join(', '));
      buildTranslationFile({
        input: config.extractor.input,
        output: path.resolve(process.cwd(), config.extractor.output),
        defaultLng: config.defaultLocale,
        lngs: config.locales,
        ns: config.namespaces,
        verbose: config.verbose,
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
          verbose: config.verbose,
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
  .command(
    'translate',
    'translate untranslated text',
    (yargs) =>
      yargs
        .choices('translator', ['prompt', 'openai'])
        .default('translator', config.translator.type),
    async (args) => {
      const defaultLocale = config.defaultLocale;
      const translationFiles: Record<string, Record<string, string>> = {};

      for (const locale of config.locales) {
        const targetFile = `${config.publicDir}/locales/${locale}/translation.json`;
        const json = await fs.readJson(targetFile);

        translationFiles[locale] = json;
      }

      console.log(`Loaded ${config.locales.length} files`);

      const untranslated: Record<string, Record<string, string>> = {};

      const transLocales = config.locales.filter(
        (locale) => locale !== defaultLocale
      );

      for (const locale of transLocales) {
        untranslated[locale] = findSameValueMap(
          translationFiles[defaultLocale],
          translationFiles[locale]
        );
      }

      const translator = args.translator;

      console.log(`Running translator: ${translator}`);

      let newLocales: Record<string, Record<string, string>> = {};
      if (translator === 'prompt') {
        console.log('Waiting for translate summary:');
        Object.entries(untranslated).forEach(([locale, trans]) => {
          console.log(`  ${locale}: ${Object.keys(trans).length}`);
        });

        console.log('----------------');

        console.log(generateLLMTranslatePrompt(untranslated));

        console.log('----------------');

        console.log(
          'Please copy above prompt into LLM and paste result json into here one by one'
        );

        const answers: Record<string, string> = await inquirer.prompt(
          transLocales.map((locale) => ({
            type: 'editor',
            name: locale,
            message: `${locale} translation(json format)`,
          }))
        );

        newLocales = transLocales.reduce((prev, locale) => {
          const jsonStr = answers[locale];

          if (!jsonStr) {
            console.log(`${locale} is empty, skip.`);
            return prev;
          }

          try {
            const json = JSON.parse(jsonStr);
            return {
              ...prev,
              [locale]: json,
            };
          } catch {
            console.warn(`${locale} is error, skip:`);
            console.warn(jsonStr);
            return prev;
          }
        }, {});
      } else if (translator === 'openai') {
        const res = await generateTranslationFromOpenai(untranslated);

        newLocales = transLocales.reduce((prev, locale) => {
          const jsonStr = res[locale];

          if (!jsonStr) {
            console.log(`${locale} is empty, skip.`);
            return prev;
          }

          try {
            const json = JSON.parse(jsonStr);
            return {
              ...prev,
              [locale]: json,
            };
          } catch {
            console.warn(`${locale} is error, skip:`);
            console.warn(jsonStr);
            return prev;
          }
        }, {});
      }

      for (const locale in newLocales) {
        const json = newLocales[locale];

        const targetFile = `${config.publicDir}/locales/${locale}/translation.json`;
        await fs.writeJson(
          targetFile,
          mergeObject(translationFiles[locale], json),
          {
            spaces: config.indentSpaces,
          }
        );

        console.log(
          `Writing ${
            Object.keys(json).length
          } translation into file \`${locale}\``
        );
      }
    }
  )
  .help()
  .parse();
