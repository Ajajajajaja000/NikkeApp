# NIKKE Compass

『勝利の女神：NIKKE』の個人用・非商用「所持ニケ管理・編成支援・育成管理」Webアプリです。iPhone Safariを優先した静的SPAで、DB・ログイン・有料APIは使いません。

## 実装済み

- 日本語キャラ一覧（非公式NIKKE API、一覧だけ初回取得、詳細スキルは開いた時だけ取得）
- 名前、所持、属性、企業、武器、バーストの端末内検索・絞り込み
- 所持、凸・コア、レベル、スキル、4部位装備、オバロ、キューブ、コレクション、宝もの、メモ、育成目標
- BlablaLink共有URLから所持・レベル・凸／コア・戦闘力・スキル・装備・オバロ効果・キューブ・コレクションを一括取り込み
- 3日経過後の起動時自動取り込みと手動更新（常駐処理なし）。openidは端末内の別キーへ保存し、JSONバックアップには含めない
- キャンペーンのフルオート候補と、異常個体5ボスの属性対応候補
- バースト段階、代表的CT、レッドフードの再突入、回復、ゲージ、育成度を使う決定論ルール
- 育成お気に入り、不足一覧、コアダストのレベル帯別計算、時間ケース計算
- バージョン付きlocalStorage、JSONエクスポート／確認付きインポート、確認付き全削除
- PWAマニフェストとService Worker。マスターデータのみキャッシュし、ユーザープロフィール応答はキャッシュしない

夫婦で別端末から同じ公開URLを開けます。保存領域は端末ごとに独立し、自動同期しません。端末移行には設定画面のJSONバックアップを使います。

## Windows 11で起動

Node.js LTSとGitをインストール後、PowerShellで実行します。

```powershell
git clone <リポジトリURL>
cd NikkeApp
corepack enable
pnpm install
pnpm dev
```

表示された `http://localhost:5173` をブラウザで開きます。同じLANのiPhoneから確認する場合は、Windowsファイアウォールの許可後にPCのIPアドレスとポート5173へ接続します。

本番ビルドと確認:

```powershell
pnpm test
pnpm run build
pnpm preview
```

成果物は `dist/` に生成されます。`corepack` が使えないNode.js環境では、`npm install` と `npm run dev` / `npm run build` でも動作します。

## クレジットカード不要の無料公開

### GitHub Pages（推奨、GitHub Freeでは公開リポジトリ）

1. GitHubで公開リポジトリを作り、このリポジトリの `main` をpushします。個人入力はGitに含まれません。
2. GitHubの `Settings` → `Pages` → `Build and deployment` → `Source` で `GitHub Actions` を選びます。
3. 同梱の `.github/workflows/deploy-pages.yml` がテスト・ビルド後に `dist/` を公開します。
4. `Actions` の `Deploy NIKKE Compass to GitHub Pages` が成功すると、`https://<ユーザー名>.github.io/<リポジトリ名>/` で開けます。

Viteの出力は相対パス設定なので、リポジトリ名のサブパスでも動作します。GitHub FreeのPagesは公開リポジトリが対象です。

### Cloudflare Pages（代替）

Cloudflare Dashboardの `Workers & Pages` → `Create application` → `Pages` → `Connect to Git` からリポジトリを選びます。Build commandを `pnpm run build`、Output directoryを `dist`、Production branchを `main` に設定します。Freeプラン内の静的サイトで成立し、アプリ実行時の常駐Workerは不要です。

## API・ライブラリ・利用条件

- 非公式NIKKE API: 認証不要、CORS許可、日本語対応。作者が非公式・非商用を明記。ゲームデータと画像の権利は SHIFT UP / Level Infinite に帰属します。2026-11-03実測で一覧206体、マリアン：クイーン、レッドフードとラピ：レッドフードの別IDを確認しました。
- Loot & Waifus: 認証不要の静的JSON、CORS許可。英語中心で評価・推奨ビルドを含まないため、通常取得元には使っていません。
- React / Vite / Vitest: MIT License。
- TypeScript: Apache License 2.0。
- 編成のボス属性はPrydwen、コアダスト表はPrydwenとGameWithを2026-11-03に確認しています。URLと確認日はアプリの設定画面にも表示します。

APIや攻略情報は将来変更・停止される可能性があります。非公式NIKKE APIのリポジトリには一般的な再利用ライセンスが見当たらないため、API応答や画像を再配布せずブラウザから参照しています。

## 制約

- BlablaLink取り込みは本人の公開共有URLが必要です。全員分をまとめる `/roster` を手動または3日経過後のアプリ起動時に1回取得し、個別キャラへの大量リクエストは行いません。非公開プロフィール、上流障害、API仕様変更時は保存済みデータを保持して更新を中止します。
- 取り込み値と手入力値は分離し、表示は手入力を優先します。オバロ推奨は出典を確認できたキャラだけを表示し、未確認キャラへ推測値を表示しません。
- 編成は全スキル相互作用、ボス行動、操作精度、ダメージをシミュレーションしません。相対スコアは勝率やクリア保証ではありません。
- 素材数を確認できないスキル・装備・キューブ素材は数量計算せず、不足レベルだけを表示します。
- Safariのサイトデータ削除、プライベートブラウズ、OS都合でlocalStorageが消える可能性があります。定期的にJSONを書き出してください。
- iPhone実機検証は利用者側で必要です。開発時はiPhone 13・16を含む一般的な縦画面として390×844と430×932のブラウザエミュレーションを使用します。

設計と検証観点は [docs/architecture.md](docs/architecture.md) を参照してください。
