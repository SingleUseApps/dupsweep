import { describe, it, expect } from "vitest";
import { reorderKeeperFirst } from "./keepRule";

const f = (id, modification_date, size_bytes = 100) => ({ id, modification_date, size_bytes });

describe("reorderKeeperFirst", () => {
  it("is a no-op for manual", () => {
    const files = [f("a", 1), f("b", 2)];
    expect(reorderKeeperFirst(files, "manual")).toBe(files);
  });

  it("is a no-op for a single file or empty list", () => {
    const one = [f("a", 1)];
    expect(reorderKeeperFirst(one, "oldest")).toBe(one);
    expect(reorderKeeperFirst([], "oldest")).toEqual([]);
  });

  it("oldest: moves the earliest modification_date to the front", () => {
    const files = [f("a", 300), f("b", 100), f("c", 200)];
    const result = reorderKeeperFirst(files, "oldest");
    expect(result.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("newest: moves the latest modification_date to the front", () => {
    const files = [f("a", 100), f("b", 300), f("c", 200)];
    const result = reorderKeeperFirst(files, "newest");
    expect(result.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("already-first keeper returns the same array reference", () => {
    const files = [f("a", 100), f("b", 300)];
    expect(reorderKeeperFirst(files, "oldest")).toBe(files);
  });

  it("largest: moves the biggest size_bytes to the front", () => {
    const files = [f("a", 1, 10), f("b", 1, 999), f("c", 1, 50)];
    const result = reorderKeeperFirst(files, "largest");
    expect(result.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("largest: files are byte-identical duplicates in practice, so ties keep the first one", () => {
    const files = [f("a", 1, 100), f("b", 2, 100)];
    const result = reorderKeeperFirst(files, "largest");
    expect(result.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("missing modification_date sorts last for oldest/newest", () => {
    const files = [f("a", null), f("b", 100)];
    expect(reorderKeeperFirst(files, "oldest").map((x) => x.id)).toEqual(["b", "a"]);
    expect(reorderKeeperFirst(files, "newest").map((x) => x.id)).toEqual(["b", "a"]);
  });
});
