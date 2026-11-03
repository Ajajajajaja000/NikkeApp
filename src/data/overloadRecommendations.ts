export interface OverloadRecommendation {
  resourceId: number;
  priorities: Array<{ effect: string; target: string; reason: string }>;
  cubes: string[];
  checked: string;
  sources: Array<{ label: string; url: string }>;
  classification: "複数ソースで頻出" | "単一ソース参考";
}

type Priority = [effect: string, target: string, reason?: string];

const nikkersSource = { label: "Nikkers API", url: "https://nikkers.cc/api" };
const nikkeGgSource = { label: "NIKKE.GG Overload Gear Priority", url: "https://nikke.gg/overload-gear-priority/" };
const checked = "2026-11-04";
const recommendation = (resourceId: number, priorities: Priority[], cubes: string[] = [], extraSources: OverloadRecommendation["sources"] = []): OverloadRecommendation => ({
  resourceId,
  priorities: priorities.map(([effect, target, reason]) => ({ effect, target, reason: reason ?? "複数のキャラ別ビルドで頻出する目安" })),
  cubes,
  checked,
  sources: [nikkersSource, nikkeGgSource, ...extraSources],
  classification: "複数ソースで頻出",
});

// NikkersとNIKKE.GGのキャラ別記載を照合し、両方で頻出する効果と目安をresourceIdで対応付ける。
// 名称の部分一致は「レッドフード」と「ラピ：レッドフード」を混同するため使用しない。
const recommendations: OverloadRecommendation[] = [
  recommendation(19, [["有利コードダメージ増加", "4枠"], ["攻撃力増加", "4枠"], ["最大装弾数増加", "2枠"], ["クリティカルダメージ増加", "2枠"]], ["レリックレジリエンスキューブ", "レリックベアーキューブ"]),
  recommendation(16, [["最大装弾数増加", "1〜2枠", "ラピ：レッドフード向け。正式名称とresourceIdで識別"]]),
  recommendation(470, [["最大装弾数増加", "最低1〜2枠", "レッドフード向け。ラピ：レッドフードとは別データ"]]),
  recommendation(840, [["クリティカル確率増加", "4枠"], ["クリティカルダメージ増加", "ミランダ編成では4枠候補"]]),
  recommendation(315, [["最大装弾数増加", "1〜2枠"], ["チャージ速度増加", "合計約4.1%以上（1〜2枠）"]]),
  recommendation(191, [["最大装弾数増加", "2枠"], ["チャージ速度増加", "合計約8.2%以上（1〜2枠）"]]),
  recommendation(195, [["最大装弾数増加", "1〜4枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(355, [["最大装弾数増加", "1〜4枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(15, [["攻撃力増加", "優先"], ["有利コードダメージ増加", "優先"], ["クリティカル系", "残り枠"], ["最大装弾数増加", "避ける"]]),
  recommendation(17, [["有利コードダメージ増加", "4枠"], ["攻撃力増加", "4枠"], ["最大装弾数・クリティカル系", "残り枠"]], ["レリックレジリエンスキューブ", "最大装弾数4枠時はレリックベアーキューブも候補"]),
  recommendation(581, [["最大装弾数増加", "1〜4枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(830, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(835, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(270, [["最大装弾数増加", "1〜2枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(520, [["チャージ速度増加", "合計約4.6%以上"], ["最大装弾数増加", "1〜2枠"]]),
  recommendation(73, [["攻撃力増加", "4枠"]]),
  recommendation(860, [["有利コードダメージ増加", "4枠"], ["攻撃力増加", "4枠"], ["最大装弾数増加", "2枠"], ["クリティカル確率・ダメージ", "各2枠候補"]]),
  recommendation(511, [["最大装弾数増加", "1〜2枠"], ["クリティカル確率増加", "3枠", "攻撃系オプション合計4枠を目安"]]),
  recommendation(515, [["有利コードダメージ増加", "優先"], ["攻撃力増加", "優先"], ["最大装弾数・クリティカルダメージ", "残り枠"], ["チャージ速度増加", "不要"]]),
  recommendation(330, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(43, [["最大装弾数増加", "1〜2枠"], ["チャージ速度増加", "合計約4.7%以上"]]),
  recommendation(23, [["最大装弾数増加", "1〜4枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(75, [["有利コードダメージ増加", "優先"], ["攻撃力増加", "優先"], ["最大装弾数増加", "残り枠"]]),
  recommendation(233, [["攻撃力増加", "優先"], ["有利コードダメージ増加", "優先"], ["クリティカル系", "残り枠"], ["最大装弾数増加", "避ける"]]),
  recommendation(234, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(101, [["命中率増加", "合計約9.4%以上"]]),
  recommendation(391, [["チャージ速度増加", "合計約3.6%以上"]]),
  recommendation(210, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(514, [["命中率増加", "合計約7.1%以上"], ["攻撃力・有利コード・クリティカル系", "残り枠"], ["最大装弾数増加", "避ける"]]),
  recommendation(182, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(352, [["チャージ速度増加", "合計約6.2%以上"], ["最大装弾数増加", "1〜2枠"]]),
  recommendation(150, [["クリティカル確率増加", "2枠"], ["クリティカルダメージ増加", "2枠"]]),
  recommendation(103, [["攻撃力増加", "最優先"], ["最大装弾数増加", "次点"]]),
  recommendation(262, [["チャージ速度増加", "合計約5.1%以上"], ["最大装弾数増加", "1〜2枠"]]),
  recommendation(513, [["最大装弾数増加", "1〜2枠"], ["命中率増加", "合計約7.6%以上"]]),
  recommendation(194, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(183, [["チャージ速度増加", "合計約4.1%以上"]]),
  recommendation(290, [["最大装弾数増加", "1〜2枠"], ["クリティカル確率増加", "4枠"]]),
  recommendation(322, [["有利コードダメージ増加", "優先"], ["攻撃力増加", "優先"], ["最大装弾数・クリティカル系", "残り枠"]], ["レリックレジリエンスキューブ", "レリックベアーキューブ"]),
  recommendation(832, [["最大装弾数増加", "1〜2枠"], ["チャージ速度増加", "合計約6%以上"]]),
  recommendation(102, [["チャージ速度増加", "合計約3.4%以上"]]),
  recommendation(105, [["最大HP増加", "優先"], ["攻撃力増加", "次点"]]),
  recommendation(162, [["最大装弾数増加", "1〜2枠"], ["クリティカル確率増加", "3枠"], ["クリティカルダメージ増加", "ミランダ編成では4枠候補"]]),
  recommendation(143, [["最大装弾数増加", "2〜3枠"], ["クリティカル確率増加", "2枠"]]),
  recommendation(32, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(260, [["最大装弾数増加", "1〜2枠"], ["命中率増加", "合計約8.8%以上"]]),
  recommendation(223, [["命中率増加", "合計約8.1%以上"], ["チャージダメージ増加", "4枠"]]),
  recommendation(18, [["有利コードダメージ・攻撃力", "優先"], ["最大装弾数増加", "高数値1枠"], ["チャージ速度・クリティカルダメージ", "残り枠"]]),
  recommendation(271, [["最大装弾数増加", "1〜2枠"], ["防御力増加", "1〜4枠"]]),
  recommendation(313, [["最大装弾数増加", "2枠"], ["クリティカル確率増加", "2枠"]]),
  recommendation(403, [["最大装弾数増加", "1〜2枠"], ["クリティカル確率増加", "1枠"]]),
  recommendation(851, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(834, [["最大装弾数増加", "最低2枠", "公開情報では暫定推奨"]]),
  recommendation(272, [["チャージ速度増加", "合計約4.9%以上"]]),
  recommendation(222, [["最大装弾数増加", "1〜2枠"]]),
  recommendation(225, [["チャージ速度増加", "合計約5.9%以上"]]),
  recommendation(471, [["有利コードダメージ・攻撃力", "優先"], ["最大装弾数増加", "1枠"], ["チャージ速度増加", "不要"]]),
  recommendation(314, [["最大装弾数増加", "1〜2枠"], ["クリティカル確率増加", "2枠"]]),
  recommendation(861, [["攻撃力・最大装弾数・有利コード", "優先"], ["チャージ速度増加", "次点"]]),
  recommendation(192, [["最大装弾数増加", "最低1〜2枠", "リロードを減らしてバフを維持しやすくする"], ["攻撃力増加", "優先候補", "与ダメージを伸ばす"], ["有利コードダメージ増加", "優先候補", "弱点属性へのダメージを伸ばす"]], [], [{ label: "GameWith：トーブ", url: "https://gamewith.jp/nikke/article/show/426750" }]),
  recommendation(316, [["チャージ速度増加", "2枠"], ["攻撃力増加", "4枠"], ["最大装弾数増加", "2枠"], ["有利コードダメージ増加", "4枠"]]),
];

const fallbackNameIds: Record<string, number> = {
  "マリアン：クイーン": 19,
  "ラピ：レッドフード": 16,
  "レッドフード": 470,
};

export function overloadRecommendation(resourceId: number | undefined, formalName: string): OverloadRecommendation | undefined {
  const key = resourceId ?? fallbackNameIds[formalName];
  return recommendations.find((item) => item.resourceId === key);
}

export const overloadRecommendationCount = recommendations.length;
