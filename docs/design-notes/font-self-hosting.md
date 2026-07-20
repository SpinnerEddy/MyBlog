# 記事本文フォント（Zen Old Mincho）のセルフホスト方針

関連TODO: TODO.md §4.1, §9

対象バージョン: `astro@^5.16.4`, `tailwindcss@^4.1.18`, `@tailwindcss/vite@^4.1.18`, `@fontsource/zen-old-mincho@5.3.0`（2026-07時点、npm install済み）

## 課題

記事本文（`BlogPost.astro`、`docs/design-notes/typography.md` で方針済みの `.content`/`prose` 構成）に、明朝体Webフォント **Zen Old Mincho**（Google Fonts、OFLライセンス）を使いたい。CDN経由（`fonts.googleapis.com`）ではなく、外部リクエストを避けるセルフホスト方式を採用する。Tailwind v4のCSSファースト構成（`tailwind.config.js`無し）に合わせて `@theme` でフォントトークン化する。

## 前提調査: `@fontsource/zen-old-mincho` パッケージの中身

`node_modules/@fontsource/zen-old-mincho/` を直接確認した実測値（ドキュメントより正確なため実物ベースで記載）:

- 提供ウェイト: **400 / 500 / 600 / 700 / 900**（5種、いずれもnormalスタイルのみ・イタリック無し）
- CSSファイルは3系統ある。**中身が全く異なるので使い分けが重要**:
  1. `400.css` / `700.css` 等（ウェイト単位）: **unicode-rangeでサブセット分割済み**（1ウェイトあたり約122個の`@font-face`、日本語だけで100チャンク前後）。ブラウザは実際にページで使われている文字が属するチャンクだけを遅延ダウンロードする。`index.css`（無指定デフォルト）の中身は`400.css`と完全に同一（デフォルトウェイト=400のため）。
  2. `japanese-400.css`（`japanese.css`もこれのエイリアス的位置づけ）: 日本語サブセット全体を**単一の`@font-face`・unicode-range指定なし**でまとめたもの。1ファイルで約1.8MB(woff2)固定。ページで使う文字数によらず常にこのサイズをダウンロードする。
  3. `files/*.woff2` 個別ファイル: 上記CSSが参照する実体。
- **実測ファイルサイズ**: ディスク上の合計は近い値だが、ブラウザの実ダウンロード量が大きく異なる。
  - `japanese-400.css` 経由 → 常に約1.86MB（woff2、weight 400のみ）
  - `400.css`（チャンク分割）経由 → 1チャンクあたり11〜38KB。日本語記事で実際に使う文字種は数百〜千数百字程度に収まることが多く、体感ダウンロード量は数百KB程度に収まりやすい
  - → **`400.css` / `700.css` のようなウェイト単位のチャンク分割ファイルを使うこと**。`japanese-400.css` 系は使わない。
- `font-display: swap` は全チャンクにデフォルトで設定済み（追加設定不要、FOUT対策済み）。

## 代替案: Astro 5.16のネイティブFonts API

調査の過程で、インストール済みの `astro@5.16.4` には **`fonts`設定（experimentalフラグ不要、安定版）**が同梱されていることを確認した（`node_modules/astro/dist/assets/fonts/providers/index.d.ts` に `fontProviders.fontsource` が存在）。

```js
// astro.config.mjs（代替案・今回は不採用）
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Zen Old Mincho',
      cssVariable: '--font-zen-old-mincho',
      weights: [400, 700],
      subsets: ['japanese', 'latin'],
    },
  ],
});
```

```astro
---
import { Font } from 'astro:assets';
---
<Font cssVariable="--font-zen-old-mincho" preload />
```

