import { describe, expect, it } from "vitest";
import { communityPurposes, communityTeams } from "../src/data/communityTeams";

describe("communityTeams", () => {
  it("すべての用途に出典付きの5人編成がある", () => {
    for (const purpose of communityPurposes) {
      const teams = communityTeams.filter((team) => team.purpose === purpose.id);
      expect(teams.length).toBeGreaterThan(0);
      for (const team of teams) {
        expect(team.members).toHaveLength(5);
        expect(new Set(team.members.map((member) => member.resourceId)).size).toBe(5);
        expect(team.source.url).toMatch(/^https:\/\//);
        expect(team.source.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("クラーケン掲載編成を独自に組み替えていない", () => {
    const team = communityTeams.find((item) => item.id === "nikke-gg-kraken-best");
    expect(team?.members.map((member) => member.resourceId)).toEqual([513, 223, 262, 225, 330]);
  });

  it("レッドフードとラピ：レッドフードを別キャラとして保持する", () => {
    const team = communityTeams.find((item) => item.id === "nikke-gg-ultra-best");
    expect(team?.members.map((member) => member.resourceId)).toContain(470);
    expect(team?.members.map((member) => member.resourceId)).toContain(16);
  });
});
