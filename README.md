# i18next-toolkit

Out-of-the-box i18n solution

## Use in react

```bash
npm install @i18next-toolkit/react
npm install -D @i18next-toolkit/cli
```

## Init project

```bash
npx i18next-toolkit init
```

Its will generate:

- locale translation files
- package.json scripts
- i18next-toolkit config file

### Add more language

modify `locales` fields in config file.

for example:

```json
"locales": [
  "en",
  "fr"
],
```

## Insert translation function in code text

```tsx
import { useTranslation } from '@i18next-toolkit/react';

function Foo() {
  const { t } = useTranslation();

  return <div>{t('Hello World')}</div>;
}
```

### Change language with api

```tsx
import { useTranslation, setLanguage } from '@i18next-toolkit/react';

function LanguageSwitcher() {
  const { t } = useTranslation();

  return (
    <div>
      <span>{t('Switch Language to')}:</span>
      <button style={{ margin: 10 }} onClick={() => setLanguage('en')}>
        en
      </button>
      <button onClick={() => setLanguage('fr')}>fr</button>
    </div>
  );
}
```

## Extract from source code

```bash
npm run translation:extract
```

Its will scan source code and generate matched translation file, for example:

```json
{
  "k4a17b156": "Hello World"
}
```

You can direct modify it. or use cli to translate it.

### Translate with external tools

you can use `npm run translation:translate` to quick translation with external tools.

default its will create a i18n prompt for you to translate. you can direct translation with ChatGPT.

or use this GPTs: [i18next-toolkit-translator](https://chat.openai.com/g/g-vcMCn5a88-i18next-toolkit-translator)

### Scan source code to avoid untranslated text

```bash
npm run translation:scan
```

to scan source code and avoid untranslated text, its useful in CI/CD workflow.

> This feature is base on typescript api, so its will only support typescript language(include js, exclude coffeescript、vue and so on)

## Translation with LLM

```bash
npm run translation:translate
```

You can follow the tip to copy the prompt word into any LLM conversation and enter the json object returned by LLM in the cli.

or direct update with chatgpt

```bash
npm run translation:translate --translator openai
```

but you need your local `.env` file has this key: `OPENAPI_KEY`


## Configuration

You can use follow config name:

- `.i18next-toolkitrc.json`
- `.i18next-toolkitrc.yaml`
- `.i18next-toolkitrc.yml`
- `i18next-toolkit.config.js`
- `i18next-toolkit.config.ts`
- `i18next-toolkit.config.mjs`
- `i18next-toolkit.config.cjs`

You can checkout schema with this file: [config.ts](./packages/cli/src/config.ts)
