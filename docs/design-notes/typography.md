# 記事本文タイポグラフィ(@tailwindcss/typography)の実装方針

関連TODO: TODO.md §4.1

## 課題

記事本文（`BlogPost.astro`）の可読性を上げるため `@tailwindcss/typography` を導入したい。ただし `BlogPost.astro` の `<style>` 内には既に本文ラッパー用の独自クラス `.prose`（幅720px、色指定など）が定義されており、Tailwind Typographyが提供するユーティリティクラス `prose` と**名前が同じ**。また、このプロジェクトはTailwind CSS v4（`tailwindcss: ^4.1.18`, `@tailwindcss/vite: ^4.1.18`）で、`tailwind.config.js` を使わないCSSファースト構成（`src/styles/global.css` に `@import "tailwindcss";` のみ）のため、v3時代の `tailwind.config.js` の `plugins: [require(...)]` という導入方法はそのままでは使えない。

## 推奨アプローチ

1. **プラグイン導入はCSS側で行う（v4の`@plugin`ディレクティブ）**。`tailwind.config.js` を新規に作る必要はない。
   ```css
   /* src/styles/global.css */
   @import "tailwindcss";
   @plugin "@tailwindcss/typography";
   ```
   `npm install -D @tailwindcss/typography` は別途必要。

2. **既存の `.prose` クラスはリネームする**。Astroの `<style>` はデフォルトでコンポーネントスコープ（ビルド時に `data-astro-cid-*` 属性でスコープされる）なので、技術的には `BlogPost.astro` 内の `.prose` とTailwindのグローバルユーティリティ `.prose` は衝突してクラッシュするわけではない（Astroが要素にスコープ属性を付与し、CSS詳細度の兼ね合いで両方のスタイルが当たりうる）。ただし「同じクラス名に別々の意味を持たせる」のは事故のもとなので、`BlogPost.astro` 側の独自クラスは `.content` 等の別名にリネームしてから `prose` を使うことを推奨する。

3. **記事本文を `prose` でラップする**。
   ```astro
   <div class="prose prose-neutral max-w-none">
     <slot />
   </div>
   ```
   `max-w-none` を付けないと `prose` 自体が `max-width: 65ch` 相当の制約を持つため、既存の `.content` 側の幅指定（720px等）と二重に効いてレイアウトが崩れる。幅の制御は `.content` 側に一本化し、`prose` 側は文字周りの装飾のみを担わせる。

4. **クラス名自体を変えたい場合**は、プラグイン登録時にオプションで変更できる。
   ```css
   @plugin "@tailwindcss/typography" {
     className: wysiwyg;
   }
   ```
   こうすると衝突を気にせず `class="wysiwyg"` として使える。ただし世間一般の情報（Tailwind公式ドキュメント等）は `prose` を前提にしているものが多いため、リネームより「2.」の方針（自前クラスの方をリネーム）を基本推奨とする。

5. **ダークモード**: `global.css` に現状ダークモード対応が無いため、`dark:prose-invert` 等は今回は不要。将来ダークモード対応する場合、Tailwind v4は `@custom-variant dark (&:where(.dark, .dark *));` のようにCSS側で `dark` バリアントを定義する方式に変わっている点に注意（v3の `darkMode: 'class'` 設定とは書き方が異なる）。

## 実装スケッチ

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

```astro
---
// src/layouts/BlogPost.astro
---
<style>
  .content {           /* 旧 .prose からリネーム */
    width: 720px;
    max-width: calc(100% - 2em);
    margin: auto;
    padding: 1em;
    color: rgb(var(--gray-dark));
  }
</style>

<div class="content prose prose-neutral max-w-none">
  <div class="title">...</div>
  <slot />
</div>
```

## 注意点・落とし穴

- **`@plugin` がビルド環境によって効かないケースが報告されている**（[tailwindlabs/tailwindcss Discussion #19674](https://github.com/tailwindlabs/tailwindcss/discussions/19674)）。ローカルの `npm run dev` だけでなく、`npm run build && npm run preview` まで確認してから導入完了とすること。
- `prose` はデフォルトで `max-width` を持つため、既存レイアウトの幅指定と二重に効かないよう `max-w-none` を必ず付ける（上記3.）。
- 見出し・リンクの色は `prose` のデフォルト（グレー系）になるため、サイトのアクセントカラーを当てたい場合は `prose-headings:`, `prose-a:` 系のモディファイアで上書きが必要（例: `prose-a:text-blue-600`）。
- TOC機能（TODO.md §4.2）と組み合わせる場合、見出しの `id`（スラッグ）はAstro標準機能で自動付与されるため、`prose` 導入によるスタイル変更とは独立して機能する（実装順序は気にしなくてよい）。

## 参考リンク

- [@tailwindcss/typography - npm](https://www.npmjs.com/package/@tailwindcss/typography)
- [Tailwind CSS v4.0 - 公式ブログ](https://tailwindcss.com/blog/tailwindcss-v4)
- [Theme variables - Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs/theme)
- [Functions and directives - Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs/functions-and-directives)
- [The syntax @plugin "@tailwindcss/typography" is not working in Tailwind v4 during production deployment on Vercel? (GitHub Discussion #19674)](https://github.com/tailwindlabs/tailwindcss/discussions/19674)
