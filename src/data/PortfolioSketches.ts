export type PortfolioSketch = {
  title: string;
  embedType: "youtube" | "shadertoy" | "iframe";
  embedId: string;
  languages: string[];
  description: string;
  simpleComment: string;
  additionalDescription?: string;
  codeUrl?: string;
  additionalUrl?: string;
  additionalUrlName?: string;
  additionalArticle?: string;
};

const simpleComment1 = 
`
■概要
回転する独楽とパフォーマンスステージをテーマに、回転するオブジェクトの動きとビジュアル表現を試みたリアルタイムに生成される映像と音を組み合わせたデモシーン作品。
自作ライブラリを用いてWebGL上で構築したデモ作品。

■作品のポイント
- WebGLによるリアルタイム描画および描画基盤の自作
- レイマーチングでのオブジェクト表現と発光表現の両立
- 共通の時間パラメータを基に、アニメーション・ポストエフェクト・音の変化を統合的に制御
- GUIを用いてパラメータ調整を行い、見え方を検証・調整

■工夫
- アニメーション・エフェクト・音の同一の時間軸で制御し、統一感のある演出となるようにした。
- 画面転換時にポストエフェクトを活用し、切り替わりを強調することで、初見でもシーンの変化を認識しやすいようにした。
- BGMのドラムの拍子に合わせて壁面の十字模様を動かし、空間と音の変化が同期して感じられるようにした。

担当範囲
ライブラリ設計 / 描画処理実装 / シェーダー実装 / 演出設計 / 音生成 / 作品テーマ設計

`;

const simpleComment2 = 
`
■概要
変形や反射を伴う光る欠片がトンネル状に連なる表現をテーマとした作品。
GLSL（フラグメントシェーダー）のみで構成。

■作品のポイント
- レイマーチングで反射・発光を同時に表現
- 時間パラメータによる段階的な形状変化の制御 
- UV座標を用いた画面分割エフェクトの実現
- 前半と後半で反射表現を切り替える構成

■工夫
- オブジェクトに定数を紐づけ、グローと通常描画を単一のレイマーチングループ内で両立した。
- 中央のオブジェクトがトンネルの形状と干渉せず見えるように調整した。
- 反射の有無が変化するようにし、見た目の印象が変わり単調にならないようにした。
- カットイン風の演出を用い、場面転換が直感的に認識できるようにした。
- トンネルの形状変化にexp関数を使ったイージングを用い、緩急をつけリズムのある変化となるようにした。

担当範囲
シェーダー実装 / 演出設計 / 作品テーマ設計

`;

const simpleComment3 = 
`
■概要
中央に置かれているバースデーケーキに近づき、火を消すまでの流れをテーマとした作品
GLSL(フラグメントシェーダー)のみで作成。

■作品のポイント
- レイマーチングによる立体表現
- スポットライトでケーキを照らすような表現
- スポットライトでケーキが照らされてから、火が消えて画面が暗転するまでの起承転結がある流れ

■工夫
- ケーキ、机、蝋燭の火などを全てレイマーチングでのオブジェクトの組み合わせで描画した。
- 時間の制御で起承転結がある作品を表現した。

担当範囲
シェーダー実装 / 演出設計 / 作品テーマ設計

`;

const simpleComment4 = 
`
■概要
様々な形状のポイントを結んだグラフを導火線とし、炎が伝播する表現をテーマとした作品。
p5.jsとGLSLで構成。

■作品のポイント
- ブルームを実装し、グラフが発光して見えるように表現
- ブルームの結果に対してfbmノイズの乗算とUVスクロールを組み合わせることで、グラフ上に炎が伝播していくような表現を実現
- 画面上下で色反転を行い視覚的変化を付与

■工夫
- ブルームとノイズの組み合わせにより、炎の揺らぎと発光感を両立した。
- リアルタイム展示を想定し、グラフにランダム性を持たせた変化を加えることで単調にならないようにした。
- どのタイミングで見ても、一連の表現として成立するような構成を意識した。

担当範囲
p5.jsスケッチ実装 / シェーダー実装 / 演出設計 / 作品テーマ設計

`;

