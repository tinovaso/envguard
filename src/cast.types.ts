export type CastTarget = 'string' | 'number' | 'boolean' | 'json' | 'array' | 'date';

export interface CastOptions {
  target: CastTarget;
  delimiter?: string; // for array casting
  strict?: boolean;   // throw on ambiguous values
}

export interface CastResult<T = unknown> {
  value: T;
  original: string;
  target: CastTarget;
  changed: boolean;
}

export type CastMap = Partial<Record<string, CastTarget>>;

export interface CastEnvOptions {
  map: CastMap;
  delimiter?: string;
  strict?: boolean;
  skipMissing?: boolean;
}

export interface CastEnvResult {
  values: Record<string, unknown>;
  results: Record<string, CastResult>;
  errors: Array<{ key: string; message: string }>;
}
