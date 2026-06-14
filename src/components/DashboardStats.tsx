/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { WeeklyProgram, ExerciseConfig, ExerciseId } from "../types";
import { roundTo5Kg } from "../utils/programGenerator";
import { Award, Target, TrendingUp, CheckCircle, Calendar, Sparkles } from "lucide-react";

interface DashboardStatsProps {
  weeks: WeeklyProgram[];
  configs: Record<ExerciseId, ExerciseConfig>;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ weeks, configs }) => {
  // Calculate total sessions and completed ones
  const totalSessions = weeks.reduce((acc, week) => acc + week.sessions.length, 0);
  const completedSessions = weeks.reduce(
    (acc, week) => acc + week.sessions.filter((s) => s.isCompleted).length,
    0
  );

  return (
    <div className="bg-zinc-900 text-white rounded-3xl p-6 md:p-8 max-w-4xl mx-auto my-6 border border-zinc-805/85 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-xl font-black font-display flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            STRENGTH ROADMAP & 1RM FORECAST
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            5x5 선형 점진 증강 완료 시 기대할 수 있는 스트렝스 한계 변화 기댓값
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black font-mono uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          {completedSessions} / {totalSessions} 세션 수행 완료
        </div>
      </div>

      {/* Grid of lifts showing progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(Object.keys(configs) as ExerciseId[]).map((id) => {
          const config = configs[id];
          const startWeight = config.startingWeight;
          const peakWeight = startWeight + 15; // 4 weeks linear increment (+0, +5, +10, +15)

          // Est 1RM increases. Powerlifters can expect ~ 5-10% strength gain in 4 weeks.
          const estFinal1RM = roundTo5Kg(peakWeight * 1.166);
          const current1RM = config.current1RM;
          const delta = estFinal1RM - current1RM;

          return (
            <div key={id} className="bg-zinc-950 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest">
                    {config.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-zinc-850 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                    주 +5KG 정진
                  </span>
                </div>
                <h4 className="text-sm font-black font-display text-zinc-250 mt-2">{config.nameKr}</h4>

                {/* Progress bar timeline */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>1W: {startWeight}kg</span>
                    <span>4W: {peakWeight}kg</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden flex border border-zinc-800/50">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* 1RM Change badge */}
              <div className="mt-5 pt-4 border-t border-zinc-850 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">기존 1RM</span>
                  <span className="text-xs font-mono font-bold text-zinc-350">{current1RM}kg</span>
                </div>
                <div className="text-center font-mono font-black bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-emerald-400 text-[10px]">
                  +{delta > 0 ? delta : 5}kg 증강
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-400 block font-bold flex items-center justify-end gap-0.5 uppercase tracking-wider font-mono">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" /> 예상 1RM
                  </span>
                  <span className="text-sm font-mono font-black text-emerald-300">
                    {Math.max(current1RM + 5, estFinal1RM)}kg
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar timeline layout */}
      <h4 className="text-xs font-black text-zinc-300 mb-3 uppercase tracking-wider flex items-center gap-1.5 font-mono">
        <CheckCircle className="w-4 h-4 text-emerald-450" />
        4-WEEK PERFORMANCE HEATMAP (전체 수행도 체크)
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2 text-center text-xs">
        {weeks.flatMap((week) =>
          week.sessions.map((session, dayIdx) => {
            const isDone = session.isCompleted;
            return (
              <div
                key={session.id}
                className={`p-2.5 rounded-xl border flex flex-col justify-between h-14 transition-all ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                    : "bg-zinc-950 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-mono">
                  W{week.weekNumber}D{dayIdx + 1}
                </div>
                <div className="font-mono text-[9px] font-black uppercase">
                  {isDone ? "완료" : session.type === 'A' ? "루틴 A" : "루틴 B"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
