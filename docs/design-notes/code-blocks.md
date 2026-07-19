# コードブロック表示強化の実装方針

関連TODO: TODO.md §4.3

対象バージョン: `astro@^5.16.4`, `@astrojs/mdx@^4.3.12`（2026-07時点のpackage.json記載値）

## 課題

現状はAstro標準搭載のShikiによる素のシンタックスハイライトのみで、行番号・ファイル名タイトル・コピーボタン・diffハイライトなどが無い。技術記事（Sketchの技術解説やArticles）でコード例を読みやすく提示するための強化が必要（TODO.md §4.3）。

## 推奨アプローチ

`astro-expressive-code` インテグレーションを導入する。Astro標準のShikiを**置き換える**形になる（Expressive Codeは内部でShikiをベースにしているため、シンタックスハイライト自体は引き続きShiki品質のまま、フレーム・コピーボタン・行番号などの追加機能が乗る）。

- インストールは `npx astro add astro-expressive-code` で自動セットアップ可能。手動なら `npm install astro-expressive-code` の上で `astro.config.mjs` に追記する。
- **重要**: `expressiveCode()` は `mdx()` より**前**に `integrations` 配列へ入れること。Expressive CodeはMDXがコードブロックを処理する前にコードフェンスを変換する必要があるため、順序を誤ると効かない。

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'], // 例: ライト/ダーク2テーマ
    }),
    mdx(),
    // 他のインテグレーション
  ],
});
```

### デフォルトで有効な機能（追加設定不要）

- エディタ/ターミナル風フレーム（`frames`プラグイン、デフォルト有効）
- コピーボタン（`frames.showCopyToClipboardButton`、デフォルト `true`）
- ファイル名タイトル（コードフェンスのmeta情報に `title="foo.ts"` のように書くとタブ/キャプションとして表示される）
- ターミナル用フレームでは `#` から始まるコメント行をコピー時に除去するオプションもある

### 追加設定が要る機能

- **行番号**: 別パッケージ `@expressive-code/plugin-line-numbers` を追加インストールし、`expressiveCode()` の `plugins` 配列に `pluginLineNumbers()` を渡す必要がある（インストールすれば全コードブロックにデフォルトで行番号が出る。個別ブロックでは meta情報の `showLineNumbers` で on/off 切替可）。
  ```js
  import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

  expressiveCode({
    plugins: [pluginLineNumbers()],
  });
  ```
- **diffハイライト（挿入/削除行のマーキング）**: `Text Markers` プラグイン（コアプラグインで標準搭載）が担当。コードフェンスのmeta情報で `ins={1-2}` / `del={3}` のような行指定記法を使う。追加インストール不要。
- **ライト/ダークテーマ切り替え**: `themeCssSelector` オプションで、サイトのテーマ切り替え機構（例: `data-theme`属性）に連動させられる。デフォルトの実装は `[data-theme='${theme.name}']` セレクタを使う。`useDarkModeMediaQuery` を使えば `prefers-color-scheme` に自動追従もできる。このサイトは現状ダークモード未対応（TODO.md §4.1参照、要確認事項）なので、ダークモード対応の可否が決まってから複数テーマ設定に着手するとよい。単一テーマ運用ならこの設定は不要。

## 実装スケッチ

```js
// astro.config.mjs（最小構成の例）
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com', // TODO: 実URLに更新
  integrations: [
    expressiveCode(), // まずはデフォルト設定で導入
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

MDX側のコードフェンスの書き方自体は変わらない（```` ```ts ```` のような通常のMarkdownコードフェンス）。Expressive Codeがビルド時に自動でフレーム・コピーボタン等を付与するため、記事執筆者側の書き方は増えない（行やdiffの強調をしたい場合だけmeta情報を追記する）。

## 注意点・落とし穴

- `integrations` 配列の順序（`expressiveCode()` を `mdx()` より前）を誤ると、MDX記事内のコードブロックにExpressive Codeの装飾が適用されない。
- Astro標準のShikiベースのハイライト設定（`markdown.shikiConfig`等、現状このプロジェクトでは未設定）と併用しようとすると競合する。Expressive Code導入後は、そちらの設定は使わずExpressive Code側の`themes`オプションに統一する。
- 行番号プラグインは別パッケージのインストールが要る点を忘れやすい（`astro-expressive-code`本体だけでは行番号は出ない）。
- テーマを複数指定すると出力CSSが増える。ダークモード対応の要否（TODO.md §9の要確認事項）が固まるまでは単一テーマでシンプルに始めるのが無難。

## 参考リンク

- [Installing Expressive Code | Expressive Code](https://expressive-code.com/installation/)
- [Configuring Expressive Code | Expressive Code](https://expressive-code.com/reference/configuration/)
- [Editor & Terminal Frames | Expressive Code](https://expressive-code.com/key-features/frames/)
- [Line Numbers | Expressive Code](https://expressive-code.com/plugins/line-numbers/)
- [astro-expressive-code - npm](https://www.npmjs.com/package/astro-expressive-code)
