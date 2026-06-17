"use client";

import { useState } from "react";
import { simConfig } from "@repo/data";
import { strings } from "@repo/tokens";

const s = strings.devToolbar;

export const DevToolbar = () => {
  const [fail, setFail] = useState(false);
  const [noDelay, setNoDelay] = useState(false);

  const setFailMode = (next: boolean) => {
    setFail(next);
    simConfig.fail = next;
  };

  const setDelayMode = (skipDelay: boolean) => {
    setNoDelay(skipDelay);
    simConfig.noDelay = skipDelay;
  };

  return (
    <div className="hidden md:flex fixed bottom-5 right-5 z-[200] items-center gap-2 rounded-full border border-sand-400 bg-white px-3 py-1.5 shadow-md">
      <span className="text-[12px] font-medium text-muted-foreground">{s.label}</span>

      <div className="flex rounded-full bg-sand-200 p-[2px] gap-[2px]">
        <button
          onClick={() => setFailMode(false)}
          className={[
            "rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-normal",
            !fail ? "bg-teal-600 text-white shadow-sm" : "text-muted-foreground hover:text-espresso-900",
          ].join(" ")}
        >
          {s.ok}
        </button>
        <button
          onClick={() => setFailMode(true)}
          className={[
            "rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-normal",
            fail ? "bg-destructive text-white shadow-sm" : "text-muted-foreground hover:text-espresso-900",
          ].join(" ")}
        >
          {s.fail}
        </button>
      </div>

      <div className="h-4 w-px bg-sand-400" />

      <div className="flex rounded-full bg-sand-200 p-[2px] gap-[2px]">
        <button
          onClick={() => setDelayMode(false)}
          className={[
            "rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-normal",
            !noDelay ? "bg-white text-espresso-900 shadow-sm" : "text-muted-foreground hover:text-espresso-900",
          ].join(" ")}
        >
          {s.delay}
        </button>
        <button
          onClick={() => setDelayMode(true)}
          className={[
            "rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-normal",
            noDelay ? "bg-white text-espresso-900 shadow-sm" : "text-muted-foreground hover:text-espresso-900",
          ].join(" ")}
        >
          {s.fast}
        </button>
      </div>
    </div>
  );
};
