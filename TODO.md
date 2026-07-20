# サイトリニューアル TODO / 実装想定

目的: SNS以外で自分個人の発信を行える場所を増やすこと。作品・技術記事・趣味・イベント参加記録などを、SNSの文字数制限や流れの速さに縛られず、存分に書き残せる場を作る。ブログである以上、**記事の書きやすさ・読みやすさ**を土台としてしっかり確保した上で、その上に p5.js / GLSL / WebGL のデモ・スケッチを記事内に置ける状態を理想とする。また記事単位で検索エンジンからの非表示（サイト内からしか辿れない状態）を選べることも目指す。

現状把握: 下記は 2026-07-20 時点でリポジトリを確認した内容。実装時に差分があれば都度更新すること。

- ブログ記事は Astro Content Collections (`src/content/blog/*.md(x)`, スキーマ: `src/content.config.ts`)。`category` は既に `tech | event | hobby | other` の enum で定義済み（デフォルト `tech`）。既存記事5件のうち `category` を明示しているのは `first-post.md`（`other`）のみで、残りはデフォルト値に依存している。
- 作品(Sketch)は Content Collection ではなく `src/data/PortfolioSketches.ts` にハードコードされた配列（5件）。日付フィールドが無い。
- `src/components/Sidebar.astro` は存在するが `BaseLayout.astro` からは未使用（3カラムレイアウトがコメントアウトされたまま）。
- `src/components/RightPanel.astro` は空ファイル。カレンダー・X埋め込みは未着手。
- `src/components/Header.astro` の SNS リンクは X / Instagram / Github のみ。Zenn 用アイコンは無い。
- `BaseHead.astro` には `robots` meta タグが無い（現状すべてのページが検索エンジンにインデックスされうる状態）。
- `astro.config.mjs` の `site` が `https://example.com` のプレースホルダーのまま。`@astrojs/sitemap` は素の設定で全ページを対象にしている。
- `package.json` の依存関係は Astro 5 / Tailwind 4 / MDX / sitemap / sharp のみ。タイポグラフィプラグイン、コードブロック強化系インテグレーション、p5.js 等は未導入。
- `global.css` にダークモード対応は無い。
- `BlogPost.astro` は本文ラッパーに独自の `.prose` というスコープ付きCSSクラスを既に使っている（幅720px等の指定）。これは Tailwind Typography の `prose` ユーティリティクラスと**名前が衝突する**ため、Typography導入時にリネームが必要（4.1参照）。

---

## 1. 確定した設計方針

| 論点 | 決定事項 |
|---|---|
| Sketchの扱い | ブログコレクションに統合する。`category` enum に `"sketch"` を追加し、`PortfolioSketches.ts` の5件をブログ記事として移植する。 |
| カレンダーの内容 | 記事の更新履歴カレンダー（GitHub contributionグラフ風のヒートマップ）。 |
| Xポスト表示 | X公式タイムライン埋め込み（`platform.twitter.com/widgets.js`、遅延読み込み）。 |
| Zenn / note のURL | 未定（後で自分で設定）。実装時はプレースホルダーで進める。 |
| **記事の可読性・書きやすさ** | 最優先事項。タイポグラフィ整備・見出しからのTOC自動生成・コードブロック表示強化のすべてに対応する。 |
| **デモ埋め込み方式** | ライブ実行の自作コンポーネント（p5.js / 生WebGL）と、外部サービス（Shadertoy/OpenProcessing等）へのiframe埋め込みの両方を使えるようにする。作品の性質に応じて使い分ける。 |
| デモのソース配置場所 | 各記事のMDXファイルと同じフォルダに co-locate する（例: `src/content/blog/twirl-stage/index.mdx` + `sketch.js` / `shader.frag`）。 |
| **タグ体系** | `Sketch / Portfolio / Articles / Event・Live / Hobby / Other` の6タブ構成。`Articles` は旧 `tech` カテゴリに専用タブを与えたもの（enum値も `tech` → `article` にリネーム）。`sketch` と `portfolio` の使い分け: **`sketch`** は1作品につき、実際のコード・出力結果・必要に応じた解説をセットにした単一作品の記事。**`portfolio`** は複数作品を1記事にまとめて紹介・解説するもの、または作品群をまとめたスライド（Google Slidesへのリンク、または自己ホストのReveal.js）を置く場所。ラベル/ルートは2.2、スライド埋め込みの実装方針は5.7・コンテンツテンプレートは5.8参照。 |
| **検索エンジン非表示機能** | 記事ごとに `noindex` を設定可能にする。noindexの記事もサイト内の一覧には通常の記事と全く同じ見た目で表示し（区別しない）、`<meta name="robots" content="noindex">` によって検索エンジンのインデックス対象からのみ外す。 |
| **作品(Sketch)の見せ方** | 一覧→クリックで詳細ページに遷移する構成（Blog記事と同じ導線）。詳細ページには「動画・静止画・コード・実際の作品表示（ライブデモ）」を**いずれか、または複数**組み合わせて掲載できるようにする。本文には技術解説・作品説明に加え、出展した場合はその情報も書けるようにする。詳細は5.6。 |
| **現行トップページ（1ページ構成）の扱い** | 現状の `index.astro`（`https://www.spinnereddy-record.com/`）は自己紹介＋作品（動画リンク＋説明文）の羅列＋過去記事へのリンクを1ページに詰め込んだ仮レイアウト。リニューアル後はHomeを「記事へ飛ぶ一覧」に置き換え、1ページ内の作品は作品ごとの記事に分割、技術記事の内容もブログ記事側へ移す。ただし**移行後も現行の1ページの内容は削除せず**、`/overview`（`https://www.spinnereddy-record.com/overview`）に退避させ、リンクを貼れば引き続き閲覧できる状態を維持する。 |
| **記事執筆時に使える表現手段** | 1記事を書く際に対応しておきたい表現手段を列挙: (1) Markdown/MDX記法（既存機能で対応済み）、(2) Mermaid記法での図表（4.5）、(3) 本文フォントを明朝体系にする（4.1、フォント選定は9章）、(4) 見出し・文字色変更・リンク等の装飾（4.6）、(5) p5.js（5.2）・生GLSL（5.3）を使った作品のライブ埋め込み（自作ライブラリ `glspinner` 対応は5.9で独立タスク化、最後に着手）、(6) コードハイライト（4.3）、(7) Reveal.jsスライドの貼り付け（5.7、`portfolio`に限らずどの記事でも使用可）、(8) 画像・動画・音声ファイルの貼り付け、(9) 動画リンク（YouTube等）の貼り付け（5.4）（8, 9は4.7参照）。 |

