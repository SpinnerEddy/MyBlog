# p5.js / GLSLライブデモコンポーネントの実装方針

関連TODO: TODO.md §5.2, §5.3, §5.6

対象バージョン: Astro `^5.16.4`, Vite（Astro同梱）, p5.js（未導入、npm `p5` を新規追加予定）

## 課題

記事(MDX)内に、p5.jsまたは生WebGL(GLSL)によるライブ実行デモを埋め込みたい。フレームワーク（React等）は導入していないため、Astroの素の機構（`<script>`のバンドル、`define:vars`、Viteの`?url`/`?raw`インポート）だけで実現する必要がある。

## 推奨アプローチ

### `Sketch.astro`（p5.js）: `define:vars` は使わない

**重要な訂正**: TODO.md §5.2の説明文に「`src` は `define:vars` でクライアントスクリプトに渡す」と書かれているが、これは誤り。Astro公式ドキュメント（Template Directives Reference）によると:

> `<script>` タグで `define:vars` を使うと、暗黙的に `is:inline` ディレクティブが適用される

`is:inline` が付くとそのスクリプトは**Viteによってバンドルされない**（HTMLにそのままインライン挿入される）。つまり `define:vars` を使った `<script>` 内では `import p5 from 'p5'` のようなnpmパッケージのimportが機能しない。

代わりに、**data属性経由**で値を渡す（TODO.md §5.2のコード例コメントには実は正しく書かれている）。これがp5.js用コンポーネントの正しい実装:

```astro
---
// src/components/Sketch.astro
interface Props {
  src: string; // 例: import sketchSrc from './sketch.js?url'
  height?: number;
}
const { src, height = 400 } = Astro.props;
---
<div class="sketch-container not-prose" data-sketch-src={src} style={`height:${height}px`}></div>

<script>
  import p5 from 'p5';

  document.querySelectorAll<HTMLElement>('[data-sketch-src]').forEach(async (el) => {
    const src = el.dataset.sketchSrc;
    if (!src) return;
    const mod = await import(/* @vite-ignore */ src);
    new p5(mod.default, el);
  });
</script>
```

- `p5` のコンストラクタは `new p5(sketch, node)`。`sketch` は `p` を引数に取る関数（インスタンスモード）、`node` はコンテナ要素（DOM要素 or ID文字列）。
- 記事側の `sketch.js` は次の形で書く:
  ```js
  export default (p) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, 400);
    };
    p.draw = () => {
      p.background(20);
    };
  };
  ```
- `/* @vite-ignore */` は、動的importの引数が変数（静的解析できない文字列）であることをViteに伝え、警告を抑制するための標準的な書き方。

### `ShaderCanvas.astro`（GLSL/WebGL）: `define:vars` を使ってよい

こちらはnpmパッケージのimportが不要（生WebGL2 APIのみ使用）なので、`define:vars` が `is:inline` を強制しても問題ない。むしろ `frag`/`vert` という**サーバー側で解決済みの文字列**を渡す用途に `define:vars` はぴったり合う。

```astro
---
// src/components/ShaderCanvas.astro
interface Props {
  frag: string; // 例: import fragShader from './shader.frag?raw'
  vert?: string;
}
const { frag, vert } = Astro.props;
---
<canvas class="shader-canvas not-prose"></canvas>

<script define:vars={{ frag, vert }}>
  const canvas = document.currentScript.previousElementSibling;
  const gl = canvas.getContext('webgl2');

  const defaultVert = `#version 300 es
    void main() {
      // 頂点バッファ無しで画面全体を覆う1枚の三角形を、gl_VertexIDだけで生成する
      vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
    }`;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vert || defaultVert));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  gl.useProgram(program);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouse = [0, 0];
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = [e.clientX - rect.left, rect.height - (e.clientY - rect.top)];
  });

  function resize() {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(t) {
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
</script>
```

- `gl_VertexID` を使った「頂点バッファ無しの1枚の三角形」はShadertoy的な用途で広く使われる定番テクニック（画面全体をNDC座標でカバーし、フラグメントシェーダーだけ書けばよい）。
- `document.currentScript.previousElementSibling` でcanvasを取得しているのは、コンポーネントを1記事に複数配置してもそれぞれ独立して動くようにするため（`querySelectorAll`でグローバルに拾うp5版と方針を合わせるなら、こちらも `class="shader-canvas"` を起点に走査する形に統一してもよい）。

### co-locateしたソースファイルのimport（`?url` / `?raw`）

- `?url`: ファイルをビルド後の静的アセットURLとして解決する。`import sketchSrc from './sketch.js?url'` のように使う。Vite公式ドキュメントでは「内部の対応リストに無いアセットや`assetsInclude`未設定の種別を明示的にURL化する」用途として説明されている。`.js`ファイルへの適用例は公式ドキュメントに直接は無いが、任意のファイルに対して汎用的に機能する。
- `?raw`: ファイルの中身を文字列としてそのままimportする。公式ドキュメントの例でもGLSLシェーダーの読み込みが例示されており（`import shaderString from './shader.glsl?raw'`）、`.frag`拡張子でも同様に動作する。

## 注意点・落とし穴

1. **`define:vars` on `<script>` は `is:inline` を強制する**（本メモの核心）。npm importを伴うクライアントスクリプトには使えない。値を渡したいだけならdata属性 + `querySelectorAll`の組み合わせにする。
2. `?url` + 動的 `import()` の組み合わせは、Vite devサーバーとビルド後（本番）で解決経路が異なる（devはViteの変換ミドルウェア経由、本番はハッシュ付き静的ファイル）。**実装時に `npm run dev` と `npm run build && npm run preview` の両方で動作確認すること**。
3. WebGLコンテキスト数の上限（ブラウザ毎に8〜16程度）に注意。TODO.md §5.5の方針通り、一覧・Homeでは実行せず記事詳細ページのみで読み込む。
4. `gl_VertexID` を使うには `#version 300 es`（WebGL2）が必須。`getContext('webgl2')` が `null` を返す環境（古いブラウザ）のフォールバックは今回はスコープ外とする（要件に無ければ非対応でよい）。
5. p5.jsは `windowWidth` 等グローバルなブラウザサイズに依存するメソッドがあるため、コンテナ幅に追従させたい場合は `p.resizeCanvas` をリスナーで呼ぶ実装を追加で検討する（今回のスケルトンには含めていない）。

## 参考リンク

- [Astro: Scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro: Template Directives Reference — define:vars](https://docs.astro.build/en/reference/directives-reference/)
- [Vite: Static Asset Handling（`?url` / `?raw`）](https://vite.dev/guide/assets.html)
- [p5.js reference](https://p5js.org/reference/p5/p5/)

## TODO.mdへの反映が必要な点

- §5.2 の説明文「`src` は `define:vars` でクライアントスクリプトに渡す」は誤り。data属性経由に訂正が必要（コード例のコメント自体は元々正しかった）。
