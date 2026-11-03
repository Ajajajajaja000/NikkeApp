import { describe, expect, it } from "vitest";
import { communityPurposes, communityTeams } from "../src/data/communityTeams";

describe("communityTeams", () => {
  it("すべての用途に出典付きの5人編成がある", () => {
    for (const purpose of communityPurposes) {
      const teams = communityTeams.filter((team) => team.purpose === purpose.id);
      expect(teams.length).toBeGreaterThanOrEqual(2);
      for (const team of teams) {
        expect(team.members).toHaveLength(5);
        expect(new Set(team.members.map((member) => member.resourceId)).size).toBe(5);
        expect(team.source.url).toMatch(/^https:\/\//);
        expect(team.source.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(team.source.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(team.verification.length).toBeGreaterThan(0);
      }
    }
  });

  it("最新のミラーコンテナとハーベスター編成を掲載形のまま保持する", () => {
    expect(communityTeams.find((item) => item.id === "mirror-electric")?.members.map((member) => member.resourceId))
      .toEqual([511, 17, 15, 330, 183]);
    expect(communityTeams.find((item) => item.id === "harvester-balanced")?.members.map((member) => member.resourceId))
      .toEqual([17, 330, 471, 234, 352]);
    expect(communityTeams.filter((item) => item.purpose === "harvester")).toHaveLength(2);
  });

  it("クラーケン掲載編成を独自に組み替えていない", () => {
    const team = communityTeams.find((item) => item.id === "kraken-nayuta");
    expect(team?.members.map((member) => member.resourceId)).toEqual([513, 223, 262, 225, 330]);
    expect(team?.substitutions.find((item) => item.memberIndex === 0)?.candidates.map((item) => item.resourceId)).toEqual([17, 281]);
    expect(team?.substitutions.find((item) => item.memberIndex === 3)?.candidates.map((item) => item.resourceId)).toEqual([835, 284]);
  });

  it("代替候補を元の5枠へ対応付ける", () => {
    for (const team of communityTeams) {
      for (const substitution of team.substitutions) {
        expect(substitution.memberIndex).toBeGreaterThanOrEqual(0);
        expect(substitution.memberIndex).toBeLessThan(team.members.length);
        expect(substitution.candidates.length).toBeGreaterThan(0);
        expect(substitution.candidates.every((candidate) => candidate.name.length > 0)).toBe(true);
      }
    }
  });

  it("レッドフードとラピ：レッドフードを別キャラとして保持する", () => {
    const team = communityTeams.find((item) => item.id === "ultra-mast");
    expect(team?.members.map((member) => member.resourceId)).toContain(470);
    expect(team?.members.map((member) => member.resourceId)).toContain(16);
  });

  it("現在のキャンペーン掲載例にモダニアを混ぜていない", () => {
    const members = communityTeams.filter((item) => item.purpose === "campaign").flatMap((item) => item.members);
    expect(members.some((member) => member.name === "モダニア")).toBe(false);
  });

  it("キャンペーンは最新汎用編成と高戦力差向け編成を収録する", () => {
    expect(communityTeams.filter((item) => item.purpose === "campaign").map((item) => item.id)).toEqual([
      "gamewith-all-round", "gamewith-pilgrim-os", "prydwen-story-team-38",
    ]);
  });

  it("企業別トライブタワー4編成を掲載形のまま収録する", () => {
    const tribeTeams = communityTeams.filter((item) => item.purpose === "tribe");
    expect(tribeTeams.map((item) => item.id)).toEqual([
      "tribe-elysion", "tribe-missilis", "tribe-tetra", "tribe-pilgrim",
    ]);
    expect(tribeTeams.find((item) => item.id === "tribe-missilis")?.members.map((member) => member.resourceId))
      .toEqual([451, 82, 450, 18, 162]);
    expect(tribeTeams.find((item) => item.id === "tribe-pilgrim")?.members.map((member) => member.resourceId))
      .toEqual([17, 330, 16, 471, 162]);
  });
});
