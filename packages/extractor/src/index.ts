import vfs from 'vinyl-fs';
import sort from 'gulp-sort';
// @ts-ignore
import scanner from 'i18next-scanner';
import fs from 'fs-extra';
import { resolve, extname } from 'path';
import without from 'lodash.without';
import { crc32 } from 'crc';
import esbuild from 'esbuild';

interface BuildConfig {
  input: string[];
  output: string;
  defaultLng: string;
  lngs: string[];
  verbose?: boolean;
  options?: any;
  transform?: (
    this: any,
    file: any,
    enc: BufferEncoding,
    done: () => void
  ) => void;
}

const defaultConfigOptions = {
  debug: false,
  sort: true,
  func: false,
  trans: false,
  defaultLng: 'en',
  verbose: false,
  resource: {
    loadPath: './{{lng}}/{{ns}}.json',
    savePath: './{{lng}}/{{ns}}.json',
    jsonIndent: 2,
    lineEnding: '\n',
    endWithEmptyTrans: true,
  },
  removeUnusedKeys: true,
  nsSeparator: false, // namespace separator
  keySeparator: false, // key separator
  interpolation: {
    prefix: '{{',
    suffix: '}}',
  },
};

export async function buildTranslationFile(config: BuildConfig) {
  const defaultTranslationPath = `./${config.defaultLng}/translation.json`;
  const originJson = fs.readJsonSync(
    resolve(config.output, defaultTranslationPath)
  );

  const options = {
    ...defaultConfigOptions,
    lngs: config.lngs,
    ...config.options,
  };

  options.resource = {
    ...options.resource,
    loadPath: resolve(config.output, './{{lng}}/{{ns}}.json'),
    savePath: resolve(config.output, './{{lng}}/{{ns}}.json'),
  };

  const mainstream = vfs.src([...config.input]);

  if (config.verbose) {
    mainstream.on('data', (file) => console.log(`Scaning file: ${file.path}`));
  }

  mainstream
    .pipe(sort()) // Sort files in stream by path
    .pipe(scanner(options, config.transform))
    .pipe(vfs.dest('./'));

  mainstream.on('finish', () => {
    const transJson = fs.readJsonSync(
      resolve(config.output, defaultTranslationPath)
    );
    const originKeys = Object.keys(originJson);
    const transKeys = Object.keys(transJson);
    const addedNum = without(transKeys, ...originKeys).length;
    const deletededNum = without(originKeys, ...transKeys).length;

    console.log(
      `The project translation has been generated! Added ${addedNum} translations, Removed ${deletededNum} translations`
    );
  });
}

export async function defaultTransform(
  this: any,
  file: any,
  enc: BufferEncoding,
  done: (err?: any) => void
) {
  try {
    // Use this function to process key or value yourself
    ('use strict');
    const parser = this.parser;
    const content = await fs.readFile(file.path, enc);

    parser.parseFuncFromString(
      content,
      { list: ['lang', 't'] },
      (key: string, options: any) => {
        options.defaultValue = key;
        const hashKey = `k${crc32(key).toString(16)}`;
        parser.set(hashKey, options);
      }
    );

    // If it is a tsx file, use esbuild to convert it to jsx and then input it.
    if (extname(file.path) === '.tsx') {
      const { code } = await esbuild.transform(content, {
        jsx: 'preserve',
        loader: 'tsx',
      });
      parser.parseTransFromString(
        code,
        { component: 'Trans', i18nKey: 'i18nKey' },
        (key: string, options: any) => {
          /**
           * Deal with problems caused by inconsistency between scanner and react-i18next algorithms
           * Reference: https://github.com/i18next/i18next-scanner/issues/125
           */
          let sentence = options.defaultValue;
          // remove <Tag> surrounding interopations to match i18next simpilied result
          // @see https://github.com/i18next/react-i18next/blob/master/CHANGELOG.md#800
          sentence = sentence.replace(/<(\d+)>{{(\w+)}}<\/\1>/g, '{{$2}}');
          sentence = sentence.replace(/\s+/g, ' ');
          options.defaultValue = sentence;

          const hashKey = `k${crc32(key || sentence).toString(16)}`;
          parser.set(hashKey, options);
        }
      );
    }

    done();
  } catch (err) {
    done(err);
  }
}
