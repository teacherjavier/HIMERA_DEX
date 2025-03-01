
import React from "react";

export const ExistingStrategies = () => {
  return (
    <section className="border border-[color:var(--Neutral-Colors-400,#5F5F5B)] shadow-[1px_1px_1px_0px_rgba(16,25,52,0.40)] bg-[#1E1E1E] flex flex-col items-stretch text-[10px] text-white font-medium leading-[14px] px-[9px] py-[18px] rounded-[5px] border-solid">
      <h2 className="text-[#E7E7E6] text-base leading-none">
        Existing Strategies
      </h2>

      <div className="rounded-sm bg-[#B2B1AE]/30 p-2 mb-1 border-2 border-solid border-2 border-solid border-[#5F5F5B] flex w-full flex-col mt-2.5 p-2.5">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm">Strategy 01</h3>
          <p className="text-white/80">
            This strategy triggers a trade when the liquidity of the "liquidity pool 1" changes by more than 5% in 5 minutes
          </p>
          <div className="font-bold bg-[#B2B1AE]/10 p-2 rounded-sm hover:bg-[#DFF3FD]/30">
            Trigger: Liquidity change 20% in minutes
          </div>
        </div>
      </div>

      <div className="mt-2.5 rounded-sm bg-[#B2B1AE]/30 p-2 mb-1 border-2 border-solid border-2 border-solid border-[#5F5F5B] p-2.5">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm">Strategy 02s</h3>
          <p className="text-white/80">
            This strategy triggers a trade when the liquidity of the "liquidity pool 1" changes by more than 5% in 5 minutes
          </p>
          <div className="font-bold bg-[#B2B1AE]/10 p-2 rounded-sm hover:bg-[#DFF3FD]/30">
            Trigger: Liquidity change 20% in minutes
          </div>
        </div>
      </div>
    </section>
  );
};

