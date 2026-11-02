"use client";

import React from "react";

export default function ClientBodyStyling({
  backgroundColor,
}: {
  backgroundColor: string;
}) {
  React.useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [backgroundColor]);

  return null;
}
