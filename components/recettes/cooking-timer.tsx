"use client";

import { useEffect, useState } from "react";
import { PlayIcon, PauseIcon, RotateCcwIcon, BellIcon } from "@/components/icons";

interface CookingTimerProps {
  durationMinutes: number;
}

export function CookingTimer({ durationMinutes }: CookingTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(durationMinutes * 60);
    setIsRunning(false);
    setIsFinished(false);
  }, [durationMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            // Play a sound (optional, could use Web Audio API)
            try {
              const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
              audio.play().catch(() => {});
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    if (isFinished) {
      setTimeLeft(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const color = isFinished ? "#F97316" : "#4A7C59"; // Orange quand fini, Vert sinon

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6 flex items-center justify-center">
        {/* SVG Circle */}
        <svg width="240" height="240" viewBox="0 0 240 240" className="rotate-[-90deg] transform">
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#2A3B2C"
            strokeWidth="8"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Text Inside Circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isFinished ? "text-[#F97316]" : "text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          {isFinished && (
            <span className="mt-2 text-sm font-semibold text-[#F97316] uppercase tracking-wider animate-pulse flex items-center gap-1">
              <BellIcon size={14} /> Terminé
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mt-2">
        {timeLeft < totalSeconds || isFinished ? (
          <button
            onClick={resetTimer}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2A3B2C] text-white hover:bg-[#3A4B3C] transition-colors"
            aria-label="Réinitialiser"
          >
            <RotateCcwIcon size={24} />
          </button>
        ) : null}
        <button
          onClick={toggleTimer}
          className="flex h-20 w-20 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: color, boxShadow: `0 8px 30px ${color}50` }}
          aria-label={isRunning ? "Mettre en pause" : isFinished ? "Relancer" : "Démarrer"}
        >
          {isRunning ? (
            <PauseIcon size={32} />
          ) : (
            <PlayIcon size={32} className="ml-1" />
          )}
        </button>
      </div>
    </div>
  );
}
