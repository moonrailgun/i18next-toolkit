import { zodToJsonSchema } from '@alcyone-labs/zod-to-json-schema';
import { configSchema } from '../src/config';
import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod/v4';

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
    .extend(configSchema.shape),
  'i18next-toolkit-config'
);

const target = path.resolve(__dirname, '../config-schema.json');
fs.writeJSON(target, jsonSchema, {
  spaces: 2,
}).then(() => {
  console.log('Schema file has been write into:', target);
});
