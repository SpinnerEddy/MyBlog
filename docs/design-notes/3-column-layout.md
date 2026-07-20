# 3カラムレイアウト（Sidebar / メイン / LeftPanel）の実装方針

関連TODO: TODO.md §3.1, §7.1

インストール済みバージョン: `astro@^5.16.4`, `tailwindcss@^4.1.18`（`@tailwindcss/vite` 経由のCSSファースト構成、`tailwind.config.js`は無い）。

## 課題

`src/layouts/BaseLayout.astro` には3カラムグリッド（`grid-cols-1 lg:grid-cols-[240px_1fr_300px]`）が書かれているが、まるごとコメントアウトされており未使用。また、Sidebar/LeftPanel/メインコンテンツを差し替え可能にする仕組み（`<slot />`）が無く、`PortfolioPageLayout` が直書きされているため、About/Blog/PlayGroundなど他ページで同じレイアウトを使い回せない。

さらに `src/components/Sidebar.astro` は現状 `fixed left-0 top-0 h-screen w-40` という**独立した固定配置**で実装されており、グリッドの子要素として素直に組み込むと二重にスペースを取ってしまう（`fixed`要素はグリッドのフローから外れるため）。この不整合を解消する必要がある。

## 推奨アプローチ

1. **`BaseLayout.astro` に `<slot />` を導入する**（Astro標準機能）。`PortfolioPageLayout` の直書きをやめ、各ページ（`index.astro`, `about.astro`, `blog/*.astro`, `playground.astro`）が `<BaseLayout title="...">` の子要素として自分のコンテンツを渡す形にする。これによりBaseLayoutを全ページで共通化できる。
2. **Sidebar/LeftPanelは`fixed`をやめ、グリッドの子要素にする**。`position: fixed` の代わりに、グリッドコンテナ内で `lg:sticky lg:top-24 lg:self-start`（Tailwindの`sticky`ユーティリティ）を使う。これなら通常のグリッドアイテムとして幅240px/300pxの列に収まりつつ、スクロール時に画面内に留まる（`sticky`は`fixed`と違いレイアウトフローに参加するため、グリッドと共存できる）。
3. **グリッド定義はコメントアウトされていた形をそのまま採用してよい**（Tailwind v4でも`grid-cols-[240px_1fr_300px]`のような角括弧の任意値と`lg:`のようなブレークポイント接頭辞は引き続きサポートされている。v3からの破壊的変更はない）。
4. **モバイル(`lg`未満)ではSidebar/LeftPanelを非表示にし、メインカラムのみ1カラムで表示する**（既存コードの`hidden lg:block`のスタンスを踏襲）。モバイル用ナビゲーション（ハンバーガー等）は別課題として後回しにしてよい（TODO.md §3.1に「優先度低」と明記済み）。

## 実装スケッチ

**実装時にSidebar/LeftPanelの左右を入れ替える運用変更が入った**（ユーザー要望）。Sidebarが右カラム(240px)、LeftPanelが左カラム(300px)になっている点に注意（コンポーネント名と表示位置が逆に見えるが、`LeftPanel`は「画面左に表示するパネル」という意味の命名）。

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import Sidebar from '../components/Sidebar.astro';
import LeftPanel from '../components/LeftPanel.astro';

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body class="min-h-screen bg-white text-gray-900">
    <Header />

    <div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 lg:grid-cols-[300px_1fr_240px]">
      <aside class="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-zinc-200 lg:pr-3">
        <LeftPanel />
      </aside>

      <main class="min-w-0">
        <slot />
      </main>

      <aside class="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-zinc-200 lg:pl-3">
        <Sidebar />
      </aside>
    </div>

    <Footer />
  </body>
</html>
```

境界線側の`pr-3`/`pl-3`は、`gap-6`（グリッド自体の間隔）と別に追加した「境界線とコンテンツの間の見た目の余白」。カラム幅（240px/300px/1fr）には影響しないため、狭める・広げるは自由に調整してよい。

呼び出し側（例: `src/pages/about.astro`）:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About | SpinnerEddy">
  <p>自己紹介...</p>
</BaseLayout>
```

`Sidebar.astro`側は`fixed`指定を削除し、通常のブロック要素として`w-full`程度にしておけば、上記の`<aside>`側でグリッド上の幅(240px)を制御できる。

## 注意点・落とし穴

- `Header.astro` は既に `sticky top-0` かつ `h-24`（96px）。LeftPanel/Sidebarの `lg:top-24` はこのヘッダー高さに合わせてある。ヘッダーの高さを変更したら`top-*`の値も追従させること。
- `Sidebar.astro`を`fixed`から通常配置に変えると、既存の`h-screen`（画面いっぱいの高さ）指定も意味が変わる。`h-screen`は削除し、内容に応じた高さ（`self-start`で上詰め）にするのが自然。
- `BlogPost.astro`は`BaseLayout`を経由せず独自に`<html>`を組んでいる設計（CLAUDE.md記載の既知の構造）。3カラム化の対象は基本的にHome/About/Blog一覧/PlayGroundなどBaseLayout経由のページのみで、記事詳細ページ（BlogPost.astro）は別レイアウト（TOC配置などTODO.md §4.2の検討と合わせて別途判断）。
- `<slot />`導入は「3カラム化」そのものより前提条件の変更（BaseLayoutの再利用化）にあたるため、実装時はこの変更を先に行い、既存の`index.astro`をslot渡しの形に書き換える必要がある。

## 参考リンク

- [grid-template-columns - Tailwind CSS](https://tailwindcss.com/docs/grid-template-columns)
- [Layouts - Astro Docs](https://docs.astro.build/en/basics/layouts/)
- [Components - Astro Docs](https://docs.astro.build/en/basics/astro-components/)
