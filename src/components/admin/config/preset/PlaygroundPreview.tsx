"use client;";

import BodyCompiler from "@/components/BodyCompiler";
import HeaderNav from "@/components/HeaderNav";
import LoadingWrapper from "@/components/LoadingWrapper";

export default function PlaygroundPreview({
  config,
}: {
  config: Record<string, any>;
}) {
  const backgroundColor = config["backgroundColor"] || "#17160b";

  return (
    <div style={{ background: backgroundColor }} className="playground-holder">
      <LoadingWrapper config={config?.["components"]?.["loading"]}>
        <PlaygroundBody config={config} />
      </LoadingWrapper>
    </div>
  );
}

function PlaygroundBody({
  config,
  tl,
}: {
  config: Record<string, any>;
  tl?: gsap.core.Timeline | null;
}) {
  return (
    <div className="playground-scroll">
      <HeaderNav config={config?.["components"]?.["nav"]} debug tl={tl} />
      <BodyCompiler config={config?.["components"]?.["body"]} tl={tl} />
    </div>
  );
}
