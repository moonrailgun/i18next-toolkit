import { getTranslation } from './clients/i18n';

async function main() {
  const t = getTranslation('fr');

  return t('Hello world');
}

main()
  .then(console.log)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
