import type { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export function Guard<T extends TSchema>(value: unknown, schema: T): Static<T> {
  if (Value.Check(schema, value)) {
    return;
  }
  throw new Error('Validation failed: Object does not match the schema.');
}
