export function generateLLMTranslatePrompt(
  untranslated: Record<string, Record<string, string>>
): string {
  return (
    'Please make sure all result should return with code block.\n\n' +
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
