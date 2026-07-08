import { config } from '../config';

export function generateLLMTranslatePrompt(
  untranslated: Record<string, Record<string, string>>
): string {
  const terms = config.translator?.terms ?? [];
  const termsInstruction =
    terms.length > 0
      ? '\n\nThe following proper nouns MUST be kept in their original form and never translated:\n' +
        terms.map((term) => `- ${term}`).join('\n')
      : '';

  return (
    'Please make sure all result should return with code block.' +
    termsInstruction +
    '\n\n' +
    Object.entries(untranslated)
      .map(([locale, trans]) => {
        return `Please help me translate those file to \`${locale}\`:\n\n${JSON.stringify(
          trans,
          null,
          2
        )}`;
      })
      .join('\n\n')
  );
}
