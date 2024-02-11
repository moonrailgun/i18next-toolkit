export function stripQuote(input: string): string {
  return input.replace(/^["'](.*?)["']$/, '$1');
}
