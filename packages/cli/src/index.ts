#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import path from 'path';
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
import { findSameValueMap, mergeObject } from './utils';
import { generateLLMTranslatePrompt } from './translator/llm';
import inquirer from 'inquirer';
import { generateTranslationFromOpenai } from './translator/openai';
import { generateTranslationFromMicrosoft } from './translator/microsoft';
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
        await fs.writeJson(
          configPath,
          {
            $schema: './node_modules/@i18next-toolkit/cli/config-schema.json',
            ...configSchema.parse({}),
          },
          {
            spaces: config.indentSpaces,
          }
        );
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
        .choices('translator', ['prompt', 'openai', 'microsoft'])
        .default('translator', config.translator.type),
    async (args) => {
      const defaultLocale = config.defaultLocale;
      // 存储所有语言和命名空间的翻译文件
      const translationFiles: Record<
        string,
        Record<string, Record<string, string>>
      > = {};

      // 加载所有语言和命名空间的翻译文件
      for (const locale of config.locales) {
        translationFiles[locale] = {};
        for (const namespace of config.namespaces) {
          const targetFile = `${config.publicDir}/locales/${locale}/${namespace}.json`;
          try {
            const json = await fs.readJson(targetFile);
            translationFiles[locale][namespace] = json;
          } catch (error) {
            console.warn(`File not found: ${targetFile}, creating empty file`);
            translationFiles[locale][namespace] = {};
            // 确保目录存在
            await fs.mkdirp(path.dirname(targetFile));
            await fs.writeJson(targetFile, {}, { spaces: config.indentSpaces });
          }
        }
      }

      console.log(
        `Loaded translation files for ${config.locales.length} locales across ${config.namespaces.length} namespaces`
      );

      const untranslated: Record<
        string,
        Record<string, Record<string, string>>
      > = {};

      const transLocales = config.locales.filter(
        (locale) => locale !== defaultLocale
      );

      // Find content that needs to be translated in each language and namespace
      for (const locale of transLocales) {
        untranslated[locale] = {};
        for (const namespace of config.namespaces) {
          untranslated[locale][namespace] = findSameValueMap(
            translationFiles[defaultLocale][namespace],
            translationFiles[locale][namespace]
          );
        }
      }

      // Helper function: Process translation results for a single language and write to file
      async function processTranslationAndWriteFile(
        locale: string,
        namespace: string,
        jsonStr: string
      ) {
        if (!jsonStr) {
          console.log(`${locale}/${namespace} is empty, skip.`);
          return null;
        }

        try {
          const json = JSON.parse(jsonStr);

          // Immediately write translation results to file
          const targetFile = `${config.publicDir}/locales/${locale}/${namespace}.json`;
          await fs.writeJson(
            targetFile,
            mergeObject(translationFiles[locale][namespace], json),
            {
              spaces: config.indentSpaces,
            }
          );

          console.log(
            `Writing ${
              Object.keys(json).length
            } translations into file \`${locale}/${namespace}\``
          );

          return json;
        } catch (error) {
          console.warn(`${locale}/${namespace} translation error, skip:`);
          console.warn(jsonStr);
          return null;
        }
      }

      const translator = args.translator;

      console.log(`Running translator: ${translator}`);

      if (translator === 'prompt') {
        console.log('Waiting for translate summary:');
        // Display the number of translations needed for each language and namespace
        Object.entries(untranslated).forEach(([locale, namespaces]) => {
          console.log(`  ${locale}:`);
          Object.entries(namespaces).forEach(([namespace, trans]) => {
            console.log(`    ${namespace}: ${Object.keys(trans).length}`);
          });
        });

        // Generate translation prompts for each language and namespace
        for (const locale of transLocales) {
          for (const namespace of config.namespaces) {
            if (Object.keys(untranslated[locale][namespace]).length === 0) {
              console.log(
                `${locale}/${namespace} has no words to translate, skip.`
              );
              continue;
            }

            console.log(`\nTranslating ${locale}/${namespace}:`);
            console.log('----------------');
            console.log(
              generateLLMTranslatePrompt({
                [locale]: untranslated[locale][namespace],
              })
            );
            console.log('----------------');
            console.log(
              'Please copy above prompt into LLM and paste result json below'
            );

            const answer = await inquirer.prompt([
              {
                type: 'editor',
                name: 'translation',
                message: `${locale}/${namespace} translation (json format)`,
              },
            ]);

            const jsonStr = answer.translation;
            await processTranslationAndWriteFile(locale, namespace, jsonStr);
          }
        }
      } else if (translator === 'openai') {
        // Call translation API separately for each language and namespace
        for (const locale of transLocales) {
          for (const namespace of config.namespaces) {
            if (Object.keys(untranslated[locale][namespace]).length === 0) {
              console.log(
                `${locale}/${namespace} has no words to translate, skip.`
              );
              continue;
            }

            console.log(`Translating ${locale}/${namespace} with OpenAI`);
            const res = await generateTranslationFromOpenai({
              [locale]: untranslated[locale][namespace],
            });

            const jsonStr = res[locale];
            await processTranslationAndWriteFile(locale, namespace, jsonStr);
          }
        }
      } else if (translator === 'microsoft') {
        // Call translation API separately for each language and namespace
        for (const locale of transLocales) {
          for (const namespace of config.namespaces) {
            if (Object.keys(untranslated[locale][namespace]).length === 0) {
              console.log(
                `${locale}/${namespace} has no words to translate, skip.`
              );
              continue;
            }

            console.log(
              `Translating ${locale}/${namespace} with Microsoft Translator`
            );
            const res = await generateTranslationFromMicrosoft(
              { [locale]: untranslated[locale][namespace] },
              defaultLocale
            );

            const jsonStr = res[locale];
            await processTranslationAndWriteFile(locale, namespace, jsonStr);
          }
        }
      }
    }
  )
  .help()
  .parse();