この方式はpreloadやフォールバック調整を自動化してくれるが、**ビルド時に `https://api.fontsource.org` へネットワークアクセスして font metadata を取得する**（`node_modules/unifont/dist/index.js` の `fontAPI = $fetch.create({ baseURL: "https://api.fontsource.org/v1" })` で確認）。オフラインビルドの再現性を優先し、かつ既にnpmパッケージとして `@fontsource/zen-old-mincho` をインストール済みであるため、**今回は不採用とし、下記の手動`@theme`方式を採用する**。将来的にAstroのFonts APIへ寄せたくなった場合の代替案として記録のみしておく。

## 推奨アプローチ

1. **`global.css` で `@fontsource/zen-old-mincho` のCSSをimportする**（ウェイト400・700のみ、チャンク分割版）。
2. **Tailwind v4の`@theme`でCSS変数化**し、`font-content`のようなユーティリティクラスとして使えるようにする。
3. **フォールバックにOS標準の明朝体を挟む**（Web fontロード前・ロード失敗時に和文が崩れないように）。

## 実装スケッチ

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "@fontsource/zen-old-mincho/400.css";
@import "@fontsource/zen-old-mincho/700.css";

@theme {
  --font-content: "Zen Old Mincho", "Hiragino Mincho ProN", "Yu Mincho", YuMincho, serif;
}

.title-font {
  font-family: Georgia, "Times New Roman", Times, serif;
}
/* ...既存の .content-title-font 等はそのまま */
```

```astro
---
// src/layouts/BlogPost.astro（typography.md の実装スケッチと組み合わせる想定）
---
<div class="content prose prose-neutral max-w-none font-content">
  <div class="title">...</div>
  <slot />
</div>
```

- `@theme`で`--font-content`を定義すると、Tailwindが自動的に`font-content`ユーティリティクラスを生成する（`--font-*`→`font-*`の命名規則）。
- 見出し等でウェイトを変えたい場合は通常のTailwind `font-bold`（700）等がそのまま使える。500/600/900を使う予定が出てきたら、対応する`@fontsource/zen-old-mincho/{weight}.css`のimportを追加する（現状は400/700のみで足りる想定）。

## 注意点・落とし穴

1. **`japanese-400.css`系ファイルをimportしない**。unicode-range分割の恩恵が消え、常に約1.8MB/ウェイトをダウンロードすることになる。必ず`400.css`/`700.css`（ウェイト単位のデフォルトファイル）を使う。
2. **`@import`はCSSファイルの先頭付近にまとめる**。Tailwind v4の`@import "tailwindcss";`より後ろでも動作はするが、CSSの`@import`規則自体が「他の通常ルールより前」である必要があるため、`@theme`ブロックより前に置くこと（上記スケッチの順序を踏襲する）。
3. **`npm run dev`と`npm run build && npm run preview`の両方で確認する**。Vite経由でnode_modules内CSSの`url()`参照（`./files/*.woff2`）が正しく解決され、`dist/`に出力されることを確認する（このプロジェクトの他の設計メモでも繰り返し出てくる注意点）。
4. **不要ウェイトは追加しない**。1ウェイト追加するごとに122チャンク・数MB（合計ディスクサイズ）が増えるため、実際に使う400/700以外は`@theme`にもimportにも含めない。
5. **既存の`.title-font`/`.content-title-font`（Georgia系）とは独立した別トークン**として扱う。サイトタイトルや見出し領域のフォントを混同して上書きしないよう、`font-content`は記事本文（`.content`/`prose`ラッパー）にのみ適用する。
6. Astroのネイティブ`fonts`設定（上記代替案）に移行する場合、`@fontsource/zen-old-mincho`のnpm依存は不要になり、ビルド時ネットワークアクセスに置き換わる。移行するかどうかは要検討事項として残す。

## 参考リンク

- [Font Family - Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs/font-family)
- [Fontsource - Getting Started](https://fontsource.org/docs/getting-started/install)
- [Astro: Using custom fonts](https://docs.astro.build/en/guides/fonts/)
- [Astro Font Provider API](https://docs.astro.build/en/reference/font-provider-reference/)
- [Zen Old Mincho - Fontsource](https://fontsource.org/fonts/zen-old-mincho)
