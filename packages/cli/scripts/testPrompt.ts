import { config as loadEnv } from 'dotenv';
import { testTranslatePrompt } from '../src/translator/openai';

loadEnv();

async function main() {
  const args = process.argv.slice(2);

  let modelsArg: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--models' || arg === '-m') {
      modelsArg = args[++i];
    } else if (arg.startsWith('--models=')) {
      modelsArg = arg.slice('--models='.length);
    } else {
      positional.push(arg);
    }
  }

  const [locale, ...texts] = positional;

  if (!locale || texts.length === 0) {
    console.error(
      'Usage: ts-node ./scripts/testPrompt.ts <locale> <text> [text...] [--models gpt-4o-mini,gpt-4o]'
    );
    process.exit(1);
  }

  const models = modelsArg
    ? modelsArg
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    : undefined;

  await testTranslatePrompt({ locale, texts, models });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
