import { SchemaShape } from './schema.types';

/**
 * Represents the result of merging two SchemaShapes.
 * Keys from B override keys from A when they overlap.
 */
export type MergedShape<A extends SchemaShape, B extends SchemaShape> = Omit<
  A,
  keyof B
> &
  B;

/**
 * Options for controlling merge behaviour.
 */
export interface MergeOptions {
  /** If true, throws when overlapping keys are detected between schemas. */
  strict?: boolean;
  /** If true, logs a warning when overlapping keys are found. */
  warnOnOverlap?: boolean;
}

/**
 * Result of a schema merge operation with metadata.
 */
export interface MergeResult<T extends SchemaShape> {
  schema: T;
  overlapping: string[];
  merged: number;
}
