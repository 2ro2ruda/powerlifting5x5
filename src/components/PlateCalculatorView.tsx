/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { calculatePlates } from "../utils/programGenerator";
import { Scale } from "lucide-react";

interface PlateCalculatorViewProps {
  targetWeight: number;
}

export const PlateCalculatorView: React.FC<PlateCalculatorViewProps> = ({ targetWeight }) => {
  const result = calculatePlates(targetWeight, 20); // 20kg Standard Barbell

  const platesConfig = [
    { label: "25kg", count: result["25"], color: "bg-rose-700 text-white border-rose-900", height: "h-20 w-5" },
    { label: "20kg", count: result["20"], color: "bg-blue-600 text-white border-blue-900", height: "h-18 w-5" },
    { label: "15kg", count: result["15"], color: "bg-amber-500 text-zinc-950 border-amber-600", height: "h-16 w-5" },
    { label: "10kg", count: result["10"], color: "bg-emerald-600 text-white border-emerald-800", height: "h-14 w-5" },
    { label: "5kg", count: result["5"], color: "bg-zinc-400 text-zinc-950 border-zinc-550", height: "h-11 w-4" },
    { label: "2.5kg", count: result["2.5"], color: "bg-zinc-700 text-zinc-200 border-zinc-900", height: "h-8 w-3.5" },
  ];

  const hasPlates = platesConfig.some((p) => p.count > 0);

  // Generate array of plate elements for visual barbell side
  const visualPlates: React.ReactElement[] = [];

  platesConfig.forEach((plate) => {
    for (let i = 0; i < plate.count; i++) {
      visualPlates.push(
        <div
          key={`${plate.label}-${i}`}
          className={`flex items-center justify-center font-mono text-[9px] font-black rounded border transition-transform duration-300 hover:scale-105 select-none ${plate.color} ${plate.height}`}
          title={`${plate.label}`}
        >
          <span className="rotate-90 origin-center whitespace-nowrap">{plate.label}</span>
        </div>
      );
    }
  });

  return (
    <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-3 text-xs font-black text-zinc-300 uppercase tracking-wider font-mono">
        <Scale className="w-4 h-4 text-emerald-400" />
        BARBELL LOADING PLAN (양쪽 대칭 로드, 20KG 표준 올림픽바 기준)
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        {/* Visual Barbell Rendering */}
        <div className="w-full flex-1 flex items-center justify-center py-2 h-24 overflow-x-auto">
          {hasPlates ? (
            <div className="flex items-center gap-0.5 relative">
              {/* Left hand sleeve / bar end */}
              <div className="h-4 w-12 bg-zinc-600 rounded-l border-r border-zinc-500 z-10" />
              {/* Bar collar spacer */}
              <div className="h-8 w-2 bg-zinc-800 rounded-sm z-20" />

              {/* Stacked plates side by side */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
                {visualPlates}
              </div>

              {/* Barbell sleeve connection center */}
              <div className="h-3 w-20 bg-zinc-700 relative flex items-center justify-center border-y border-zinc-650">
                <span className="absolute text-[8px] text-zinc-100 font-black tracking-widest whitespace-nowrap font-mono">SHAFT 20KG</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">NO PLATES LOADED - EMPTY BARBELL ONLY (20KG)</div>
          )}
        </div>

        {/* Plates breakdown label */}
        <div className="mb-1 text-right sm:min-w-[180px]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold font-mono">꽂아야 하는 한쪽 원반</p>
          <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-center gap-1.5 mt-1.5">
            {hasPlates ? (
              platesConfig
                .filter((p) => p.count > 0)
                .map((p) => (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono font-bold text-zinc-300"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-zinc-950 shadow-sm" style={{
                      backgroundColor: p.label === "25kg" ? "#dc2626" : p.label === "20kg" ? "#2563eb" : p.label === "15kg" ? "#eab308" : p.label === "10kg" ? "#16a34a" : p.label === "5kg" ? "#94a3b8" : "#4b5563"
                    }} />
                    {p.label} × {p.count}개
                  </span>
                ))
            ) : (
              <span className="text-xs text-zinc-500 font-mono">경량 빈 봉 유지</span>
            )}
            {hasPlates && (
              <div className="text-[10px] text-zinc-450 font-mono font-semibold mt-1">
                <span className="text-zinc-500 font-medium">원반무게:</span> {result.totalSideWeight}kg × 2 = {result.totalSideWeight * 2}kg <span className="text-emerald-400 font-extrabold">(총 {targetWeight}kg)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
