# 見出しからの目次(TOC)自動生成の実装方針

関連TODO: TODO.md §4.2

## 課題

記事詳細ページ（`BlogPost.astro`）で、本文中の見出し（`##`/`###`等）から目次を自動生成し、アンカーリンクでジャンプできるようにしたい。記事が長くなりがちな技術記事・作品記事のナビゲーションを楽にする。

## 推奨アプローチ

Astro Content Collectionsの `render(entry)`（`astro:content`からimport）が、Markdown/MDXの見出しを自動抽出した `headings` 配列を返す。**追加のremarkプラグインは不要**、Astro標準機能だけで実現できる。

`headings` の型は `{ depth: number; slug: string; text: string }[]`。
- `depth`: 見出しレベル（1〜6）
- `slug`: 見出しに自動付与されるアンカーID（`id="..."`と同じ値）
- `text`: 見出しのテキスト

重要な発見: `src/pages/blog/[...slug].astro` は**既に** `render(post)` を呼んでいるが、現状は `Content` しか取り出していない（`headings` を破棄している）。

```astro
// src/pages/blog/[...slug].astro（現状、13-15行目）
const post = Astro.props;
const { Content } = await render(post);
```

つまり実装コストは非常に低く、`headings` を追加で受け取って `BlogPost.astro` に渡すだけでよい。

## 実装スケッチ

**1. `src/pages/blog/[...slug].astro` を変更**（`headings` を取り出してpropsに追加）:

```astro
---
import { type CollectionEntry, getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}
type Props = CollectionEntry<'blog'>;

const post = Astro.props;
const { Content, headings } = await render(post);
---

<BlogPost {...post.data} headings={headings}>
  <Content />
</BlogPost>
```

**2. `src/layouts/BlogPost.astro` のPropsを拡張**（現状 `type Props = CollectionEntry<'blog'>['data']` のみなので `headings` を追加する必要がある）:

```astro
---
import type { CollectionEntry } from 'astro:content';

type Props = CollectionEntry<'blog'>['data'] & {
  headings: { depth: number; slug: string; text: string }[];
};

const { title, description, pubDate, updatedDate, heroImage, headings } = Astro.props;
---
```

**3. `TableOfContents.astro` を新規作成**（`src/components/TableOfContents.astro`）:

```astro
---
interface Heading {
  depth: number;
  slug: string;
  text: string;
}
const { headings } = Astro.props as { headings: Heading[] };

// h1(記事タイトル自体)は除外し、h2以上だけを目次に出すのが一般的
const items = headings.filter((h) => h.depth >= 2);
---

{items.length > 0 && (
  <nav class="toc" aria-label="目次">
    <p class="toc-title">目次</p>
    <ul>
      {items.map((h) => (
        <li style={`margin-left: ${(h.depth - 2) * 1rem}`}>
          <a href={`#${h.slug}`}>{h.text}</a>
        </li>
      ))}
    </ul>
  </nav>
)}
```

**4. `BlogPost.astro` 内で呼び出す**:

```astro
<TableOfContents headings={headings} />
```

見出しへの `id` 付与はAstro標準のMarkdown処理で自動的に行われる（`headings[].slug` と同じ値）ため、`<h2 id="...">` 側で追加の対応は不要。アンカーリンク `href={`#${h.slug}`}` はそのまま機能する。

## 配置場所の選択肢

- **本文上部**: 記事冒頭に目次を差し込む。実装が単純（`BlogPost.astro`の`<article>`内、`<slot />`の直前に置くだけ）。モバイルでも同じ導線で見える。
- **サイドカラム（デスクトップのみ）**: TODO.md §3.1の3カラムレイアウトに合わせ、記事詳細ページのみ `LeftPanel`（画面左カラム、旧`RightPanel`）をカレンダー/Xタイムラインの代わりにTOCへ差し替える。スクロールに追従する`sticky`配置にすると長文記事で使いやすいが、`BaseLayout`が記事ページ専用のTOC表示を意識していない（現状`BlogPost.astro`は`BaseLayout`を経由せず自前で`<html>`を組んでいる）ため、サイドカラムへの差し込みは`BlogPost.astro`側で直接マークアップする形になる。

どちらも実装コストは大差ないため、UI/UXの好みで決めてよい。**短い記事にはTOCを出さない**（`items.length > 0`のガードは実装済み）ようにしておくと、Sketch記事のように見出しが少ない記事で無駄な余白が出ない。

## 注意点・落とし穴

- `headings` の `slug` はAstroのMarkdown処理系（`github-slugger`ベース）が生成するため、同じテキストの見出しが複数あると `見出し`, `見出し-1` のように連番が振られる。記事内で同一見出しテキストを使い回すと目次のリンク先がズレることがあるので、記事執筆時に見出しの重複を避けるのが望ましい。
- `headings.filter((h) => h.depth >= 2)` としているのは、`depth === 1`（`#`によるh1）は通常記事タイトル自体（レイアウト側で別途`<h1>{title}</h1>`として描画済み）と重複するため。本文中で`# `を使わずに`## `から書き始める運用にしておくと迷わない。
- MDX記事で見出しの直後にコンポーネント呼び出し（`<Sketch />`等）を書いても`headings`抽出には影響しない（remarkの見出しパースは通常のMarkdown/MDX ASTベースのため）。

## 参考リンク

- [Markdown in Astro | Docs](https://docs.astro.build/en/guides/markdown-content/)
- [Content collections - Astro Docs](https://docs.astro.build/en/guides/content-collections/)
