export type PortfolioSketch = {
  title: string;
  embedType: "youtube" | "shadertoy" | "iframe";
  embedId: string;
  languages: string[];
  description: string;
  codeUrl?: string;
};

export const portfolioSketches: PortfolioSketch[] = [
  {
    title: "TWIRL:STAGE",
    embedType: "youtube",
    embedId: "1ZRyR3I30CM?si=43Gz_pQFCfO10tbA",
    languages: ["GLSL", "WebGL", "TypeScript"],
    description: "SESSIONS2025 RealTimeGraphics で提出した Browser Demo",
    codeUrl: "https://github.com/SpinnerEddy/TWIRLSTAGE"
  }
];