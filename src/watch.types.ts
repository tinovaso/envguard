export interface WatchOptions {
  /** Interval in milliseconds to poll for changes (default: 5000) */
  interval?: number;
  /** Called when a variable changes */
  onChange?: (key: string, prev: string | undefined, next: string | undefined) => void;
  /** Called when validation fails after a change */
  onError?: (errors: WatchError[]) => void;
  /** Whether to log changes to console (default: false) */
  verbose?: boolean;
}

export interface WatchError {
  key: string;
  message: string;
}

export interface WatchHandle {
  /** Stop watching */
  stop: () => void;
  /** Force an immediate check */
  check: () => void;
  /** Whether the watcher is currently active */
  readonly active: boolean;
}

export interface EnvSnapshot {
  [key: string]: string | undefined;
}
