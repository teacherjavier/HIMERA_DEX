
import React from "react";

export const TabButtons = () => (
  <div className="self-stretch flex min-w-60 w-full flex-wrap flex-1 shrink basis-[0%] my-auto max-md:max-w-full">
    <button className="self-stretch border-b-[color:var(--Secondary-Colors-Color-2,#DFF3FD)] min-h-12 gap-2 text-[#DFF3FD] whitespace-nowrap px-4 py-[15px] border-b-2 border-solid">
      Positions
    </button>
    <button className="self-stretch min-h-12 gap-2 whitespace-nowrap px-4 py-[15px]">
      Orders
    </button>
    <button className="self-stretch min-h-12 gap-2 px-4 py-[15px]">
      Trade History
    </button>
    <button className="self-stretch min-h-12 gap-2 px-4 py-[15px]">
      Account Status
    </button>
  </div>
);