---

## 2. データモデル設計

### 2.1 `src/content.config.ts` の変更

```ts
schema: ({ image }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image().optional(),
    category: z.enum(['article', 'sketch', 'portfolio', 'event', 'hobby', 'other']).default('article'),
    noindex: z.boolean().default(false),

    // ↓ category === 'sketch' の記事でのみ使用（すべて optional）
    // 外部埋め込み用（旧PortfolioSketches由来のデータ）
    embedType: z.enum(['youtube', 'shadertoy', 'iframe']).optional(),
    embedId: z.string().optional(),
    languages: z.array(z.string()).optional(),
    codeUrl: z.string().url().optional(),
    additionalUrl: z.string().url().optional(),
    additionalUrlName: z.string().optional(),
    additionalArticle: z.string().optional(),
    // ライブ実行デモを使う場合はフロントマターに情報を持たせず、
    // MDX本文側で `<Sketch>` / `<ShaderCanvas>` コンポーネントを直接使う（詳細は5章）

    // ↓ category === 'portfolio' の記事でのみ使用（optional）
    slideUrl: z.string().url().optional(), // Google Slides等、外部スライドへのリンク
    // 自己ホストのReveal.jsスライドを使う場合はフロントマターに情報を持たせず、
    // MDX本文側で `<RevealSlides>` コンポーネントを直接使う（詳細は5.7）
  }),
```

- `category` の `tech` → `article` へのリネームは、既存記事が明示的に `tech` を指定していない（デフォルト依存のみ）ため、データ移行は不要。`first-post.md` の `category: 'other'` はそのまま。
- `noindex` はデフォルト `false`（＝通常通り検索エンジンにインデックスされる）。特定の記事だけ `true` を明示する運用。
- `portfolio` を新規カテゴリとして追加（`sketch` とは別枠）。サイドバー表示ラベル・一覧ルート（2.2）、`sketch` との使い分け（1章）は確定済み。`slideUrl` 等のスライド埋め込み用フィールドは5.7参照。
- 上記スキーマ変更（`category` リネーム＋`portfolio` 追加、`noindex` 追加）は `src/content.config.ts` に実装済み。`slideUrl` はまだコードには未反映（5.7実装時に追加）。

### 2.2 カテゴリ表示ラベルとルートの対応表（`src/consts.ts` に集約）

| `category` 値 | サイドバー表示 | 一覧ページのルート |
|---|---|---|
| `article` | Articles | `/blog/article` |
| `sketch` | Sketch | `/blog/sketch` |
| `portfolio` | Portfolio | `/blog/portfolio` |
| `event` | Event・Live | `/blog/event` |
| `hobby` | Hobby | `/blog/hobby` |
| `other` | Other | `/blog/other` |
| （全件） | All | `/blog` |

### 2.3 記事ファイルのディレクトリ構成

デモのソースを co-locate するため、Sketch系（および将来的にデモを含む可能性がある記事全般）は **フォルダ+`index.mdx`** 形式にする。既存の平ファイル（`first-post.md` 等）と混在してよい（Astroの `glob({ pattern: '**/*.{md,mdx}' })` はネストしたパスも拾えるため設定変更は不要）。

```
src/content/blog/
  first-post.md                      # 従来通りの平ファイルもOK
  twirl-stage/
    index.mdx                        # 記事本文 + frontmatter
    sketch.js                        # p5.jsソース（該当する場合）
    shader.frag                      # GLSLソース（該当する場合）
    thumbnail.png                    # heroImage（任意）
```

### 2.4 マイグレーション手順（`PortfolioSketches.ts` → Content Collection）

- [ ] 5件それぞれを `src/content/blog/<slug>/index.mdx` として作成し、`category: sketch` を付与。5.6のコンテンツテンプレート（概要/デモ/技術解説/出展情報/コード）に沿って本文を構成する。
- [ ] 外部動画がある作品（現状すべて）は `embedType/embedId` 等を frontmatter に設定し、本文内で `PortfolioSketchPlate.astro`（もしくはリネームした埋め込み表示用コンポーネント）を呼び出す。
- [ ] `simpleComment` の内容（■概要/■作品のポイント/■工夫...）はMarkdown見出しに変換して本文に記載（5.6のテンプレートの「技術解説」に相当）。
- [ ] `pubDate` は判明している範囲で設定し、不明なものは要確認事項（9章）に残す。
- [ ] 移行完了後、`src/data/PortfolioSketches.ts` は削除し、`PortfolioSketchList.astro` は Content Collection ベースの一覧コンポーネントに置き換える。

---

