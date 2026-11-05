"use client;";

import { parseMainConfigVars } from "@/app/utils";
import BodyCompiler from "@/components/BodyCompiler";
import HeaderNav from "@/components/HeaderNav";
import LoadingWrapper from "@/components/LoadingWrapper";
import React from "react";

export default function PlaygroundPreview({
  config,
}: {
  config: Record<string, any>;
}) {
  const parsedConfig = React.useMemo(
    () => parseMainConfigVars(config),
    [config],
  );
  const backgroundColor = parsedConfig["backgroundColor"] || "#17160b";

  return (
    <div style={{ background: backgroundColor }} className="playground-holder">
      <LoadingWrapper config={parsedConfig?.["components"]?.["loading"]}>
        <MemomizedPlaygroundBody config={parsedConfig} />
      </LoadingWrapper>
    </div>
  );
}

const MemomizedPlaygroundBody = React.memo(function PlaygroundBody({
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
});
