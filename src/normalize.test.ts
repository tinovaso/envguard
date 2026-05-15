import {
  applyNormalizeRule,
  normalizeValue,
  normalizeEnv,
  formatNormalizeReport,
} from "./normalize";

describe("applyNormalizeRule", () => {
  it("trims whitespace", () => {
    expect(applyNormalizeRule("  hello  ", "trim")).toBe("hello");
  });

  it("trims start only", () => {
    expect(applyNormalizeRule("  hello  ", "trimStart")).toBe("hello  ");
  });

  it("trims end only", () => {
    expect(applyNormalizeRule("  hello  ", "trimEnd")).toBe("  hello");
  });

  it("lowercases value", () => {
    expect(applyNormalizeRule("HELLO", "lowercase")).toBe("hello");
  });

  it("uppercases value", () => {
    expect(applyNormalizeRule("hello", "uppercase")).toBe("HELLO");
  });

  it("collapses internal whitespace", () => {
    expect(applyNormalizeRule("  foo   bar  ", "collapseWhitespace")).toBe("foo bar");
  });

  it("returns value unchanged for unknown rule", () => {
    // @ts-expect-error testing unknown rule
    expect(applyNormalizeRule("hello", "unknown")).toBe("hello");
  });
});

describe("normalizeValue", () => {
  it("applies multiple rules in order", () => {
    expect(normalizeValue("  HELLO WORLD  ", { rules: ["trim", "lowercase"] })).toBe(
      "hello world"
    );
  });

  it("handles empty rules array", () => {
    expect(normalizeValue("  hello  ", { rules: [] })).toBe("  hello  ");
  });
});

describe("normalizeEnv", () => {
  const env = { APP_NAME: "  MyApp  ", PORT: "8080", LOG_LEVEL: "DEBUG" };

  it("normalizes specified keys", () => {
    const { env: updated, results } = normalizeEnv(env, ["APP_NAME", "LOG_LEVEL"], {
      rules: ["trim", "lowercase"],
    });
    expect(updated.APP_NAME).toBe("myapp");
    expect(updated.LOG_LEVEL).toBe("debug");
    expect(updated.PORT).toBe("8080");
    expect(results).toHaveLength(2);
  });

  it("marks changed flag correctly", () => {
    const { results } = normalizeEnv(env, ["PORT"], { rules: ["trim"] });
    expect(results[0].changed).toBe(false);
  });

  it("skips keys not present in env", () => {
    const { results } = normalizeEnv(env, ["MISSING_KEY"], { rules: ["trim"] });
    expect(results).toHaveLength(0);
  });
});

describe("formatNormalizeReport", () => {
  it("returns no-change message when nothing changed", () => {
    const report = formatNormalizeReport([
      { key: "PORT", original: "8080", normalized: "8080", changed: false },
    ]);
    expect(report).toBe("No normalization changes.");
  });

  it("lists changed keys", () => {
    const report = formatNormalizeReport([
      { key: "APP_NAME", original: "  MyApp  ", normalized: "myapp", changed: true },
    ]);
    expect(report).toContain("Normalized 1 key(s)");
    expect(report).toContain("APP_NAME");
    expect(report).toContain("myapp");
  });
});
