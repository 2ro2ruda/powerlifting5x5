/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SessionExercise, ExerciseId } from "../types";
import { PlateCalculatorView } from "./PlateCalculatorView";
import { Check, Info, Award, HelpCircle, Eye, EyeOff } from "lucide-react";

interface WorkoutCardProps {
  exercise: SessionExercise;
  onUpdateReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onForceComplete: (exerciseId: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  exercise,
  onUpdateReps,
  onForceComplete,
}) => {
  const [showPlateGuide, setShowPlateGuide] = useState<boolean>(false);

  // Helper color logic based on the reps done
  const getRepColor = (rep: number) => {
    if (rep === -1) return "bg-zinc-950 text-zinc-600 border-zinc-800 hover:border-emerald-500 hover:bg-zinc-900 hover:text-emerald-400";
    if (rep === 5) return "bg-emerald-500 text-zinc-950 border-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)]";
    if (rep >= 3) return "bg-amber-500 text-zinc-950 border-amber-400 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.2)]";
    return "bg-rose-600 text-white border-rose-500 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.2)]";
  };

  // Cycle through reps: -1 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0 -> -1
  const handleCircleClick = (setIndex: number) => {
    const currentReps = exercise.completedReps[setIndex];
    let nextReps = -1;

    if (currentReps === -1) {
      nextReps = 5;
    } else if (currentReps === 5) {
      nextReps = 4;
    } else if (currentReps === 4) {
      nextReps = 3;
    } else if (currentReps === 3) {
      nextReps = 2;
    } else if (currentReps === 2) {
      nextReps = 1;
    } else if (currentReps === 1) {
      nextReps = 0;
    } else {
      nextReps = -1;
    }

    onUpdateReps(exercise.id, setIndex, nextReps);
  };

  const isExerciseFullySuccessful = exercise.completedReps.every(r => r === 5);
  const isStarted = exercise.completedReps.some(r => r !== -1);
  const isDone = exercise.completedReps.every(r => r !== -1);

  return (
    <div className={`border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
      isExerciseFullySuccessful 
        ? 'border-emerald-500/30 bg-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.06)]' 
        : isDone 
          ? 'border-amber-500/30 bg-zinc-950/90 shadow-[0_0_20px_rgba(245,158,11,0.04)]'
          : 'border-zinc-800/80 bg-zinc-900 shadow-xl'
    } text-white`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Exercise Information */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black font-display text-white tracking-wide">
              {exercise.nameKr}
            </h4>
            {isExerciseFullySuccessful && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest font-mono">
                <Check className="w-3 h-3 stroke-[3]" />
                PR 성공 (+5kg)
              </span>
            )}
            {isDone && !isExerciseFullySuccessful && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-mono">
                강도 유지
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">TARGET LOAD</span>
              <span className="text-2xl font-mono font-black text-emerald-400 block leading-none mt-1">
                {exercise.targetWeight} <span className="text-xs font-sans text-zinc-400">kg</span>
              </span>
            </div>
            
            <div className="border-l border-zinc-800 pl-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">REPETITIONS</span>
              <span className="text-sm font-bold font-mono mt-1 text-zinc-300 block">
                {exercise.targetSets} 세트 × {exercise.targetReps} 회
              </span>
            </div>

            <div className="border-l border-zinc-800 pl-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">MECHANICS</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 block mt-1 uppercase tracking-wider font-mono">
                {exercise.exerciseId === ExerciseId.DEADLIFT ? "1WORKING-SET LIMIT" : "5x5 PROGRESSIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Set Interactive Toggles */}
        <div className="flex flex-col items-start sm:items-end gap-2.5">
          <span className="text-[10px] font-black text-zinc-550 uppercase tracking-widest block font-mono">
            세트 수동 기록 (클릭하여 횟수 입력)
          </span>

          <div className="flex items-center gap-2">
            {exercise.completedReps.map((rep, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleCircleClick(idx)}
                  className={`w-12 h-12 rounded-xl border-2 font-mono font-black text-base transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${getRepColor(rep)}`}
                >
                  {rep === -1 ? "-" : rep}
                </button>
                <span className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-wider font-mono">
                  S{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barbell Calculator Toggle Button and expandable */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowPlateGuide(!showPlateGuide)}
          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-zinc-950 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-zinc-950 border border-zinc-805 px-3 py-1.5 rounded-lg transition-all"
        >
          {showPlateGuide ? (
            <>
              <EyeOff className="w-4 h-4 text-emerald-400" />
              원반 로딩 가이드 닫기
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-emerald-400" />
              바벨 원반 로딩 정보 ({exercise.targetWeight}kg)
            </>
          )}
        </button>

        {!isDone && (
          <button
            type="button"
            onClick={() => onForceComplete(exercise.id)}
            className="text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            일괄 성공 (5X5 COMPLETE)
          </button>
        )}
      </div>

      {showPlateGuide && (
        <PlateCalculatorView targetWeight={exercise.targetWeight} />
      )}
    </div>
  );
};