## 3. ワイヤーフレーム（テキストベース）

### 3.1 全体レイアウト（Home）

```
+--------------------------------------------------------------------+
| [SpinnerEddy's Record]                      [X] [IG] [Zenn] [note] |
+-----------+---------------------------------------------+----------+
| Home      |  作品と技術関連の記事一覧（新着順）           | 更新履歴  |
| About     |  +-----------+  +-----------+               | カレンダー |
| Blog    ▾ |  | thumbnail |  | thumbnail |   ...         | ■■□□■■ |
|  All      |  | Title     |  | Title     |               +----------+
|  Sketch   |  +-----------+  +-----------+               | X タイム |
|  Portfolio|                                              | ライン   |
|  Articles |                                              | 埋め込み |
|  Event/Live|                                             |          |
|  Hobby    |                                              |          |
|  Other    |                                              |          |
| PlayGround|                                              |          |
+-----------+---------------------------------------------+----------+
```

### 3.2 記事ページ内のデモ配置イメージ（Sketch記事）

```
# TWIRL:STAGE

本文（概要・工夫などのMarkdown）...

## デモ

+--------------------------------------+
|                                        |
|         <ShaderCanvas> or             |
|         <Sketch>（ライブcanvas）       |
|         もしくは外部iframe埋め込み      |
|                                        |
+--------------------------------------+
[GitHubで見る] [Shadertoyで見る] など補足リンク

## 使用技術: GLSL, WebGL, TypeScript
```

### 3.3 カレンダー（更新履歴ヒートマップ）
GitHub contribution グラフに近い、週×曜日のCSS Gridヒートマップ。`getCollection('blog')` の `pubDate` を日付別に集計して描画（詳細は7.7）。

---

## 4. 記事の可読性・書きやすさの強化（最優先）

### 4.1 タイポグラフィ整備
- [x] **事前作業**: `BlogPost.astro` の `<style>` 内で本文ラッパーに使っている `.prose` クラス名を、`.content` 等の別名にリネームする（Tailwind Typography の `prose` ユーティリティと名前が衝突するため）。
- [x] `@tailwindcss/typography` を導入（Tailwind v4対応版）し、記事本文を `<article class="prose prose-neutral max-w-none">` 等でラップする。→ `global.css` に `@plugin "@tailwindcss/typography";` を追加、`BlogPost.astro` の本文ラッパーに `content prose prose-neutral max-w-none font-content` を適用。
- [ ] 見出し・段落・リスト・引用・コードのフォントサイズ/行間/余白を prose デフォルトから必要に応じて微調整（`title-font`/`content-title-font` など既存のカスタムフォント指定と整合を取る）。→ 現状 `prose-neutral` のデフォルトのまま。実ブラウザでの見た目調整は未実施（ビルド出力の構造確認のみ）。
- [x] ダークモード対応が必要か検討（現状 `global.css` にダークモード無し。無ければ `prose` はライトのみでよい）。→ **今回は対応しない**と決定。`dark:prose-invert`・Expressive Codeの複数テーマ等をまとめて別タスク化（4.8参照）。
- [x] 記事本文（`.prose`/`.content`）のフォントを明朝体系（serif）にする。使用フォントは **Zen Old Mincho**（Google Fonts、OFLライセンス）。`@fontsource/zen-old-mincho` の `400.css`/`700.css`（unicode-rangeチャンク分割版）を `global.css` でimportし、Tailwind v4 `@theme` で `--font-content` トークン化、`font-content` ユーティリティとして適用済み（`docs/design-notes/font-self-hosting.md`）。

### 4.2 見出しからの目次(TOC)自動生成
- [x] Astro の `render(entry)`（`astro:content`）が返す `headings` 配列（h1〜h6を自動抽出、`depth`/`slug`/`text` を持つ）を利用する。追加のremarkプラグインは不要、既存機能で実現できる。→ `src/pages/blog/[...slug].astro` で `headings` を取り出し `BlogPost` に配線済み。
- [x] `TableOfContents.astro` を新規作成し、`headings` を受け取ってネストしたリンクリストを描画。`BlogPost.astro` の本文上部 or サイド（記事ページのみ右カラムをTOCに差し替える等）に配置。→ `src/components/TableOfContents.astro` を新規作成し、本文上部（`<slot />`の直前）に配置。3カラムレイアウト（Order 8）実装後、右カラムへの移設を検討してもよい。
- [x] 見出しに `id`（スラッグ）が付与されるのはAstro標準機能なので、TOCのアンカーリンク (`#見出しスラッグ`) はそのまま機能する。

### 4.3 コードブロック表示強化
- [x] `astro-expressive-code`（Expressive Code）インテグレーションの導入を検討。行番号、ファイル名タイトル、コピーボタン、diffハイライトなどが標準機能で手に入る。→ 導入を決定し、`astro-expressive-code` / `@expressive-code/plugin-line-numbers` をpackage.jsonに追加済み（§8）。
- [x] `astro.config.mjs` の `integrations` に追加し、テーマ（ライト/ダーク）を選定。→ ダークモード対応外のため単一テーマ（`github-light`）で導入、`pluginLineNumbers()` 有効化。`mdx()` より前に配置済み。

### 4.4 執筆体験（書きやすさ）
- [ ] `npm run dev` でのプレビューは既に利用可能（Astroの標準ホットリロード）。追加で `npm run astro check` を型チェック用に案内する。
- [ ] frontmatterのフィールドが増える（2.1参照）ため、新規記事作成用のテンプレート（例: `src/content/blog/_template.mdx` を用意し、コピーして使う運用）を用意すると入力漏れを防げる。
- [ ] MDXでの `<Sketch>` / `<ShaderCanvas>` の使い方をREADME等に簡単なチートシートとして残す。

