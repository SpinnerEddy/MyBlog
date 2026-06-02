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
独楽をモチーフに、音と同期した演出やポストエフェクトを用いたリアルタイムグラフィックス作品。
自作ライブラリを用いてWebGL上で構築したデモ作品。

■作品のポイント
- WebGLによるリアルタイム描画および描画基盤の自作
- レイマーチングによる立体表現
- ポストエフェクト（ブラー・グリッチ）の実装
- 音シェーダーによる音生成と映像の同期

■工夫
- 外部ライブラリに依存せず自作することで、描画処理の理解と拡張性の確保を両立
- ポストエフェクトを用いた画面遷移や音との同期により、視覚的な変化と演出性を強化

担当範囲
ライブラリ設計 / 描画処理実装 / シェーダー実装 / 演出設計 / 音生成 / 作品テーマ設計

`;

const simpleComment2 = 
`
■概要
変形や反射を伴う光る欠片がトンネル状に連なる表現をテーマとした作品。
GLSL（フラグメントシェーダー）のみで構成。

■作品のポイント
- レイマーチングによる立体表現
- オブジェクトの縁を発光させる表現
- イージングを用いたキレのある形状変化
- カットイン的な画面切り替え演出
- 前半と後半で反射表現を切り替える構成

■工夫
オブジェクトに定数を紐づけ、グローと通常描画を単一のレイマーチングループ内で両立
exp関数を用い、緩急のあるイージングを実現

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
- ケーキ、机、蝋燭の火などを全てレイマーチングでのオブジェクトの組み合わせで描画
- 時間の操作で起承転結がある作品を表現

担当範囲
シェーダー実装 / 演出設計 / 作品テーマ設計

`;

const simpleComment4 = 
`
■概要
様々な形状のポイントを結んだグラフを導火線とし、炎が伝播する表現をテーマとした作品。
p5.jsとGLSLで構成。

■作品のポイント
- p5.jsで生成したグラフをテクスチャとしてシェーダーに渡しポストエフェクトを適用
- ブルームとノイズを組み合わせた炎表現
- 画面上下で色反転を行い視覚的変化を付与

■工夫
- ブルームとノイズの組み合わせにより、炎の揺らぎと発光感を両立

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
- FOV変化により構図の固定化を防ぎ、視覚的な変化と奥行き感を強化
- パーティクルにより空間の広がりと情報量を補完

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