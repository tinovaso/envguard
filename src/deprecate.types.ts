export interface DeprecatedFieldMeta {
  /**
   * Mark a field as deprecated. Provide a string message or set to true
   * to use the default deprecation message.
   */
  deprecated?: boolean | string;

  /**
   * The key of the replacement environment variable, if any.
   */
  deprecatedReplacement?: string;

  /**
   * The semver version in which this field will be removed.
   */
  removeInVersion?: string;
}

/**
 * Result of scanning the schema for deprecated fields that are still in use.
 */
export interface DeprecationScanResult {
  hasWarnings: boolean;
  warnings: Array<{
    key: string;
    message: string;
    replacement?: string;
    removeInVersion?: string;
    currentValue?: string;
  }>;
  formatted: string;
}