### 4.5 Mermaid記法対応
「4. BlogPost.astroのprose化+TOC対応」タスクからは切り出し、着手順序19番目のタスクとして別タスク化（Notion「19. Mermaid記法対応」）。
- [ ] 実装方式を比較検討する（実装前に `astro-tailwind-research` SKILLで調査）。候補: (a) `rehype-mermaid` 等でビルド時にSVGへ変換（クライアントJS不要、SEO/表示速度に有利）、(b) クライアントサイドで `mermaid.js` を動的読み込みしてレンダリング（テーマ切り替え等に強い）。
- [ ] 記事側は標準的な ```` ```mermaid ```` コードフェンスで書けるようにする。
- [ ] 4.3で導入する `astro-expressive-code`/Shiki が `mermaid` 言語のコードブロックを構文ハイライト対象にしてしまわないよう、除外設定を確認する。

### 4.6 記事装飾（見出し・文字色・リンクなど）
- [x] 見出し(h1〜h6)・段落・リスト・引用のスタイリングは4.1のtypography対応でカバーする。
- [x] リンク（URL遷移）は標準Markdownの `[text](url)` でそのまま対応可能（追加実装不要）。
- [x] 文字色変更・下線・マーカーなど、Markdown標準にない装飾の実現方法を検討する。候補: (a) MDX記事内でインラインHTML/JSX（例: `<span style="color:red">`）を直書きする、(b) `<ColorText color="...">` のような専用コンポーネントを用意する。`.md`（非MDX）ファイルで生HTMLがどこまで通るかも合わせて確認（実装前に `astro-tailwind-research` SKILLで調査）。→ (b)を採用し `src/components/Highlight.astro` を新規作成（固定カラーパレット: red/blue/green/orange、文字色変更のみ・下線とマーカーはスコープ外）。Astro標準Markdownは`allowDangerousHtml: true`のため`.md`でも生HTMLは通るが、`<Highlight>`等のコンポーネントは`.mdx`でのみimport可能（`.md`では使えない）。

### 4.7 メディア埋め込み（画像・動画・音声・動画リンク）
- [x] 画像: 標準Markdown画像記法（`![alt](./photo.png)`）、記事フォルダにco-locate（2.3参照）。追加実装不要。
- [x] 自己ホストの動画ファイル: `<video controls src="./movie.mp4" />` をMDX本文に直接記述（5.6の「動画」欄と同じ考え方）。→ `using-mdx.mdx`で一時的に動作確認済み（確認後revert）。
- [x] 音声ファイル: `<audio controls src="./sound.mp3" />` をMDX本文に直接記述。→ 同上、動作確認済み。
- [ ] 外部動画リンク（YouTube等）: `EmbedPlate` + `embedType`/`embedId` frontmatterで埋め込み（5.4）。→ Order 6「PortfolioSketches.tsのマイグレーション」タスクの範囲、今回は未着手。

### 4.8 ダークモード対応（将来対応、別タスク化）
4.1で「今回は対応しない」と決定したため、着手順序18番目のタスクとして切り出す（Notion「18. ダークモード対応」）。
- [ ] `@tailwindcss/typography` の `dark:prose-invert` 対応（Tailwind v4の `@custom-variant dark (&:where(.dark, .dark *));` 方式でのdarkバリアント定義を含む）。
- [ ] `astro-expressive-code` の複数テーマ設定（`themeCssSelector` でのテーマ切り替え連動）。
- [ ] Zen Old Mincho・既存の `.title-font`/`.content-title-font`（Georgia系）のダーク時の見え方確認。
- [ ] サイト全体のダーク/ライト切り替えUI（トグルボタン等）の要否・配置。
- [ ] Mermaid対応時（4.5、未着手）にダークテーマ切り替えが絡む場合はここで合わせて対応。

---

## 5. インタラクティブデモ埋め込み（p5.js / GLSL / WebGL）

### 5.1 依存パッケージ追加
- [ ] `p5` を `dependencies` に追加（p5.jsのnpmパッケージ、インスタンスモードで使用）。
- `glspinner`（自作ライブラリ）の依存パッケージ追加は対象外。5.9で独立タスクとして扱う。

### 5.2 `Sketch.astro`（p5.js用ライブコンポーネント）新規作成
- 用途: MDX記事内で `<Sketch src={sketchUrl} />` のように使う。
- 実装方針:
  ```astro
  ---
  // src/components/Sketch.astro
  const { src, height = 400 } = Astro.props;
  ---
  <div class="sketch-container not-prose" style={`height:${height}px`}></div>
  <script>
    import p5 from 'p5';
    // data属性経由でsrcを受け取り、動的importでスケッチモジュールを読み込む
  </script>
  ```
  - **訂正（`docs/design-notes/live-demo-components.md`調査済み）**: `<script>` タグで `define:vars` を使うと暗黙的に `is:inline` が付与され、Viteによるバンドルが無効化されるため `import p5 from 'p5'` のようなnpm importと共存できない。`src` は代わりに **data属性 + `querySelectorAll` + 動的import** で渡す（上記コード例のコメント通り）。`define:vars` はnpm importが不要な `ShaderCanvas.astro`（5.3）側でのみ使う。
  - 記事側の co-located `sketch.js` は **p5インスタンスモード**（`export default (p) => { p.setup = ...; p.draw = ...; }`）で書いてもらう。これにより1ページに複数スケッチを置いてもグローバル汚染しない。
- 記事側の使用例（`twirl-stage/index.mdx`）:
  ```mdx
  import Sketch from '../../../components/Sketch.astro';
  import sketchSrc from './sketch.js?url';

  <Sketch src={sketchSrc} />
  ```

### 5.3 `ShaderCanvas.astro`（GLSL/WebGL用ライブコンポーネント）新規作成
- 用途: MDX記事内で `<ShaderCanvas frag={fragSource} />` のように使う。Shadertoy風に `u_time` / `u_resolution` / `u_mouse` uniformを標準搭載し、フラグメントシェーダーだけ書けば動く最小WebGL2ラッパーにする。
- 実装方針:
  ```astro
  ---
  // src/components/ShaderCanvas.astro
  const { frag, vert } = Astro.props;
  ---
  <canvas class="shader-canvas not-prose"></canvas>
  <script define:vars={{ frag, vert }}>
    // WebGL2コンテキスト取得 → フルスクリーンクアッド描画 → requestAnimationFrameループ
    // uniform: u_time, u_resolution, u_mouse を自動バインド
  </script>
  ```
- 記事側の使用例:
  ```mdx
  import ShaderCanvas from '../../../components/ShaderCanvas.astro';
  import fragShader from './shader.frag?raw';

  <ShaderCanvas frag={fragShader} />
  ```

### 5.4 外部埋め込み（従来方式）との併用
- [ ] `PortfolioSketchPlate.astro`（または改名した `EmbedPlate.astro`）は既存のYouTube/Shadertoy iframe埋め込みロジックを維持し、frontmatterの `embedType`/`embedId` を使う記事ではこちらを使用。
- [ ] `BlogPost.astro` 側では「ライブデモ」と「外部iframe埋め込み」を単純にMDX本文内で自由に組み合わせられるようにしておけば十分（レイアウト側で特別な分岐は不要）。

### 5.5 パフォーマンス・安全面の注意
- [ ] ライブデモはクライアントJSを実行するため、記事一覧・Home等のサムネイル表示では実行せず、記事詳細ページ内でのみ読み込む（一覧はstatic thumbnail画像のみ）。
- [ ] 複数デモを1記事に置く場合の負荷（WebGLコンテキスト数上限はブラウザごとに8〜16程度）に注意。長い記事で3つ以上のライブデモを置く場合はIntersectionObserverで画面内に入ったら初期化する遅延実行を検討。

### 5.6 作品(Sketch)詳細ページのコンテンツテンプレート

一覧（Blog > Sketch や Home）からクリックすると、他のブログ記事と同じ導線（`/blog/[...slug]` → `BlogPost.astro`）で詳細ページに遷移する。詳細ページ内で使える要素は下記の4種類で、**記事ごとに必要なものだけを自由に組み合わせる**（全部揃える必要はない）。

| 要素 | 実現方法 | 対応するfrontmatter/仕組み |
|---|---|---|
| 動画 | `EmbedPlate`（旧`PortfolioSketchPlate`）でYouTube等のiframe埋め込み、または自己ホストなら `<video>` タグを本文に直接記述 | `embedType: youtube`, `embedId`（5.4） |
| 静止画 | Markdownの通常の画像記法（`![alt](./photo.png)`、記事フォルダにco-locate）、もしくは一覧用サムネイルとして `heroImage` | `heroImage`（既存フィールド）、本文中の相対パス画像 |
| コード | `codeUrl` frontmatterでリポジトリ等へのリンクを掲載。加えて本文中に抜粋をMarkdownのコードブロックとして掲載してもよい（Shikiが自動でシンタックスハイライト、追加設定不要） | `codeUrl`（既存フィールド） |
| 実際の作品表示（ライブデモ） | `<Sketch>`（p5.js）/ `<ShaderCanvas>`（GLSL/WebGL）で自己完結のライブ実行、または外部サービス（Shadertoy/OpenProcessing等）へのiframe埋め込み | 5.2, 5.3, 5.4 |

本文構成の目安（Markdown見出し）:

```md
## 概要
（作品のコンセプト・テーマ）

