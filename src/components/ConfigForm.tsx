/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ExerciseId, ExerciseConfig } from "../types";
import { generateDefaultConfigs, estimate1RM, roundTo5Kg } from "../utils/programGenerator";
import { Scale, Calculator, Info, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface ConfigFormProps {
  onGenerate: (configs: Record<ExerciseId, ExerciseConfig>) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onGenerate }) => {
  const [configs, setConfigs] = useState<Record<ExerciseId, ExerciseConfig>>(generateDefaultConfigs());
  
  // Interactive individual estimators state
  const [activeEstimator, setActiveEstimator] = useState<ExerciseId | null>(null);
  const [estWeight, setEstWeight] = useState<number>(80);
  const [estReps, setEstReps] = useState<number>(5);

  const handle1RMChange = (id: ExerciseId, value: number) => {
    const freshVal = Math.max(0, value);
    setConfigs(prev => {
      const config = prev[id];
      const intensity = config.intensityPercent;
      // Recalculate starting target weight (e.g. 75% of 1RM, rounded to 5kg)
      const rawStarting = (freshVal * intensity) / 100;
      const startingWeight = roundTo5Kg(rawStarting);

      return {
        ...prev,
        [id]: {
          ...config,
          current1RM: freshVal,
          startingWeight,
        }
      };
    });
  };

  const handleIntensityChange = (id: ExerciseId, percent: number) => {
    const pct = Math.min(100, Math.max(20, percent));
    setConfigs(prev => {
      const config = prev[id];
      const rawStarting = (config.current1RM * pct) / 100;
      const startingWeight = roundTo5Kg(rawStarting);

      return {
        ...prev,
        [id]: {
          ...config,
          intensityPercent: pct,
          startingWeight,
        }
      };
    });
  };

  const handleStartingWeightChange = (id: ExerciseId, value: number) => {
    // Directly update starting weight (rounded to 5kg)
    const freshVal = roundTo5Kg(Math.max(0, value));
    setConfigs(prev => {
      const config = prev[id];
      // Back-calculate virtual intensity percent (rounded)
      const intensityPercent = config.current1RM > 0 
        ? Math.round((freshVal / config.current1RM) * 100) 
        : 75;

      return {
        ...prev,
        [id]: {
          ...config,
          startingWeight: freshVal,
          intensityPercent,
        }
      };
    });
  };

  const openEstimator = (id: ExerciseId) => {
    setActiveEstimator(id);
    // Prep variables based on current 1RM config as starting point
    const currentConfig = configs[id];
    setEstWeight(currentConfig.current1RM > 40 ? Math.round(currentConfig.current1RM * 0.8 / 5) * 5 : 40);
    setEstReps(5);
  };

  const applyEstimated1RM = () => {
    if (activeEstimator) {
      const raw1RM = estimate1RM(estWeight, estReps);
      const computed1RM = roundTo5Kg(raw1RM);
      handle1RMChange(activeEstimator, computed1RM);
      setActiveEstimator(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(configs);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-805/85 p-6 md:p-8 max-w-4xl mx-auto my-6 text-white">
      <div className="mb-6 pb-6 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="text-emerald-400 w-5 h-5 fill-emerald-450/10 animate-bounce" />
            5x5 CORE 1RM & START WEIGHT CONFIG
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-emerald-400">
            AUTO ROUNDED 5KG UNITS
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
          현재 도달할 수 있는 1최대반복수량(1RM)을 입력하십시오. 잘 모르시는 경우 종목별 우측 상단 <span className="text-emerald-400 font-bold">계산기</span> 툴을 클릭해 추정할 수 있습니다.<br />
          5x5 선형 진행 프로그램은 원활한 과부하 누적과 부상 통제를 위해 <span className="text-emerald-400 font-bold">1RM의 70%~75% 무게로 시작</span>하여 매주 5kg씩 안정적으로 누적하는 것을 권유합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {(Object.keys(configs) as ExerciseId[]).map((id) => {
            const config = configs[id];
            const isEstimatorActive = activeEstimator === id;

            return (
              <div 
                key={id} 
                className="p-5 bg-zinc-950 border border-zinc-800/70 rounded-2xl hover:border-emerald-500/50 shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title & Badge */}
                  <div className="min-w-[180px]">
                    <span className="text-[10px] font-black text-zinc-550 uppercase tracking-widest block mb-1 font-mono">
                      SYSTEM EXERCISE : {config.name}
                    </span>
                    <h3 className="text-lg font-black font-display text-white">
                      {config.nameKr}
                    </h3>
                  </div>

                  {/* 1RM Input with Estimator Trigger */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    
                    {/* 1RM Column */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider font-mono">현재 1RM (kg)</label>
                        <button
                          type="button"
                          onClick={() => openEstimator(id)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-350 font-black tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Calculator className="w-3 h-3" />
                          추정 계산기
                        </button>
                      </div>
                      <div className="relative rounded-xl">
                        <input
                          type="number"
                          step="5"
                          min="20"
                          value={config.current1RM || ""}
                          onChange={(e) => handle1RMChange(id, Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-705 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono font-black text-base px-3 py-2 rounded-xl text-center transition-all"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-black text-zinc-500 font-mono">KG</span>
                      </div>
                    </div>

                    {/* Starting Intensity Column */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider font-mono">
                          출발 훈련 강도
                        </label>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          {config.intensityPercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 bg-zinc-90 w-full rounded-xl">
                        <input
                          type="range"
                          min="50"
                          max="90"
                          step="5"
                          value={config.intensityPercent}
                          onChange={(e) => handleIntensityChange(id, Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Starting 5x5 Weight */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1.5 font-mono">
                        1주차 출발 세트 무게
                      </label>
                      <div className="relative rounded-xl">
                        <input
                          type="number"
                          step="5"
                          min="20"
                          value={config.startingWeight || ""}
                          onChange={(e) => handleStartingWeightChange(id, Number(e.target.value))}
                          className="w-full bg-emerald-950/40 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-400 font-mono font-black text-base px-3 py-2 rounded-xl text-center"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-black text-emerald-500 font-mono">KG</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanded single inline estimator calculator drawer */}
                {isEstimatorActive && (
                  <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                      <h4 className="text-[10px] font-black font-display text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-400" />
                        {config.nameKr} EPLEY'S 1RM ESTIMATE ENGINE
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setActiveEstimator(null)}
                        className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider"
                      >
                        CLOSE
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5 font-mono">최고 반복 무게 (kg)</label>
                        <input
                          type="number"
                          value={estWeight}
                          onChange={(e) => setEstWeight(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg text-sm px-3 py-2 text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5 font-mono">반복 완수 횟수 (Reps)</label>
                        <select
                          value={estReps}
                          onChange={(e) => setEstReps(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg text-sm px-3 py-2 text-center font-bold text-white focus:ring-1 focus:ring-emerald-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map(r => (
                            <option key={r} value={r} className="bg-zinc-950">{r}회 완수</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-zinc-800 text-xs">
                      <div className="text-zinc-450 font-medium">
                        분석 로그: <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{estWeight} kg</span> x <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{estReps}회</span> 
                        <span className="mx-2 text-zinc-750">|</span> 
                        합산 1RM 통제: <span className="font-mono font-black text-emerald-400">{roundTo5Kg(estimate1RM(estWeight, estReps))} kg</span>
                      </div>
                      <button
                        type="button"
                        onClick={applyEstimated1RM}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-zinc-950 rounded-lg font-black text-xs transition-all tracking-wider uppercase cursor-pointer"
                      >
                        통제량 적용
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress preview subline */}
                <div className="mt-3.5 flex items-center gap-2 text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-2.5 font-mono">
                  <span className="font-extrabold text-zinc-500 uppercase tracking-widest">ROADMAP:</span>
                  <span>1W {config.startingWeight}kg</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700" />
                  <span>2W {config.startingWeight + 5}kg</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700" />
                  <span>3W {config.startingWeight + 10}kg</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700" />
                  <span className="text-emerald-400 font-extrabold">🚨 4W peak {config.startingWeight + 15}kg (+1RM {roundTo5Kg(config.current1RM + 10)}kg 상당)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate Program Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:transform active:scale-99 text-zinc-950 font-black font-display text-lg py-4 px-6 rounded-2xl shadow-xl shadow-emerald-950/20 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-widest"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            4주 증강 5x5 매니페스트 발급
          </button>
        </div>
      </form>
    </div>
  );
};
