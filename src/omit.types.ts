import { SchemaShape } from './schema.types';

/**
 * Result of an omit operation, pairing the reduced env and schema.
 */
export interface OmitResult<
  T extends Record<string, unknown>,
  K extends keyof T
> {
  env: Omit<T, K>;
  schema: SchemaShape;
  omittedKeys: K[];
}

/**
 * Options for omitWhere predicate-based omission.
 */
export interface OmitWhereOptions {
  /** If true, also remove the corresponding key from the schema. */
  pruneSchema?: boolean;
  /** Callback invoked for each omitted key. */
  onOmit?: (key: string, value: unknown) => void;
}