## デモ
（動画 / 静止画 / ライブデモ のいずれか・複数）

## 技術解説
（使用技術、実装のポイント、工夫した点）

## 出展情報
（展示・公開したイベント名や参考リンク。出展していない作品では省略）

## コード
（リポジトリへのリンク、必要なら抜粋）
```

- 「出展情報」は既存フィールドの `additionalUrl` / `additionalUrlName`（参考リンクとそのラベル、例:「SESSIONS2025 RealTimeGraphics」）にそのまま対応する。出展が無い作品ではこの見出し自体を省略してよい。
- この構成は2.4のマイグレーション（`PortfolioSketches.ts`の5件の記事化）でそのまま使うテンプレートとする。

### 5.7 スライド埋め込み（Reveal.js / Google Slides）

主に `portfolio` 記事での利用を想定するが、`<RevealSlides>` / `SlideEmbed`（`slideUrl`）自体はカテゴリを問わずどの記事でも使用できるコンポーネントとする。外部サービス（Google Slides）と自己ホスト（Reveal.js）の2方式を使い分けられるようにする。実装前に `astro-tailwind-research` SKILLでサードパーティ埋め込み・ライブデモ埋め込みの作法を確認すること（5.2/5.3のライブデモコンポーネントと同様の注意点が想定される）。

- **Google Slides**: 「ウェブに公開」機能で得られる埋め込み用URL（`/embed?start=false&loop=false&delayms=3000` 形式）を frontmatterの `slideUrl` に設定し、`SlideEmbed.astro`（新規）が `<iframe>` でラップして表示する。
- **Reveal.js**: 記事フォルダにco-locateする自己ホストスライド（5.2のライブデモコンポーネントと同じ配置方針、2.3参照）。`RevealSlides.astro`（新規）を作成し、MDX本文側で `<RevealSlides src={...} />` のように使う。frontmatterには情報を持たせない。
- どちらか一方のみを使う記事が大半と想定されるが、両方を1記事に併記することも妨げない。

### 5.8 作品まとめ(Portfolio)ページのコンテンツテンプレート

`portfolio` は複数作品を1記事にまとめて紹介・解説する、または作品群をまとめたスライドを置くためのカテゴリ（`sketch` との違いは1章参照）。ページ遷移は `sketch` と同じ導線（`/blog/[...slug]` → `BlogPost.astro`）。

本文構成の目安（Markdown見出し）:

```md
## 概要
（このportfolio記事がどんな作品群・活動をまとめたものか）

