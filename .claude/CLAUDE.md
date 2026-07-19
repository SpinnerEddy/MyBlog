# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code (claude.ai/code) に向けたガイダンスです。

## プロジェクト概要

SpinnerEddy 個人のブログ兼クリエイティブコーディング・ポートフォリオサイト。Astro で構築。UI 文言は英語/日本語が混在し、ポートフォリオ作品の説明文は日本語。

## コマンド

```
npm run dev       # 開発サーバーを起動
npm run build      # dist/ に本番ビルド
npm run preview    # 本番ビルドをプレビュー
npm run astro ...  # 任意の astro CLI サブコマンドを実行（例: astro check）
```

テストスイートおよびリンターはこのリポジトリには設定されていません。

## アーキテクチャ

**スタック**: Astro 5（コンテンツコレクション + ファイルベースルーティング）、Tailwind CSS 4（`@tailwindcss/vite` 経由、`src/styles/global.css` からインポート）、ブログ記事用の MDX、`@astrojs/sitemap` と `@astrojs/rss` インテグレーション。

**2 つのコンテンツ管理方式が並存しており、混同しないこと:**

1. **ブログ記事** — Astro コンテンツコレクションで管理。Markdown/MDX ファイルは `src/content/blog/` に配置し、スキーマは `src/content.config.ts`（title, description, pubDate, updatedDate, heroImage）で定義。ルーティングは動的で、`src/pages/blog/index.astro` が一覧を表示し、`src/pages/blog/[...slug].astro` が `src/layouts/BlogPost.astro` を通して各記事をレンダリングする。RSS フィードは同じコレクションから `src/pages/rss.xml.js` で生成される。

2. **ポートフォリオ作品（Sketches）** — コンテンツコレクションではなく、`src/data/PortfolioSketches.ts` にハードコードされた素の TypeScript 配列（`PortfolioSketch[]`）。各作品ごとに日本語の長文説明ブロックを含む。`src/components/PortfolioSketchList.astro` がこの配列をマップし、`src/components/PortfolioSketchPlate.astro` で各要素をレンダリングする。`PortfolioSketchPlate.astro` は `embedType`/`embedId` に応じて YouTube または Shadertoy の iframe を埋め込む。新しい作品を追加する際は、`PortfolioSketches.ts` の配列を直接編集する（CMS や markdown ファイルは介在しない）。

**ページ構成**: `src/pages/index.astro` は `BaseLayout` → `PortfolioPageLayout` → (`PortfolioAboutMeText`, `PortfolioSketchList`, `PortfolioArticleListText`) という構成でレンダリングされる。`BaseLayout.astro` はホーム/ポートフォリオページ用の共通シェル（Header/Footer）。一方 `BlogPost.astro` は各ブログ記事用の独立したレイアウトで、`BaseLayout` を経由せず自前で `<html>` や `BaseHead`/Header/Footer を組んでいる点に注意。

**アイコン/ソーシャルリンク**: ソーシャルリンクは各アイコンコンポーネント（`XIcon`, `InstagramIcon`, `GithubIcon`, `NoteIcon`）を `HeaderSocialLink` 経由でレンダリングする。ソーシャルリンクのリスト自体は `src/components/Header.astro` 内にインラインで定義されている。

**サイトメタデータ**（タイトル/説明文）は `src/consts.ts` にある。`astro.config.mjs` の `site` は現状 `'https://example.com'` というプレースホルダーのままなので、canonical URL / sitemap / RSS の出力に依存する作業をする前に、実際にデプロイされる URL へ設定しておく必要がある。

## ライセンスについて

README によると、コードは MIT ライセンス、コンテンツ（記事、作品、WebGL スケッチ、画像）は CC BY-NC 4.0 © 2025 SpinnerEddy。コンテンツとコードでライセンスが異なる点に注意してコピー・生成作業を行うこと。
