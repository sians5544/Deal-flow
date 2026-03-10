"use client";
import { DealTimerProps } from "@/types";
import { useState, useEffect } from "react";

const DealTimer = ({
  endTime,
  discountRate,
  className,
}: DealTimerProps & { className?: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("종료");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div
      className={`flex items-center gap-1 w-[104]px h-[24]px p-2 bg-black/50 backdrop-blur-sm justify-center rounded-md ${className ?? ""}`}
    >
      <span className="text-sm font-medium text-white">{discountRate}%</span>
      <span className="text-xs font-semibold text-white">{timeLeft}</span>
    </div>
  );
};

export default DealTimer;
