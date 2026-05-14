export type DiffChangeKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  kind: DiffChangeKind;
  prev?: string;
  next?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
  hasChanges: boolean;
}

export interface DiffOptions {
  /** Keys to treat as sensitive — values will be masked in output */
  sensitiveKeys?: string[];
  /** Only include changed entries in the result */
  changesOnly?: boolean;
  /** Custom mask string, defaults to '***' */
  mask?: string;
}
