import HeaderNav from "@/components/HeaderNav";
import { getActiveConfig } from "./layout";
import LoadingWrapper from "@/components/LoadingWrapper";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import BodyCompiler from "@/components/BodyCompiler";
import ClientBodyStyling from "./client";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default async function Home() {
  const config = await getActiveConfig();
  const backgroundColor = config["backgroundColor"] || "#17160b";

  return (
    <div
      className={`w-full h-full ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <ClientBodyStyling backgroundColor={backgroundColor} />
      <LoadingWrapper config={config?.["components"]?.["loading"]}>
        <HeaderNav config={config?.["components"]?.["nav"]} />
        <BodyCompiler config={config?.["components"]?.["body"]} />
      </LoadingWrapper>
    </div>
  );
}
