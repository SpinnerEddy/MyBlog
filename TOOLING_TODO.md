# 開発支援ツール整備 TODO

`TODO.md`（サイトの機能・設計計画）とは別に、**サイトを実装していく上での土台・支援ツール**についてのタスクをまとめる。対象は以下の4点（前回のやり取りで方向性を確認済み）。

**状態: 4項目すべて完了（2026-07-20）。** 詳細は各章と `TODO.md` §10 を参照。

---

## 1. 前回作成物の削除

方向性がズレていたため、以下を削除する。

- [x] `.claude/skills/blog-content-conventions/`（記事執筆規約チェック用SKILL。サイトの土台が無い現状では時期尚早と判断）
- [x] `.claude/commands/new-post.md`（`/new-post`）
- [x] `.claude/commands/add-demo.md`（`/add-demo`）

---

## 2. Lint / Formatter整備（このプロジェクトに実際に導入する）

現状 `package.json` にESLint/Prettierの設定が一切無い。Astro 5 + TypeScript + Tailwind CSS v4 + MDX 構成に対応した形で、今すぐこのリポジトリにセットアップする。

- [x] 依存パッケージ追加
  - `eslint`（v9系、Flat Config）
  - `typescript-eslint`
  - `eslint-plugin-astro`（`.astro`ファイルのlint）
  - `prettier`
  - `prettier-plugin-astro`（`.astro`ファイルのフォーマット）
  - `prettier-plugin-tailwindcss`（Tailwindクラスの並び順自動整列、v4対応）
- [x] `eslint.config.mjs`（Flat Config）を作成し、`typescript-eslint`のrecommendedと`eslint-plugin-astro`のrecommendedを組み込む
- [x] `.prettierrc.json` を作成し、pluginsに`prettier-plugin-astro`・`prettier-plugin-tailwindcss`を指定。`.astro`ファイル用の`overrides`（parser指定）を設定
- [x] `.prettierignore`（`dist/`, `.astro/`, `node_modules/`, `package-lock.json`を除外）／ESLintの`ignores`設定
- [x] `package.json` に `"lint"`, `"format"`, `"format:check"` のnpm scriptsを追加
- [x] `npm run lint` / `npm run format:check` を実行して動作確認。ESLintは実バグ2件（`HeaderLink.astro`の不要な正規表現エスケープ、`BaseLayout.astro`のタグ不整合によるパースエラー）を検出したため修正済み、現在エラー0件。Prettierは41ファイルに整形差分あり（初回導入のため）、一括`npm run format`の実行は未実施（大きな差分になるため保留）。

---

## 3. Notionタスク管理

サイト制作のタスクをNotion上で管理できるようにする。

- [x] Notionデータベースをワークスペース直下（プライベートページ）に新規作成した（ユーザーが「新規作成してほしい」を選択したため、親ページ検索は行わずデフォルトの配置を使用）
- [x] タスク管理用のNotionデータベース「ブログサイト制作タスク」を作成: `https://app.notion.com/p/69b359c5275640e5aaa8c250c75c6127`（プロパティ: `Name`, `Status`（未着手/進行中/完了）, `Order`, `TODO参照`）
- [x] `TODO.md` §11「推奨する着手順序」の15項目を1タスク=1ページとしてデータベースに登録済み。各ページ本文にTODO.mdの該当チェックリストをto-doブロックとして転記済み
- [x] 同期手順を**SKILL化**した（`.claude/skills/notion-task-sync/SKILL.md`）

---

## 4. Astro/Tailwindレイアウト実装リサーチ

`TODO.md`に出てくるレイアウト・機能について、Astro 5 / Tailwind CSS v4 での実装方法を事前に調査し、設計メモとしてドキュメント化する。調査対象は以下（`TODO.md`の該当セクションに対応）。

- [x] 3カラムレイアウト（Sidebar / メイン / RightPanel、レスポンシブ対応）— TODO.md §3.1, §7.1 → `docs/design-notes/3-column-layout.md`
- [x] Sidebarのサブメニュー（Blog > 5カテゴリタブ、現在地ハイライト）— TODO.md §7.1 → `docs/design-notes/sidebar-submenu.md`
- [x] 更新履歴カレンダー（GitHub contributionグラフ風ヒートマップをCSS Gridで実装）— TODO.md §3.3, §7.7 → `docs/design-notes/calendar-heatmap.md`
- [x] タイポグラフィ整備（`@tailwindcss/typography`導入、既存`.prose`クラスとの衝突回避）— TODO.md §4.1 → `docs/design-notes/typography.md`
- [x] 見出しからのTOC自動生成（Astroの`render()`が返す`headings`の使い方）— TODO.md §4.2 → `docs/design-notes/toc.md`
- [x] コードブロック表示強化（`astro-expressive-code`導入方法）— TODO.md §4.3 → `docs/design-notes/code-blocks.md`
- [x] p5.js/GLSLライブデモコンポーネント（`Sketch.astro`/`ShaderCanvas.astro`の実装パターン、`define:vars`、Viteの`?url`/`?raw`インポート）— TODO.md §5.2, §5.3 → `docs/design-notes/live-demo-components.md`（**TODO.md §5.2の`define:vars`に関する記述の誤りを発見、TODO.md側は修正済み**）
- [x] X公式タイムラインの遅延読み込み埋め込み — TODO.md §7.8 → `docs/design-notes/x-timeline-embed.md`（`platform.twitter.com`は`platform.x.com`に移行済みと判明）

汎用SKILL化済み（`.claude/skills/astro-tailwind-research/SKILL.md`）。上記8項目はこのSKILLを使って並列調査し、`docs/design-notes/` 配下に実装設計メモとして保存した。

---

## 5. 想定する成果物一覧

| 種別 | パス |
|---|---|
| SKILL | `.claude/skills/notion-task-sync/SKILL.md` |
| SKILL | `.claude/skills/astro-tailwind-research/SKILL.md` |
| 設定ファイル | `eslint.config.mjs`, `.prettierrc`, `.prettierignore` |
| ドキュメント | `docs/design-notes/*.md`（レイアウトごとの実装設計メモ、8本） |
| Notion | 新規タスク管理データベース（URLは作成後にTODO.mdへ追記） |

---

## 6. 進める順序（提案）

1. 前回作成物の削除（1章）
2. Lint/Prettier整備（2章）— 実装作業の土台として最初に入れておく
3. Astro/Tailwindレイアウトリサーチ（4章）— 実装前の情報収集なので早めに着手
4. Notionタスク管理（3章）— リサーチと並行、または前後してよい
