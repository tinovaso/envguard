/**
 * Mapped types for inferring the TypeScript output type
 * from a CoerceType annotation in an EnvSchema field.
 */

import type { CoerceType } from './coerce';

/** Maps a CoerceType string literal to its corresponding TypeScript type. */
export type InferCoerced<T extends CoerceType> =
  T extends 'string'  ? string  :
  T extends 'number'  ? number  :
  T extends 'boolean' ? boolean :
  T extends 'json'    ? unknown :
  never;

/**
 * Describes a single environment variable field definition,
 * including its coerce type, whether it is required, and optional metadata.
 */
export interface EnvFieldDefinition<T extends CoerceType = 'string'> {
  type: T;
  required?: boolean;
  default?: InferCoerced<T>;
  description?: string;
  sensitive?: boolean;
}

/**
 * A schema is a record of field names to their definitions.
 * The generic parameter constrains each field's coerce type independently.
 */
export type EnvFieldSchema = Record<string, EnvFieldDefinition<CoerceType>>;

/**
 * Infers the fully-typed output object from a given schema.
 * Required fields are non-optional; fields with defaults or optional are `| undefined`.
 */
export type InferEnvOutput<S extends EnvFieldSchema> = {
  [K in keyof S]:
    S[K] extends EnvFieldDefinition<infer T extends CoerceType>
      ? S[K]['required'] extends true
        ? InferCoerced<T>
        : S[K]['default'] extends InferCoerced<T>
          ? InferCoerced<T>
          : InferCoerced<T> | undefined
      : never;
};
