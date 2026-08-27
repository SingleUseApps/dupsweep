import { describe, it, expect } from "vitest";
import { sanitizeDecimalInput, parseLocaleFloat } from "./locale";

describe("sanitizeDecimalInput", () => {
  it("keeps digits and strips letters/symbols", () => {
    expect(sanitizeDecimalInput("1a2b3", ".")).toBe("123");
  });

  it("keeps a single decimal separator", () => {
    expect(sanitizeDecimalInput("0.5", ".")).toBe("0.5");
    expect(sanitizeDecimalInput("0,5", ",")).toBe("0,5");
  });

  it("drops the separator character that doesn't match this locale", () => {
    expect(sanitizeDecimalInput("0,5", ".")).toBe("05");
  });

  it("only keeps the first occurrence of repeated separators", () => {
    expect(sanitizeDecimalInput("1.2.3", ".")).toBe("1.23");
    expect(sanitizeDecimalInput("1,2,3", ",")).toBe("1,23");
  });
});

describe("parseLocaleFloat", () => {
  it("parses a dot-separated value", () => {
    expect(parseLocaleFloat("0.5", ".")).toBe(0.5);
  });

  it("parses a comma-separated value", () => {
    expect(parseLocaleFloat("0,5", ",")).toBe(0.5);
  });

  it("parses plain integers regardless of separator", () => {
    expect(parseLocaleFloat("500", ",")).toBe(500);
  });

  it("returns 0 for empty input", () => {
    expect(parseLocaleFloat("", ",")).toBe(0);
    expect(parseLocaleFloat(undefined, ",")).toBe(0);
  });
});
