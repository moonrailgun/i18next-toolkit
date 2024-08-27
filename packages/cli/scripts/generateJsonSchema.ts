import { zodToJsonSchema } from 'zod-to-json-schema';
import { configSchema } from '../src/config';
import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

const jsonSchema = zodToJsonSchema(
  z
    .object({
      $schema: z
        .string()
        .optional()
        .describe(
          'Pointer to the schema against which this document should be validated.'
        ),
    })
    .merge(configSchema),
  'i18next-toolkit-config'
);

const target = path.resolve(__dirname, '../config-schema.json');
fs.writeJSON(target, jsonSchema, {
  spaces: 2,
}).then(() => {
  console.log('Schema file has been write into:', target);
});
