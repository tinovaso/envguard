export type MaskChar = '*' | '#' | 'x' | 'X';

export interface MaskOptions {
  /** Character to use for masking. Defaults to '*' */
  char?: MaskChar;
  /** Number of characters to reveal at the start. Defaults to 0 */
  revealStart?: number;
  /** Number of characters to reveal at the end. Defaults to 0 */
  revealEnd?: number;
  /** Minimum length of the masked output. Defaults to 8 */
  minLength?: number;
  /** If true, always show the exact length of the value. Defaults to false */
  preserveLength?: boolean;
}

export interface MaskResult {
  original: string;
  masked: string;
  key: string;
}

export type MaskMap = Record<string, MaskResult>;
