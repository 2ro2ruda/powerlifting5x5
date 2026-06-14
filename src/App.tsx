/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ProgramState, ExerciseId, ExerciseConfig, WeeklyProgram, WorkoutSession, SessionExercise } from "./types";
import { generateDefaultConfigs, generate4WeekProgram } from "./utils/programGenerator";
import { Header } from "./components/Header";
import { ConfigForm } from "./components/ConfigForm";
import { WorkoutCard } from "./components/WorkoutCard";
import { DashboardStats } from "./components/DashboardStats";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, CheckCircle2, ChevronRight, ChevronLeft, Award, HelpCircle, Sparkles, TrendingUp, RefreshCw, ClipboardList } from "lucide-react";

const STORAGE_KEY = "powerlifting_5x5_tracker_state";

export default function App() {
  const [state, setState] = useState<ProgramState | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic schema verification
        if (parsed.configs && parsed.weeks) {
          setState(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Local storage loading error", e);
    }
    
    // Fallback default state
    setState({
      configs: generateDefaultConfigs(),
      weeks: [],
      activeWeek: 1,
      activeDay: 0,
      programGenerated: false,
      historyLog: [],
    });
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center text-white">
        <div className="text-center font-black">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">CREATING HARDCORE STATIONS...</span>
        </div>
      </div>
    );
  }

  const handleGenerateProgram = (configs: Record<ExerciseId, ExerciseConfig>) => {
    const weeks = generate4WeekProgram(configs);
    setState({
      configs,
      weeks,
      activeWeek: 1,
      activeDay: 0,
      programGenerated: true,
      historyLog: [
        {
          date: new Date().toLocaleDateString(),
          action: "프로그램 생성",
          details: "4주 차 5x5 파워리프팅 운동프로그램을 성공적으로 구성했습니다.",
        }
      ],
    });
    showToast("4주 증량 프로그램이 성공적으로 빌드되었습니다!");
  };

  const handleResetProgram = () => {
    setState({
      configs: generateDefaultConfigs(),
      weeks: [],
      activeWeek: 1,
      activeDay: 0,
      programGenerated: false,
      historyLog: [],
    });
    showToast("프로그램설정이 완전히 포맷되었습니다.");
  };

  const currentWeek = state.weeks.find(w => w.weekNumber === state.activeWeek);
  const currentSession = currentWeek?.sessions[state.activeDay];

  const handleUpdateReps = (exerciseId: string, setIndex: number, reps: number) => {
    if (!state.weeks.length) return;

    setState(prev => {
      if (!prev) return prev;
      const updatedWeeks = prev.weeks.map(week => {
        if (week.weekNumber !== prev.activeWeek) return week;

        const updatedSessions = week.sessions.map((session, dayIdx) => {
          if (dayIdx !== prev.activeDay) return session;

          const updatedExercises = session.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            const updatedReps = [...ex.completedReps];
            updatedReps[setIndex] = reps;

            // Check if all sets are typed in and successful
            const isCompleted = updatedReps.every(r => r !== -1);

            return {
              ...ex,
              completedReps: updatedReps,
              isCompleted,
            };
          });

          return {
            ...session,
            exercises: updatedExercises,
          };
        });

        return {
          ...week,
          sessions: updatedSessions,
        };
      });

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };

  // Easily fill everything with 5 reps (convenient shortcut!)
  const handleForceComplete = (exerciseId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const updatedWeeks = prev.weeks.map(week => {
        if (week.weekNumber !== prev.activeWeek) return week;

        const updatedSessions = week.sessions.map((session, dayIdx) => {
          if (dayIdx !== prev.activeDay) return session;

          const updatedExercises = session.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            const repsVal = Array(ex.targetSets).fill(5);

            return {
              ...ex,
              completedReps: repsVal,
              isCompleted: true,
            };
          });

          return {
            ...session,
            exercises: updatedExercises,
          };
        });

        return {
          ...week,
          sessions: updatedSessions,
        };
      });

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
    showToast("해당 종목을 5x5 올-클리어 완료 처리했습니다!");
  };

  // Complete current workout day and advance to next
  const handleCompleteSession = () => {
    if (!state.weeks.length || !currentSession) return;

    // Optional warning if any exercise sets are missing
    const hasUnfinished = currentSession.exercises.some(ex => ex.completedReps.some(r => r === -1));
    if (hasUnfinished) {
      if (!window.confirm("아직 완수 표시하지 않은 세트가 있습니다. 오늘의 훈련 세션을 정말 넘길까요?")) {
        return;
      }
    }

    setState(prev => {
      if (!prev) return prev;

      // Mark actual session as completed
      const updatedWeeks = prev.weeks.map(week => {
        if (week.weekNumber !== prev.activeWeek) return week;

        const updatedSessions = week.sessions.map((session, dayIdx) => {
          if (dayIdx !== prev.activeDay) return session;

          return {
            ...session,
            isCompleted: true,
            completedAt: new Date().toLocaleDateString(),
          };
        });

        // Determine if entire week is completed
        const isWeekCompleted = updatedSessions.every(s => s.isCompleted);

        return {
          ...week,
          sessions: updatedSessions,
          isCompleted: isWeekCompleted,
        };
      });

      // Calculate next index
      let nextDay = prev.activeDay + 1;
      let nextWeek = prev.activeWeek;

      if (nextDay > 2) {
        nextDay = 0;
        nextWeek = Math.min(4, prev.activeWeek + 1);
      }

      // Check for absolute final program completion celebratory log
      const isFinish = prev.activeWeek === 4 && prev.activeDay === 2;
      const historyLog = [...prev.historyLog];
      if (isFinish) {
        historyLog.push({
          date: new Date().toLocaleDateString(),
          action: "훈련 완벽 완료",
          details: "축하합니다! 4주간의 5x5 파워리프팅 무게 증량 수직 달성 프로그램을 무사히 완수했습니다.",
        });
      } else {
        historyLog.push({
          date: new Date().toLocaleDateString(),
          action: "세션 완료",
          details: `${prev.activeWeek}주차 - ${prev.activeDay + 1}일차 훈련을 완전히 접수했습니다.`,
        });
      }

      return {
        ...prev,
        weeks: updatedWeeks,
        activeWeek: nextWeek,
        activeDay: isFinish ? prev.activeDay : nextDay, // Stay on last day if complete
        historyLog,
      };
    });

    const isAllComplete = state.activeWeek === 4 && state.activeDay === 2;
    if (isAllComplete) {
      showToast("🏆 4주간의 5x5 파워리프팅 대정진을 최종 완수하셨습니다!");
    } else {
      showToast("오늘의 훈련 세션 완료! 휴식을 충분히 가져가세요.");
    }
  };

  // Navigation commands for review
  const selectWeek = (weekNum: number) => {
    setState(prev => prev ? { ...prev, activeWeek: weekNum, activeDay: 0 } : prev);
  };

  const selectDay = (dayIdx: number) => {
    setState(prev => prev ? { ...prev, activeDay: dayIdx } : prev);
  };

  // Global aggregate stats
  const totalDays = state.weeks.reduce((sum, w) => sum + w.sessions.length, 0);
  const completedDays = state.weeks.reduce((sum, w) => sum + w.sessions.filter(s => s.isCompleted).length, 0);
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  // Render individual exercises
  const activeWorkoutExercises = currentSession?.exercises || [];

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-950/95 border border-zinc-850 text-emerald-400 font-extrabold px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and top stats */}
      <Header
        progressPercent={progressPercent}
        completedDays={completedDays}
        totalDays={totalDays}
        onResetProgram={handleResetProgram}
        programGenerated={state.programGenerated}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {!state.programGenerated ? (
          // Initial Step : Config training weights
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ConfigForm onGenerate={handleGenerateProgram} />
          </motion.div>
        ) : (
          // Active Program Tracker
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Main Column - Active Training Session */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Day Info Bar */}
              <div className="bg-zinc-900 border border-zinc-805/85 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/15 p-3 rounded-2xl text-emerald-400 border border-emerald-500/30 font-mono font-black text-center min-w-[60px] shadow-sm">
                    <div className="text-[9px] leading-none uppercase text-emerald-500 font-extrabold tracking-widest">WEEK</div>
                    <div className="text-2xl leading-none mt-1.5">{state.activeWeek}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display text-white tracking-wide uppercase">
                      {state.activeWeek}주차 / 4주 - 0{state.activeDay + 1}일차 세션
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      오버헤드 프레스, 스쿼트 등 고중량 연동 전 충분한 회전근개 가동 및 폼롤러 워밍업을 권장합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-850 text-[10px] font-black uppercase tracking-wider text-zinc-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  EST TIME: ~45 MIN
                </div>
              </div>

              {/* Progress tab navigators */}
              <div className="space-y-4">
                {/* Week Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[1, 2, 3, 4].map((wk) => {
                    const isWeekSelected = state.activeWeek === wk;
                    const weekDone = state.weeks[wk - 1]?.isCompleted;
                    return (
                      <button
                        key={wk}
                        onClick={() => selectWeek(wk)}
                        className={`px-5 py-3.5 rounded-2xl font-black font-display text-xs tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap border ${
                          isWeekSelected
                            ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/10"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                        }`}
                      >
                        {wk}주차 훈련 대조
                        {weekDone && <span className="ml-1.5 text-emerald-400 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Day selector under active week */}
                <div className="bg-zinc-950 p-2 rounded-2xl flex items-center justify-between gap-2 border border-zinc-900">
                  {[0, 1, 2].map((dayIdx) => {
                    const isDaySelected = state.activeDay === dayIdx;
                    const dayObj = state.weeks[state.activeWeek - 1]?.sessions[dayIdx];
                    const dayDone = dayObj?.isCompleted;
                    const routineTag = dayObj?.type === "A" ? "루틴 A" : "루틴 B";

                    return (
                      <button
                        key={dayIdx}
                        onClick={() => selectDay(dayIdx)}
                        className={`flex-1 text-center py-3 px-4 rounded-xl font-black font-display text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                          isDaySelected
                            ? "bg-zinc-900 text-emerald-400 border border-zinc-805/85 shadow-md"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span>0{dayIdx + 1}일차</span>
                        <span className="ml-1.5 text-[9px] font-mono font-medium opacity-80 block lg:inline text-zinc-400">
                          ({dayObj?.type} {dayDone ? "완료✓" : ""})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Exercise Cards List */}
              <div className="space-y-5">
                {activeWorkoutExercises.length > 0 ? (
                  activeWorkoutExercises.map((exercise) => (
                    <WorkoutCard
                      key={exercise.id}
                      exercise={exercise}
                      onUpdateReps={handleUpdateReps}
                      onForceComplete={handleForceComplete}
                    />
                  ))
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 font-mono">
                    진행 상태의 훈련 에이전트 정보가 존재하지 않습니다.
                  </div>
                )}
              </div>

              {/* Session Complete Trigger Box */}
              {!currentSession?.isCompleted ? (
                <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-3xl p-6 md:p-8 text-center shadow-lg shadow-emerald-950/10">
                  <h4 className="text-base font-black font-display text-emerald-400 uppercase tracking-wider">
                    오늘 {state.activeWeek}주차 - {state.activeDay + 1}일차 점진 부하를 정복하셨나요?
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 mb-5 leading-relaxed">
                    모든 종목의 각 세트 반복을 부상없이 완전 수행하셨다면 오늘의 세션을 마감하십시오.<br />
                    아래 버튼 클릭 시 오늘 역량이 누적되고, 다음 목표 중량이 선형 연동됩니다.
                  </p>
                  <button
                    onClick={handleCompleteSession}
                    className="w-full sm:w-auto px-10 py-4.5 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black font-display text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-emerald-950/20 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    오늘 훈련 종료 세션 등록
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-900/80 border border-zinc-805/70 rounded-3xl p-6 md:p-8 text-center">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    ✓
                  </div>
                  <h4 className="text-base font-black font-display text-white uppercase tracking-wider">
                    해당 세선 ({state.activeWeek}W - Day {state.activeDay + 1}) 완료 기록됨
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    체중 관리와 충분한 단백질, 양질의 수면을 가동하여 다음 세트 정량 돌파를 계획하십시오.
                  </p>
                  {state.activeWeek === 4 && state.activeDay === 2 && (
                    <div className="mt-5 p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 rounded-2xl max-w-lg mx-auto shadow-inner">
                      <p className="text-sm font-black font-display text-emerald-400 flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Award className="text-emerald-450 w-4 h-4" />
                        4-WEEK LEGENDARY 5X5 GRADUATED
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        안정적인 1RM 선상 수직증가에 성공했습니다! 완수한 5x5 지표를 토대로 다음 단계 디로딩 사이클 또는 파워빌딩 세트를 설계하십시오.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column - Program Stats Map & Log */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Core Program Metrics Card */}
              <div className="bg-zinc-900 border border-zinc-805/85 rounded-3xl p-5 md:p-6 shadow-2xl">
                <h4 className="text-xs font-black text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  5x5 POWER LIFT RULEBOOK
                </h4>
                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="p-3.5 bg-zinc-950 border border-zinc-805 rounded-xl hover:border-zinc-750 transition-all">
                    <span className="font-extrabold text-zinc-200 block font-display tracking-wide text-[11px] uppercase">01 / 선형 증강 기본율</span>
                    <span className="text-zinc-400 block mt-1.5 leading-relaxed">
                      매주 완수 시 다음 주에 정확히 <strong className="text-emerald-400 font-bold">+5kg의 증량</strong>이 부여됩니다. 정직한 가동 범위와 수축으로 신경계를 무장하십시오.
                    </span>
                  </div>
                  <div className="p-3.5 bg-zinc-950 border border-zinc-805 rounded-xl hover:border-zinc-750 transition-all">
                    <span className="font-extrabold text-zinc-200 block font-display tracking-wide text-[11px] uppercase">02 / 세트 간 완벽 휴식</span>
                    <span className="text-zinc-400 block mt-1.5 leading-relaxed">
                      - 여유 있고 쉬울 때: <strong className="text-emerald-400 font-extrabold">90초 휴식</strong><br />
                      - 최고 수준으로 무거울 때: <strong className="text-emerald-450 font-extrabold">3분 ~ 5분 휴식</strong>하여 ATP 복원을 전면 가동하십시오.
                    </span>
                  </div>
                  <div className="p-3.5 bg-zinc-950 border border-zinc-805 rounded-xl hover:border-zinc-750 transition-all">
                    <span className="font-extrabold text-zinc-200 block font-display tracking-wide text-[11px] uppercase">03 / 운동 실패 (FAIL) 수임</span>
                    <span className="text-zinc-400 block mt-1.5 leading-relaxed">
                      어떤 세트에서 타겟 횟수를 채우지 못했더라도(예: 5/5/4/3/2) 실망하지 마십시오. 신경계는 극한 과부하를 학습 중이며, 다음 회차 재안착 확률을 넓힙니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* History Event Logger */}
              <div className="bg-zinc-900 border border-zinc-805/85 rounded-3xl p-5 md:p-6 shadow-2xl">
                <h4 className="text-xs font-black text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <Award className="w-4 h-4 text-emerald-400" />
                  STRENGTH TIMELINE LOGS
                </h4>
                {state.historyLog.length > 0 ? (
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                    {state.historyLog.slice().reverse().map((log, index) => (
                      <div key={index} className="relative pl-4 border-l border-emerald-500/20 text-xs">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                          <span>{log.date}</span>
                          <span className="font-black text-emerald-400 uppercase tracking-widest">{log.action}</span>
                        </div>
                        <p className="text-zinc-300 font-medium mt-1 leading-relaxed">{log.details}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic text-center py-6 font-mono">
                    TIMELINE EMPTY
                  </div>
                )}
              </div>

            </div>

            {/* Bottom aggregate roadmap stats */}
            <div className="lg:col-span-12">
              <DashboardStats weeks={state.weeks} configs={state.configs} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
