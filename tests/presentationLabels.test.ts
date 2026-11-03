import { describe, expect, it } from "vitest";
import { burstLabel, corporationLabel, elementLabel, weaponLabel } from "../src/presentation/labels";

describe("表示ラベル", () => {
  it("APIの内部表記を日本語へ変換する", () => {
    expect(elementLabel("Fire")).toBe("灼熱");
    expect(corporationLabel("PILGRIM")).toBe("ピルグリム");
    expect(weaponLabel("MG")).toBe("マシンガン");
    expect(burstLabel(["I", "II", "III"])).toBe("バーストI/II/III");
  });
});
