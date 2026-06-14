/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Dumbbell, Award, HelpCircle } from "lucide-react";

interface HeaderProps {
  progressPercent: number;
  completedDays: number;
  totalDays: number;
  onResetProgram: () => void;
  programGenerated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  progressPercent,
  completedDays,
  totalDays,
  onResetProgram,
  programGenerated,
}) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-white py-6 px-4 md:px-8 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Dumbbell className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                  HEAVY-DUTY 5x5
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-md font-mono">
                  PRO SYSTEM
                </span>
              </div>
              <h1 className="text-2xl font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 mt-1 uppercase">
                5x5 STRENGTH PLANNER
              </h1>
              <p className="text-zinc-400 text-xs mt-1 font-medium leading-relaxed">
                파워리프팅 무게 수직 증강 및 1RM 개화를 위한 4주 완성 선형 진행 터미널
              </p>
            </div>
          </div>
        </div>

        {programGenerated && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Real-time progress metric */}
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3.5 px-5 flex items-center gap-4 flex-1 md:flex-none min-w-[200px] shadow-lg">
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#18181b"
                    strokeWidth="4.5"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                    className="transition-all duration-700 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-black text-emerald-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div>
                <p className="text-[11px] text-zinc-450 uppercase font-bold tracking-widest">SYSTEM PROGRESS</p>
                <p className="text-sm font-extrabold text-white font-mono mt-0.5">
                  {completedDays} / {totalDays} 세션 완수
                </p>
              </div>
            </div>

            {/* Clear/Reset button */}
            <button
              onClick={() => {
                if (window.confirm("정말로 프로그램을 초기화하고 처음부터 다시 설정하시겠습니까? 지금까지의 증강 기록이 영구히 삭제됩니다.")) {
                  onResetProgram();
                }
              }}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
            >
              포맷 / 재설정
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