## 作品一覧
（各作品の紹介・解説を列挙。個別に`sketch`記事がある作品は本文中からリンクする）

## スライド
（Google SlidesまたはReveal.jsのいずれか、5.7参照）

## 出展情報
（展示・公開したイベント名や参考リンク。無ければ省略）
```

- 「作品一覧」内の各作品紹介は、対応する `sketch` 記事があれば `[タイトル](/blog/作品slug)` のような通常のMarkdownリンクで内部リンクする（専用の仕組みは不要）。
- 「出展情報」は `sketch` と同じく `additionalUrl` / `additionalUrlName` を使う。

### 5.9 `glspinner`（自作ライブラリ）でのライブデモ対応 【独立タスク・最後に着手】

`glspinner` は自作のTypeScript/WebGL/GLSLライブラリ。p5.js（5.2）・生GLSL（5.3）と並ぶ第三の描画手段として記事内に貼れるようにしたいが、**自作ライブラリ側の整備状況に左右されるため、他の実装タスクとは切り離した独立タスクとする**（§11の着手順序では最後＝ステップ17）。5.2/5.3の実装や記事移行を待たずに進行してよいが、優先度としては最後に回す。

- [ ] `p5` とは別に、`glspinner` の依存パッケージ追加方法を確定する（npm公開する／このリポジトリ内にローカルパッケージとして組み込む／git submodule等）。9章要確認事項。
- [ ] APIの形状を確認する。p5.jsのようなインスタンスモード（`export default (instance) => {...}`）であれば `Sketch.astro` と同じ「data属性＋動的import」パターンをそのまま流用できる可能性が高い。異なる形状であれば専用の `GlspinnerCanvas.astro` を新規作成する。
- [ ] 上記が決まり次第、5.2/5.3と同様に実装前に `astro-tailwind-research` SKILLで実装方式を確認する。

## 6. 検索エンジン非表示（noindex）機能

「サイト内からしか辿れない」＝一覧やナビゲーションには通常記事と同じ見た目で表示されるが、Google等の検索結果には出ない、という状態を実現する。

### 6.1 仕組み
- **主たる制御手段は `<meta name="robots" content="noindex, nofollow">`**。これが実際に検索エンジンのインデックス対象外にする唯一の確実な方法（`robots.txt` でのブロックはクロール自体を防ぐだけで、既にインデックスされたページの削除には使えないため今回は使わない）。
- サイト内のリンク（Blogの一覧、カテゴリページ、Home等）からは今まで通り普通にリンクする。noindexは「検索結果に出ない」だけで「サイト内で見えない」わけではない。

### 6.2 実装ファイル
- [x] `src/content.config.ts`: `noindex: z.boolean().default(false)` を追加（2.1で反映済み）。
- [x] `src/components/BaseHead.astro`: `Props` に `noindex?: boolean` を追加し、`<meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />` を出力する。実装済み。
- [x] `src/layouts/BlogPost.astro`: `Astro.props` から `noindex` を受け取り、`<BaseHead title={title} description={description} noindex={noindex} />` のように渡す。実装済み。

### 6.3 sitemap / RSS の扱い
- [ ] `@astrojs/sitemap` は現状すべてのページを対象にしている。noindex記事を `sitemap.xml` から除外するのがベストプラクティスだが、`astro.config.mjs` はAstroのビルド設定ファイルであり `astro:content` の仮想モジュールを直接importできない制約がある。除外を厳密にやりたい場合は、`@astrojs/sitemap` の `filter` オプションに渡すURLリストを事前生成するスクリプトを噛ませるか、`@astrojs/sitemap` を使わず `src/pages/sitemap.xml.ts` を自前実装して `getCollection('blog', ({data}) => !data.noindex)` でフィルタする方式に切り替える（後者の方がシンプルで確実）。
- [ ] `src/pages/rss.xml.js` も同様に `noindex` な記事を除外するかは検討事項（要確認事項9章）。除外する場合は既存の `getCollection('blog')` 呼び出しに `.filter(post => !post.data.noindex)` を足すだけで対応可能。
- [ ] noindexはあくまで「検索エンジンから見えない」機能であり、サイト内の一覧UIでは通常記事と区別しない（決定済み、9.1参照不要）。

---

## 7. ページ・コンポーネント別 実装タスク

### 7.1 レイアウト全体
- [ ] `BaseLayout.astro`: コメントアウトされている3カラムグリッドを有効化し、`Sidebar` と `RightPanel` を配置。
- [ ] `Sidebar.astro`: `navItems` を `Home / About / Blog(サブメニュー: All/Sketch/Portfolio/Articles/Event・Live/Hobby/Other) / PlayGround` に更新。データ構造を `{ href, label, children? }` に拡張し、現在地判定でアクティブ表示。
- [ ] `RightPanel.astro`: 上部に `Calendar.astro`、下部に `XTimeline.astro` を配置。

### 7.2 Header
- [ ] `ZennIcon.astro` を新規作成（既存アイコンコンポーネントと同じインラインSVGパターン）。
- [ ] `Header.astro` の `socials` に `NoteIcon`・`ZennIcon` を追加。URLは `consts.ts` の `SOCIAL_LINKS` に集約し、未定の間は `href="#"`。

### 7.3 Home（`src/pages/index.astro`）
- [ ] `PostList.astro`（新規、`getCollection('blog')`ベースの一覧）に置き換え。サムネイル・タイトル・日付を表示。
- [ ] 置き換え前に、現行の `index.astro`（自己紹介＋作品陳列＋記事リンクの1ページ構成）は削除せず、`src/pages/overview.astro`（`/overview`）へそのまま退避させる。既存の `PortfolioAboutMeText` / `PortfolioSketchList` / `PortfolioArticleListText` 呼び出しをそのページに移すだけでよく、内容自体の書き換えは不要。URLを直接貼れば従来通り閲覧できる状態を維持する。

### 7.4 About（新規: `src/pages/about.astro`）
- [ ] `PortfolioAboutMeText.astro` の内容を移設。

### 7.5 Blog 一覧・カテゴリ絞り込み・記事詳細
- [ ] `src/pages/blog/index.astro`（All）を `PostList.astro` 利用に統一。
- [ ] `src/pages/blog/[category].astro`（`getStaticPaths` で `article/sketch/portfolio/event/hobby/other` の6パスを生成）を新規作成。
- [ ] `BlogPost.astro`: 4.1のprose対応、4.2のTOC差し込み、6.2のnoindex対応、5章のライブデモ・外部埋め込み双方をMDX本文内で自然に使えるようスタイル調整（`not-prose`クラスでデモ部分だけprose装飾から除外するなど）。

### 7.6 PlayGround（新規: `src/pages/playground.astro`）
- [ ] まずは空のレイアウトで作成。

### 7.7 Calendar（新規: `src/components/Calendar.astro`）
- [ ] `getCollection('blog')` の `pubDate` を日付別に集計し、週×曜日のCSS Gridヒートマップを生成。

### 7.8 X タイムライン（新規: `src/components/XTimeline.astro`）
- [ ] 公式 `twitter-timeline` 埋め込み + `widgets.js` を、IntersectionObserverで遅延読み込み。

### 7.9 モバイル端末での表示確認・調整
初回のページ（現行 `/overview` の元になった1ページ）をiPhoneで確認した際、想定通りのレイアウトにならない問題が発生した（原因未特定）。同じ問題を繰り返さないよう、新規/改修ページごとにモバイル確認を行う。
- [ ] 各ページ（Home一覧、About、Blogカテゴリ一覧・記事詳細、PlayGround、`/overview`）の実装完了時に、iPhone実機またはブラウザのデバイスモード（Chrome DevTools等）でレイアウトを確認する。
- [ ] 3カラムレイアウト（`Sidebar`/`RightPanel`、7.1）・記事本文のprose表示（4.1）・ライブデモcanvas（5.2, 5.3）・カレンダーヒートマップ（7.7）は特に幅依存のCSSが多いため、モバイル幅でのブレイクポイント/折り返し挙動を重点的に確認する。
- [ ] 確認して見つかった崩れは都度このTODOか各タスクのチェック項目に追記し、対応してから完了とする。

---

## 8. その他・下回りの整備
- [ ] `astro.config.mjs` の `site` を実URLに更新。
- [ ] `astro.config.mjs` に `astro-expressive-code`（採用する場合）を追加。
- [x] `package.json` に `p5`、`@tailwindcss/typography`、（採用する場合）`astro-expressive-code` を追加。採用を決定し `@expressive-code/plugin-line-numbers` も併せて追加済み。
- [ ] `consts.ts` に `CATEGORY_LABELS` と `SOCIAL_LINKS` を集約。

---

## 9. 要確認事項（実装を進める中で本人に確認したいこと）
- [ ] Sketch5件のうち、正確な `pubDate`（展示日）が不明なものの日付確定。
- [ ] Zenn / note の実際のアカウントURL。
- [ ] X埋め込みの対象アカウント（`@EKey2210` で確定か）。
- [ ] Homeの一覧は「Blog > All と全く同じ内容」でよいか、件数制限や絞り込みを入れるか。
- [x] ダークモード対応の要否（typography/コードブロックのテーマ選定に影響）。→ 今回は非対応と決定。4.8で別タスク化。
- [x] 記事詳細ページでTOCを配置する位置（本文上部 or 右カラム）の好み。→ 本文上部に決定。
- [ ] noindex記事を `rss.xml` からも除外するか（6.3）。
- [ ] noindex記事のsitemap除外を厳密にやるか、まずは`robots`メタタグのみで運用を始めるか（6.3、実装コストとのトレードオフ）。
- [x] 本文フォント（明朝体系）に何を使うか（Webフォント名、CDN配信 or セルフホスト）（4.1）。→ **Zen Old Mincho** に決定。`@fontsource/zen-old-mincho` でセルフホストする方針。
- [ ] Mermaidの実装方式（ビルド時SVG化 vs クライアントサイドレンダリング）（4.5）。
- [ ] 文字色変更等のインライン装飾を、生HTML/JSX直書きにするか専用コンポーネントを用意するか（4.6）。
- [ ] `glspinner` の配布方法（npm公開／ローカルパッケージ／git submodule等）とAPIの形状（5.9、独立タスク）。

---

## 10. 開発支援ツール・実装リサーチ

サイトの土台（スキーマ、レイアウト、記事）がまだ無い段階では、記事執筆規約チェック用のSKILLは時期尚早と判断し、代わりに**サイトを実際に作る過程を支援するツール**を用意した（詳細は `TOOLING_TODO.md`）。

### Lint / Formatter
- 導入済み: ESLint（Flat Config、`eslint-plugin-astro` + `typescript-eslint`）、Prettier（`prettier-plugin-astro` + `prettier-plugin-tailwindcss`）。`npm run lint` / `npm run format` / `npm run format:check` で実行可能。
- セットアップ時に見つかった実バグ2件（`HeaderLink.astro`の不要なエスケープ、`BaseLayout.astro`のタグ不整合）は修正済み。既存コード全体へのPrettier整形（`npm run format`）はまだ未実行（41ファイルに差分あり、大きな一括変更になるため未実施）。

### SKILL
| パス | 用途 |
|---|---|
| `.claude/skills/astro-tailwind-research/SKILL.md` | Astro 5 / Tailwind v4での実装方法を、公式ドキュメントベースで調査し `docs/design-notes/` に設計メモとして残す。新しいレイアウト/UI機能に着手する前に使う。 |
| `.claude/skills/notion-task-sync/SKILL.md` | `TODO.md` の内容とNotionのタスク管理データベースを同期する。 |

### 実装設計メモ（`docs/design-notes/`）
TODO.mdに出てくるレイアウト・機能について、上記SKILLを使って先行調査済み。実装時はまずこれらを読むこと。

| ファイル | 内容 | 関連TODO |
|---|---|---|
| `3-column-layout.md` | 3カラムレイアウトのCSS Grid構成。`Sidebar.astro`が`position: fixed`でgrid子要素と相性が悪い点を指摘 | §3.1, §7.1 |
| `sidebar-submenu.md` | 現在地判定、`aria-current`ベースのアクティブスタイル | §7.1 |
| `calendar-heatmap.md` | 週×曜日のCSS Gridヒートマップ、Tailwind v4のクラス動的生成の落とし穴 | §3.3, §7.7 |
| `typography.md` | `@tailwindcss/typography`導入、`.prose`クラス名衝突の回避 | §4.1 |
| `font-self-hosting.md` | Zen Old Minchoのセルフホスト方針。`@fontsource`のunicode-rangeチャンク分割と`japanese-400.css`一括版の違い、Tailwind v4 `@theme`でのトークン化、Astroネイティブ`fonts` APIとの比較 | §4.1, §9 |
| `toc.md` | `render()`の`headings`配線方法 | §4.2 |
| `code-blocks.md` | `astro-expressive-code`の導入方法、行番号は別パッケージが必要 | §4.3 |
| `live-demo-components.md` | `Sketch.astro`/`ShaderCanvas.astro`の正確な実装（**§5.2の記述を訂正済み**、上記参照） | §5.2, §5.3, §5.6 |
| `x-timeline-embed.md` | `platform.x.com`（旧`platform.twitter.com`）でのタイムライン埋め込みとIntersectionObserverによる遅延読み込み | §7.8 |

### Notionタスク管理
- データベース「ブログサイト制作タスク」を作成済み: `https://app.notion.com/p/69b359c5275640e5aaa8c250c75c6127`
- §11「推奨する着手順序」の15ステップを1タスク=1ページとして登録済み。各ページ本文にチェックリストのto-doブロックを含む。
- 今後 `TODO.md` を更新した場合は `notion-task-sync` SKILLで同期する。

