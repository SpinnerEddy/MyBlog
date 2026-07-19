# Sidebarサブメニューの実装方針

関連TODO: TODO.md §7.1

## 課題

現状の `src/components/Sidebar.astro` は `navItems` がフラットな配列（`Home / About / Content / Sketch / Playground`）で、要望の階層（`Blog` の下に `All / Sketch / Articles / Event・Live / Hobby / Other` の5タブ）を表現できない。また現在地（今どのページを見ているか）をハイライトする仕組みも無い。

## 推奨アプローチ

- **データ構造**: `navItems` を `{ href: string; label: string; children?: { href: string; label: string }[] }[]` に拡張する。`Blog` 項目だけ `children` を持たせる。
- **現在地判定**: `Astro.url.pathname` を使う。共通ヘルパー（例: `isActive(href: string, pathname: string)`）を作り、
  - トップレベル項目（`Home`, `About`, `PlayGround`）は完全一致（`pathname === href`）。`Home`（`href: '/'`）だけは `pathname.startsWith('/')` にすると常にtrueになる罠があるので必ず完全一致にする。
  - `Blog` は「配下のいずれかにいるか」なので `pathname.startsWith('/blog')` のprefix一致でよい。
  - サブメニューの各項目（`All`, `Sketch` 等）は完全一致。`All`（`/blog`）と `Sketch`（`/blog/sketch`）が prefix的に紛れないよう、完全一致判定にすること（`startsWith`だと`/blog`が`/blog/sketch`にもマッチしてしまう）。
- **アクセシビリティ + スタイリング**: 現在地のリンクに `aria-current="page"` を付与し、Tailwind CSSの**任意値ariaバリアント** `aria-[current=page]:font-bold`（または `aria-[current=page]:text-accent` 等）でスタイリングする。Tailwindの組み込みaria系バリアント（`aria-checked`, `aria-selected` 等）は真偽値属性向けで、`aria-current`のような値を持つ属性は任意値構文 `aria-[current=page]:` を使う（Tailwind公式: [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)）。この書き方はTailwind v3/v4共通のコア機能で、v4のCSSファースト設定（`@theme`等）の影響を受けない。
  - `class:list` でのisActive判定文字列を作る方式よりも、`aria-current`をDOM側の唯一の真実源にしてCSSだけで見た目を切り替える方が、見た目判定とアクセシビリティ属性が二重管理にならずシンプル。
- **サブメニューの開閉**: 常時展開（要望の元のワイヤーフレームは常時展開のツリー表示）を基本とし、折りたたみが欲しくなった場合は `<details>`/`<summary>` 要素（JS不要でネイティブに開閉できる）を使う方法がAstroの「フレームワーク無しコンポーネント」方針と相性が良い。

## 実装スケッチ

```astro
---
// src/components/Sidebar.astro
type NavChild = { href: string; label: string };
type NavItem = { href: string; label: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    href: '/blog',
    label: 'Blog',
    children: [
      { href: '/blog', label: 'All' },
      { href: '/blog/sketch', label: 'Sketch' },
      { href: '/blog/article', label: 'Articles' },
      { href: '/blog/event', label: 'Event・Live' },
      { href: '/blog/hobby', label: 'Hobby' },
      { href: '/blog/other', label: 'Other' },
    ],
  },
  { href: '/playground', label: 'PlayGround' },
];

const { pathname } = Astro.url;
const isExact = (href: string) => pathname === href;
const isWithin = (href: string) => href !== '/' && pathname.startsWith(href);
---

<aside class="fixed left-0 top-0 h-screen w-40 border-r border-zinc-800 bg-white">
  <nav class="flex h-full flex-col px-6 py-8">
    <ul class="space-y-4 text-sm tracking-wide">
      {navItems.map((item) => (
        <li>
          <a
            href={item.href}
            aria-current={isExact(item.href) || isWithin(item.href) ? 'page' : undefined}
            class="block text-zinc-900 transition-colors hover:text-zinc-900 aria-[current=page]:font-bold"
          >
            {item.label}
          </a>
          {item.children && (
            <ul class="ml-3 mt-2 space-y-2 border-l border-zinc-200 pl-3">
              {item.children.map((child) => (
                <li>
                  <a
                    href={child.href}
                    aria-current={isExact(child.href) ? 'page' : undefined}
                    class="block text-zinc-600 transition-colors hover:text-zinc-900 aria-[current=page]:font-bold aria-[current=page]:text-zinc-900"
                  >
                    {child.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </nav>
</aside>
```

## 注意点・落とし穴

- **`Home` の判定は完全一致にする**: `pathname.startsWith('/')` は全ページでtrueになるため、`Home`だけは `pathname === '/'` を使うこと（上のスケッチでは`isWithin`の定義で `href !== '/'` を明示的に除外している）。
- **`All` と `Sketch` 等の判定順序**: `/blog` の完全一致と `/blog/sketch` の完全一致は独立しているので `startsWith` を使い回すと`All`が常にアクティブになるバグを作りやすい。サブメニュー項目は必ず完全一致にする。
- **trailing slashの扱い**: `astro.config.mjs` に `trailingSlash` の指定が無く、Astroのデフォルト（`'ignore'`）に依存している。`pathname` が `/blog/` のように末尾スラッシュ付きで来るケースがあるかどうか、実装時に実際のURLで確認すること。
- **カテゴリのルート文字列の一元管理**: サブメニューの `href`（`/blog/sketch` 等）は、TODO.md §2.2の `CATEGORY_LABELS` 対応表と同じ文字列を使う必要がある。`consts.ts` 側の定義から動的に生成する（ハードコードを二重管理しない）とズレを防げる。

## 参考リンク

- [Highlight Nav Link for Current Page in Astro](https://www.cyishere.dev/blog/astro-active-nav-item)
- [Routing - Astro Docs](https://docs.astro.build/en/guides/routing/)
- [How to Highlight the Current Page Link in Astro](https://www.koladechris.com/blog/how-to-highlight-the-current-page-link-in-astro/)
- [Hover, focus, and other states - Tailwind CSS](https://tailwindcss.com/docs/hover-focus-and-other-states)
