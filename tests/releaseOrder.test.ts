import { describe, expect, it } from "vitest";
import { compareByReleaseOrder, releaseOrderResourceIds } from "../src/data/releaseOrder";

describe("releaseOrder", () => {
  it("確認済み206体のresourceIdを重複なく保持する", () => {
    expect(releaseOrderResourceIds).toHaveLength(206);
    expect(new Set(releaseOrderResourceIds).size).toBe(206);
  });

  it("未登録の新キャラを確認済みキャラより先にする", () => {
    expect(compareByReleaseOrder(999999, releaseOrderResourceIds[0])).toBeLessThan(0);
  });
});
