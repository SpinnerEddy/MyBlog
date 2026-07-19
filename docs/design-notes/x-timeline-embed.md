# X公式タイムライン埋め込み（遅延読み込み）の実装方針

関連TODO: TODO.md §7.8（新規: `src/components/XTimeline.astro`）

対象バージョン: Astro ^5.16.4 / Tailwind CSS v4（このコンポーネント自体はフレームワーク非依存の素のJSで完結する）

## 課題

RightPanelの右下にX（旧Twitter）公式のタイムラインを埋め込みたい。ただし公式ウィジェットは外部スクリプト（`widgets.js`）を読み込みiframeを生成するため、素朴に埋め込むと全ページで初期ロードコストが発生する。右パネルは常に画面内に見えているとは限らない（スクロールしないと見えないレイアウトの場合）ため、画面内に入ったタイミングで初めて読み込む遅延読み込みが望ましい。

## 推奨アプローチ

公式の「埋め込みコード」方式ではなく、**公式JS API（`twttr.widgets.createTimeline`）による動的挿入**を使う。理由:

- 静的な `<a class="twitter-timeline">` + `<script async src="...widgets.js">` という埋め込みコード方式は、`widgets.js` がページ読み込み時に自動的に全ページ内の`.twitter-timeline`要素を走査してiframeに変換してしまうため、遅延読み込み（IntersectionObserverで後から発火）と相性が悪い。
- `twttr.widgets.createTimeline(sourceObject, targetEl, options)` というJS APIを使えば、任意のタイミングで任意のコンテナにタイムラインを挿入できるため、IntersectionObserverでの遅延読み込みと自然に組み合わせられる。

スクリプトの読み込み先ドメインは `platform.twitter.com/widgets.js` と `platform.x.com/widgets.js` の両方が案内されているが、X社のoEmbed APIレスポンス（2026年時点）は `platform.x.com/widgets.js` を返している。互換性のため `platform.twitter.com` 経由でも動作するが、新規実装では **`platform.x.com/widgets.js`** を使う。

Astroはこのコンポーネントに関してはアイランドアーキテクチャ（React等のフレームワークコンポーネント）を必要としない。`.astro`ファイル内の素の`<script>`タグ（Astroが自動的にビルド時にバンドル・1回だけ読み込むようにしてくれる）で完結する。

## 実装スケッチ

```astro
---
// src/components/XTimeline.astro
interface Props {
  screenName: string; // 例: "EKey2210"（先頭@なし）
  height?: number;
}
const { screenName, height = 600 } = Astro.props;
---

<div class="x-timeline-container" data-screen-name={screenName} data-height={height}>
  <p class="x-timeline-placeholder">読み込み中...</p>
</div>

<script>
  function loadTwttrScript(): Promise<any> {
    return new Promise((resolve) => {
      if ((window as any).twttr?.widgets) {
        resolve((window as any).twttr);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://platform.x.com/widgets.js';
      script.async = true;
      script.onload = () => resolve((window as any).twttr);
      document.head.appendChild(script);
    });
  }

  const containers = document.querySelectorAll<HTMLElement>('.x-timeline-container');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        obs.unobserve(el);

        const screenName = el.dataset.screenName!;
        const height = Number(el.dataset.height ?? 600);

        loadTwttrScript().then((twttr) => {
          el.innerHTML = ''; // プレースホルダーを消す
          twttr.widgets.createTimeline(
            { sourceType: 'profile', screenName },
            el,
            { height, theme: 'light' },
          );
        });
      }
    },
    { rootMargin: '200px' }, // 画面に入る少し手前で先読みしておく
  );

  containers.forEach((el) => observer.observe(el));
</script>
```

`RightPanel.astro` からは `<XTimeline screenName="EKey2210" />` のように呼び出す（`@EKey2210` の確定はTODO.md §9の要確認事項）。

## 注意点・落とし穴

- **非公開アカウント/保護ツイートは埋め込み不可**（公式仕様）。対象アカウントが鍵アカウントでないことを前提とする。
- `twttr.widgets.createTimeline` はPromiseを返す（`.then()`でレンダリング完了後の要素が取れる）。エラー時の挙動（アカウントが存在しない等）は明示的なcatchが無いため、必要ならタイムアウトでフォールバック表示を出すことを検討する。
- 1ページに複数の埋め込み（将来的にPlayGroundページ等でも使う場合）があっても、`loadTwttrScript()` はスクリプトタグの重複挿入を防ぐガードを入れてあるので安全。
- レイアウトシフト対策として、`data-height` 相当のプレースホルダーの高さをCSSで先に確保しておくとCLS（Cumulative Layout Shift）が改善する。
- 埋め込みは `platform.x.com`（旧`platform.twitter.com`）への外部通信が発生する点をプライバシー的に軽く言及してもよい（必須ではない）。

## 参考リンク

- [oEmbed API | X Developer Platform](https://docs.x.com/x-for-websites/oembed-api)
- [Profile Timeline | X Developer Platform](https://developer.x.com/en/docs/x-for-websites/timelines/guides/profile-timeline)（開発者ドキュメント本体、2026年時点で一部アクセスに制限あり。上記oEmbed APIページの情報で代替確認済み）