---

## 11. 推奨する着手順序

1. `content.config.ts` のスキーマ拡張（2.1、category改名 + noindex追加）
2. `BaseHead.astro` / `BlogPost.astro` の noindex 対応（6.2）
3. 依存パッケージ追加: `p5` / `@tailwindcss/typography` /（検討後）`astro-expressive-code`（8章）
4. `BlogPost.astro` の `.prose` リネーム → Typography導入 → TOC対応、装飾・メディア埋め込み対応（4.1, 4.2, 4.6, 4.7）。ダークモード対応（4.1で検討）とMermaid対応（4.5）は18・19として別タスク化。
5. `Sketch.astro` / `ShaderCanvas.astro` / `SlideEmbed.astro` / `RevealSlides.astro` の実装（5.2, 5.3, 5.7）
6. `PortfolioSketches.ts` → Content Collection へのマイグレーション（2.4、5.4の埋め込みも含めて記事化）
7. `consts.ts` へのラベル/SNSリンク集約
8. Sidebar / 3カラムレイアウトの有効化（7.1）
9. Header への Zenn/note 追加（7.2、URLはプレースホルダー）
10. About ページ（7.4）
11. Blogカテゴリ別一覧ページ（7.5、6パス）
12. Home のサムネイル一覧統合（7.3）
13. PlayGround（空ページでOK、7.6）
14. Calendar・Xタイムライン埋め込み（7.7, 7.8）
15. `astro.config.mjs` の `site` 更新・sitemap/RSS確認（noindex除外を含む、6.3）
16. 各ステップで新規/改修したページのモバイル表示確認・調整（7.9）。1〜15と並行し、各ページの実装が完了するたびに都度実施する。
17. `glspinner`（自作ライブラリ）を使った作品のライブデモ対応（5.9）。自作ライブラリ側の整備に依存し他タスクと切り離せるため、独立タスクとして最後に着手する。
18. ダークモード対応（4.8）。4番のタスクで見送りと決定し、別タスク化。
19. Mermaid記法対応（4.5）。4番のタスクから切り出し、別タスク化。
