# 更新履歴カレンダー（ヒートマップ）の実装方針

関連TODO: TODO.md §3.3, §7.7

## 課題

ブログ記事の投稿日(`pubDate`)を集計し、GitHubのcontributionグラフのような「週×曜日」のCSS Gridヒートマップを右パネルに表示したい。新規コンポーネントは `src/components/Calendar.astro`。外部チャートライブラリは使わず、Astro + Tailwind v4のみで完結させる。

## 推奨アプローチ

1. **データ集計はビルド時（フロントマターのみ）で完結させる**。`getCollection('blog')` を呼び、`pubDate` を `YYYY-MM-DD` 文字列キーにして件数をカウントする `Map` を作る。Astroコンポーネントのfrontmatter（`---`ブロック）はサーバー専用コードなので、クライアントJSは不要。
2. **グリッドの組み方は「列＝週、行＝曜日」でCSS Gridの`grid-auto-flow: column`を使う**。[bitsofco.deの実装](https://bitsofco.de/github-contribution-graph-css-grid/)が参考になる。要点:
   - 曜日=行は固定7行: `grid-template-rows: repeat(7, var(--square-size));`
   - 週=列は自動生成: `grid-auto-flow: column; grid-auto-columns: var(--square-size);`
   - これにより「上から下へ曜日が進み、1列使い切ったら次の週の列へ」という配置が実現できる。
3. **色の濃淡はTailwindの完全なクラス名を配列で持たせて出し分ける**（動的な文字列結合 `bg-emerald-${n}00` は使わない）。Tailwind v4はビルド時にソースファイルをテキストスキャンしてクラスを検出するため、実行時に組み立てた不完全なクラス名は検出されずCSSが生成されない。必ずリテラルで書いた配列から選ぶ。
4. データが無い日は最も薄い色（グレー系）にする。ホバー時の件数表示はJSやツールチップライブラリ不要で、`title`属性だけで十分。

## 実装スケッチ

```astro
---
// src/components/Calendar.astro
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');

const countsByDate = new Map<string, number>();
for (const post of posts) {
  const key = post.data.pubDate.toISOString().slice(0, 10); // YYYY-MM-DD
  countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
}

const WEEKS = 52;
const today = new Date();
const days: { date: string; count: number }[] = [];
for (let i = WEEKS * 7 - 1; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const key = d.toISOString().slice(0, 10);
  days.push({ date: key, count: countsByDate.get(key) ?? 0 });
}

// 完全なクラス名のリテラル配列（Tailwindのスキャン対象にするため文字列結合しない）
const levelClasses = [
  'bg-zinc-100',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-600',
  'bg-emerald-800',
];
function levelClassFor(count: number) {
  if (count <= 0) return levelClasses[0];
  if (count === 1) return levelClasses[1];
  if (count === 2) return levelClasses[2];
  if (count <= 4) return levelClasses[3];
  return levelClasses[4];
}
---

<div
  class="grid gap-[2px]"
  style={`grid-template-rows: repeat(7, 10px); grid-auto-flow: column; grid-auto-columns: 10px;`}
>
  {
    days.map((day) => (
      <div
        class={`rounded-[2px] ${levelClassFor(day.count)}`}
        title={`${day.date}: ${day.count}件`}
      />
    ))
  }
</div>
```

- `grid-template-rows` / `grid-auto-flow` / `grid-auto-columns` はTailwindの標準ユーティリティに1:1で対応するクラスが無い組み合わせ（`grid-flow-col`はあるが行数repeatはarbitrary valueが必要）なので、この部分だけ素の`style`属性でCSSを書くのが簡潔。Tailwind v4でも[任意値記法](https://tailwindcss.com/docs/grid-template-rows)（`grid-rows-[repeat(7,10px)]`のようなブラケット記法）で書くことも可能だが、可読性を優先するなら`style`属性で十分。
- 曜日ラベル（月/水/金など）や月ラベルを付けたい場合は、`days` 配列の先頭の曜日オフセットを計算して`grid-column-start`を調整する必要がある（bitsofco.deの記事では`months`/`days`用に別のgridエリアを設けている）。今回のTODOでは月・曜日ラベルの要否は未確定のため、まずはラベル無しの最小実装から始めてよい。

## 注意点・落とし穴

- **動的クラス名はTailwindに検出されない**: `` `bg-emerald-${level}00` `` のような文字列結合は本番ビルドでCSSが生成されず、色が付かない静かなバグになる。必ず完全なクラス名をソース上にリテラルで書く（上記の`levelClasses`配列のように）。
- **タイムゾーン**: `pubDate`はUTCとして扱われる可能性があるため、`toISOString().slice(0,10)`で日付キーを作ると日本時間の日付とズレることがある。投稿日がずれて見える場合は、`Intl.DateTimeFormat`でJST基準の日付文字列を作るなど調整が必要。
- **記事数が増えた場合のパフォーマンス**: 現状5〜10件程度なら`getCollection`全件走査で全く問題ない。将来数百記事になっても、この集計はビルド時の1回だけなので実行時コストはゼロ（静的HTML化される）。
- 52週固定でgridを作ると、1年に満たない運用期間では左側が「投稿がまだ無い期間」で埋まる。見た目が寂しい場合は、実際の最初の投稿日からのみ表示するようWEEKS計算を調整してもよい。

## 参考リンク

- [Recreating the GitHub Contribution Graph with CSS Grid Layout | bitsofco.de](https://bitsofco.de/github-contribution-graph-css-grid/)
- [Astro component for a GitHub contribution graph — larocque.dev](https://www.larocque.dev/projects/github-contribution-astro-component/)
- [Astro Content Collections — 公式ドキュメント](https://docs.astro.build/en/guides/content-collections/)
- [Astro Content Collections API Reference](https://docs.astro.build/en/reference/modules/astro-content/)
- [Tailwind CSS: grid-template-rows（任意値記法含む）](https://tailwindcss.com/docs/grid-template-rows)
