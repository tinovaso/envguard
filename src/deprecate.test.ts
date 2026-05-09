import {
  extractDeprecated,
  checkDeprecations,
  formatDeprecationWarnings,
} from "./deprecate";

const schema = {
  DATABASE_URL: { type: "string" as const, required: true },
  OLD_API_KEY: {
    type: "string" as const,
    deprecated: "OLD_API_KEY is deprecated.",
    deprecatedReplacement: "API_KEY",
    removeInVersion: "2.0.0",
  },
  LEGACY_PORT: {
    type: "number" as const,
    deprecated: true,
  },
};

describe("extractDeprecated", () => {
  it("returns only deprecated fields", () => {
    const result = extractDeprecated(schema);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.key)).toEqual(["OLD_API_KEY", "LEGACY_PORT"]);
  });

  it("uses custom message when provided", () => {
    const result = extractDeprecated(schema);
    expect(result[0].message).toBe("OLD_API_KEY is deprecated.");
  });

  it("uses default message when deprecated is true", () => {
    const result = extractDeprecated(schema);
    expect(result[1].message).toBe("'LEGACY_PORT' is deprecated.");
  });

  it("includes replacement and version info", () => {
    const result = extractDeprecated(schema);
    expect(result[0].replacement).toBe("API_KEY");
    expect(result[0].removeInVersion).toBe("2.0.0");
  });
});

describe("checkDeprecations", () => {
  it("returns warnings only for keys present in env", () => {
    const env = { OLD_API_KEY: "abc123", DATABASE_URL: "postgres://localhost" };
    const warnings = checkDeprecations(schema, env);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].key).toBe("OLD_API_KEY");
    expect(warnings[0].currentValue).toBe("abc123");
  });

  it("returns empty array when no deprecated keys are in env", () => {
    const env = { DATABASE_URL: "postgres://localhost" };
    const warnings = checkDeprecations(schema, env);
    expect(warnings).toHaveLength(0);
  });
});

describe("formatDeprecationWarnings", () => {
  it("returns empty string when no warnings", () => {
    expect(formatDeprecationWarnings([])).toBe("");
  });

  it("formats warnings with replacement and version", () => {
    const warnings = checkDeprecations(schema, { OLD_API_KEY: "x" });
    const output = formatDeprecationWarnings(warnings);
    expect(output).toContain("OLD_API_KEY");
    expect(output).toContain("Use 'API_KEY' instead.");
    expect(output).toContain("removed in v2.0.0");
  });

  it("includes header line", () => {
    const warnings = checkDeprecations(schema, { OLD_API_KEY: "x" });
    const output = formatDeprecationWarnings(warnings);
    expect(output).toContain("[envguard] Deprecation warnings:");
  });
});
