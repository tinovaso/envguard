export type EnvVarType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json';

export interface EnvVarDefinition<T = unknown> {
  /** The expected type of the environment variable */
  type: EnvVarType;
  /** Whether the variable is required (default: true) */
  required?: boolean;
  /** Default value if the variable is not set */
  default?: T;
  /** Human-readable description for documentation */
  description?: string;
  /** Whether to mask the value in logs/reports */
  sensitive?: boolean;
  /** Allowed values (enum-like validation) */
  allowedValues?: T[];
  /** Custom validation function */
  validate?: (value: T) => boolean | string;
  /** Example value for documentation */
  example?: string;
}

export type SchemaShape = Record<string, EnvVarDefinition>;

export type InferSchemaType<S extends SchemaShape> = {
  [K in keyof S]: S[K]['type'] extends 'number'
    ? number
    : S[K]['type'] extends 'boolean'
    ? boolean
    : S[K]['type'] extends 'json'
    ? unknown
    : string;
};

export interface SchemaMetadata {
  key: string;
  definition: EnvVarDefinition;
}
