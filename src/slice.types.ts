export interface SliceOptions {
  /** Keys to include in the slice */
  keys: string[];
  /** Whether to throw if a key is missing from the source */
  strict?: boolean;
}

export interface SliceResult<T extends Record<string, unknown>> {
  /** The sliced subset of the environment */
  slice: Partial<T>;
  /** Keys that were requested but not found in source */
  missing: string[];
  /** Keys that were successfully extracted */
  matched: string[];
}

export type SliceMap<
  T extends Record<string, unknown>,
  K extends keyof T
> = Pick<T, K>;
