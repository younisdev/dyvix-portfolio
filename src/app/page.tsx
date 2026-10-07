import HeaderNav from "@/components/HeaderNav";
import { getActiveConfig } from "./layout";
import LoadingWrapper from "@/components/LoadingWrapper";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import BodyCompiler from "@/components/BodyCompiler";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default async function Home() {
  const config = await getActiveConfig();
  return (
    <div
      className={`w-screen min-h-screen ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <LoadingWrapper config={config?.["components"]?.["loading"]}>
        <HeaderNav config={config?.["components"]?.["nav"]} />
        <BodyCompiler config={config?.["components"]?.["body"]} />
      </LoadingWrapper>
    </div>
  );
}
