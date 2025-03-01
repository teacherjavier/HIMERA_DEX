
import React, { useState } from "react";
import { TopBar } from "./TopBar";
import { SwapCard } from "./SwapCard";
import { PoolPrizes } from "./PoolPrizes";
import { SwapPoolChart } from "./SwapPoolChart";
import { PositionsTable } from "./PositionsTable";
import { HimeraChat } from "./HimeraChat";
import { ExistingStrategies } from "./ExistingStrategies";

export const DashboardLayout = () => {
  return (
    <div className="overflow-hidden pb-[7px]">
      <TopBar />
      <div className="mt-1 max-md:max-w-full">
        <div className="gap-1 flex max-md:flex-col max-md:items-stretch">
          {/* Left Column */}
          <div className="w-[23%] max-md:w-full max-md:ml-0">
            <div className="font-medium">
              <SwapCard />
              <PoolPrizes />
            </div>
          </div>

          {/* Middle Column */}
          <div className="w-[53%] max-md:w-full max-md:ml-0">
            <div className="max-md:max-w-full">
              <SwapPoolChart />
              <PositionsTable />
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[23%] max-md:w-full max-md:ml-0">
            <div className="grow">
              <HimeraChat />
              <ExistingStrategies />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
