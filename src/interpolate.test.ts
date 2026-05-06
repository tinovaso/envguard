import { describe, it, expect } from "vitest";
import {
  interpolate,
  interpolateAll,
  InterpolationError,
} from "./interpolate";

describe("interpolate", () => {
  it("replaces ${VAR} syntax with context value", () => {
    const result = interpolate("DB_URL", "postgres://${DB_HOST}:5432/db", {
      DB_HOST: "localhost",
    });
    expect(result).toBe("postgres://localhost:5432/db");
  });

  it("replaces $VAR bare syntax with context value", () => {
    const result = interpolate("FULL_NAME", "$FIRST $LAST", {
      FIRST: "John",
      LAST: "Doe",
    });
    expect(result).toBe("John Doe");
  });

  it("handles multiple references in a single value", () => {
    const result = interpolate(
      "API_URL",
      "${SCHEME}://${HOST}:${PORT}/api",
      { SCHEME: "https", HOST: "example.com", PORT: "443" }
    );
    expect(result).toBe("https://example.com:443/api");
  });

  it("returns value unchanged when no references present", () => {
    const result = interpolate("PLAIN", "no-references-here", {});
    expect(result).toBe("no-references-here");
  });

  it("throws InterpolationError when referenced variable is missing", () => {
    expect(() =>
      interpolate("DB_URL", "postgres://${DB_HOST}/db", {})
    ).toThrow(InterpolationError);
  });

  it("InterpolationError contains key and referenced var", () => {
    try {
      interpolate("DB_URL", "${MISSING_VAR}", {});
    } catch (err) {
      expect(err).toBeInstanceOf(InterpolationError);
      expect((err as InterpolationError).variable).toBe("DB_URL");
      expect((err as InterpolationError).referencedVar).toBe("MISSING_VAR");
    }
  });
});

describe("interpolateAll", () => {
  it("interpolates all string values using shared context", () => {
    const env = {
      HOST: "localhost",
      PORT: "5432",
      DB_URL: "postgres://${HOST}:${PORT}/mydb",
    };
    const result = interpolateAll(env);
    expect(result["DB_URL"]).toBe("postgres://localhost:5432/mydb");
  });

  it("passes non-string values through unchanged", () => {
    const env = { COUNT: 42, ENABLED: true, NAME: "app" };
    const result = interpolateAll(env as Record<string, unknown>);
    expect(result["COUNT"]).toBe(42);
    expect(result["ENABLED"]).toBe(true);
  });

  it("accepts an explicit context separate from env", () => {
    const env = { GREETING: "Hello, ${USER}!" };
    const context = { USER: "world" };
    const result = interpolateAll(env, context);
    expect(result["GREETING"]).toBe("Hello, world!");
  });

  it("throws if any value references an undefined variable", () => {
    const env = { BAD: "${NOPE}" };
    expect(() => interpolateAll(env)).toThrow(InterpolationError);
  });
});
