export type PortfolioSketch = {
  title: string;
  embedType: "youtube" | "shadertoy" | "iframe";
  embedId: string;
  languages: string[];
  description: string;
  codeUrl?: string;
  additionalUrl?: string;
  additionalUrlName?: string;
};

export const portfolioSketches: PortfolioSketch[] = [
{
    title: "TWIRL:STAGE",
    embedType: "youtube",
    embedId: "1ZRyR3I30CM?si=43Gz_pQFCfO10tbA",
    languages: ["GLSL", "WebGL", "TypeScript"],
    description: "SESSIONS2025 RealTimeGraphics で展示した Browser Demo",
    codeUrl: "https://github.com/SpinnerEddy/TWIRLSTAGE",
    additionalUrl: "https://youtu.be/ifvrVZEbS_Y?si=1RqoKNs3R2zq2OK9&t=1054",
    additionalUrlName: "SESSIONS2025 RealTimeGraphics"
},
{
    title: "ReflectionFragments",
    embedType: "youtube",
    embedId: "J8515VaCgw8?si=JdFno94h4FToe2do&amp;start=572",
    languages: ["GLSL"],
    description: "SESSIONS2024 で展示した Code Graphics Compo",
    codeUrl: "https://www.shadertoy.com/view/4fycWz",
},
{
    title: "BirthdayCakeWithSpotLight",
    embedType: "youtube",
    embedId: "EIdwQql6rdg?si=ibmCRoRbmPuI9z91&amp;start=570",
    languages: ["GLSL"],
    description: "TDF 16ms で展示した Code Graphics Compo",
    codeUrl: "https://www.shadertoy.com/view/dscBzS",
    additionalUrl: "https://youtu.be/ifvrVZEbS_Y?si=1RqoKNs3R2zq2OK9&t=1054",
    additionalUrlName: "SESSIONS2025 RealTimeGraphics"
},
{
    title: "BlazingLineGraph",
    embedType: "youtube",
    embedId: "D9JMYGaXkNo?si=7UCSG7FYI8bDQk2u",
    languages: ["p5.js", "GLSL"],
    description: "PCD Tokyo 2023 で展示した p5スケッチ",
    codeUrl: "https://openprocessing.org/sketch/1965058",
    additionalUrl: "https://www.youtube.com/live/6k6EDd2TIHE?si=sVW0xNHEkYgFhwhy&t=3836",
    additionalUrlName: "PCD2023の後アフタートークがあり、そこで少しお話させていただいております。"
},
{
    title: "SkyColorSpinner",
    embedType: "youtube",
    embedId: "F-CbQTcHNrc?si=ZDs6FLlWIYfNctCp&amp;start=608",
    languages: ["GLSL"],
    description: "SESSIONS2023 で展示した Code Graphics Compo",
    codeUrl: "https://www.shadertoy.com/view/mtdGzj",
}];