const simpleComment5 = 
`
■概要
空の色をまとった独楽をモチーフとした作品。
GLSL（フラグメントシェーダー）のみで構成。

■作品のポイント
- レイマーチングによる立体表現と空を想起させる色彩表現
- FOVを時間変化＋イージングで制御するカメラ演出

■工夫
- FOV変化により構図の固定化を防ぎ、視覚的な変化と奥行き感を強化した。
- パーティクルにより空間の広がりと情報量を補完した。

担当範囲
シェーダー実装 / 演出設計 / 作品テーマ設計

`;

export const portfolioSketches: PortfolioSketch[] = [
{
    title: "TWIRL:STAGE",
    embedType: "youtube",
    embedId: "1ZRyR3I30CM?si=43Gz_pQFCfO10tbA",
    languages: ["GLSL", "WebGL", "TypeScript"],
    description: "SESSIONS2025 RealTimeGraphics で展示した 単一HTMLファイルによるBrowser Demo",
    simpleComment: simpleComment1,
    codeUrl: "https://github.com/SpinnerEddy/TWIRLSTAGE",
    additionalUrl: "https://youtu.be/ifvrVZEbS_Y?si=1RqoKNs3R2zq2OK9&t=1054",
    additionalUrlName: "SESSIONS2025 RealTimeGraphics",
    additionalArticle: ""
},
{
    title: "ReflectionFragments",
    embedType: "youtube",
    embedId: "J8515VaCgw8?si=JdFno94h4FToe2do&amp;start=572",
    languages: ["GLSL"],
    description: "SESSIONS2024 で展示した Code Graphics Compo",
    simpleComment: simpleComment2,
    additionalDescription: "※ サムネイルはYouTube仕様のため固定。再生位置は展示時の演出に合わせています。",
    codeUrl: "https://www.shadertoy.com/view/4fycWz",
},
{
    title: "BirthdayCakeWithSpotLight",
    embedType: "youtube",
    embedId: "EIdwQql6rdg?si=ibmCRoRbmPuI9z91&amp;start=570",
    languages: ["GLSL"],
    description: "TDF 16ms で展示した Code Graphics Compo",
    simpleComment: simpleComment3,
    additionalDescription: "※ サムネイルはYouTube仕様のため固定。再生位置は展示時の演出に合わせています。",
    codeUrl: "https://www.shadertoy.com/view/dscBzS",
    additionalUrl: "https://youtu.be/ifvrVZEbS_Y?si=1RqoKNs3R2zq2OK9&t=1054",
    additionalUrlName: "SESSIONS2025 RealTimeGraphics"
},
{
    title: "BlazingLineGraph",
    embedType: "youtube",
    embedId: "D9JMYGaXkNo?si=7UCSG7FYI8bDQk2u",
    languages: ["p5.js", "GLSL"],
    description: "Processing Community Days Tokyo 2023 で展示した p5スケッチ",
    simpleComment: simpleComment4,
    codeUrl: "https://openprocessing.org/sketch/1965058",
    additionalUrl: "https://www.youtube.com/live/6k6EDd2TIHE?si=sVW0xNHEkYgFhwhy&t=3836",
    additionalUrlName: "PCD2023の後アフタートークがあり、そこで少しお話させていただいております。",
    additionalArticle: ""
},
{
    title: "SkyColorSpinner",
    embedType: "youtube",
    embedId: "F-CbQTcHNrc?si=ZDs6FLlWIYfNctCp&amp;start=608",
    languages: ["GLSL"],
    description: "SESSIONS2023 で展示した Code Graphics Compo",
    simpleComment: simpleComment5,
    additionalDescription: "※ サムネイルはYouTube仕様のため固定。再生位置は展示時の演出に合わせています。",
    codeUrl: "https://www.shadertoy.com/view/mtdGzj",
    additionalArticle: ""
}];