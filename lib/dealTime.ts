// lib/dealTime.ts
// 마감·오픈 시각을 화면 문구로 바꾸는 규칙. 시각은 항상 한국 시간으로 보여줍니다.
// Design Ref: §3.4 — 카운트다운 대신 "오늘 HH:MM 마감". 지금 시각(now)을 인자로 받아 Jest에서 시각만 바꿔 검증합니다.
// Plan SC: FR-06 마감 표시 규칙

import { DAY_MS, KST_OFFSET_MS, kstDayStart } from "@/lib/deals";

export type EndLabel = { text: string; urgent: boolean };

const HOUR_MS = 60 * 60 * 1000;

// 서버 시간대와 상관없이 한국 시간의 날짜·시각을 읽습니다.
const toKst = (iso: string) => new Date(new Date(iso).getTime() + KST_OFFSET_MS);

const pad = (n: number) => String(n).padStart(2, "0");

// "2026-11-23T09:00:00.000Z" → "18:00"
export const formatKstTime = (iso: string): string => {
  const kst = toKst(iso);
  return `${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`;
};

export const formatEndLabel = (endTime: string, now: Date): EndLabel => {
  const end = new Date(endTime).getTime();
  const remaining = end - now.getTime();
  const time = formatKstTime(endTime);

  if (remaining <= 0) return { text: "마감", urgent: false };
  // 정확히 60분 남으면 urgent가 아닙니다.
  if (remaining < HOUR_MS) return { text: `곧 마감 · ${time}`, urgent: true };

  // 남은 시간이 아니라 한국 날짜가 같은지로 "오늘/내일"을 정합니다.
  const daysAway = Math.round((kstDayStart(new Date(end)) - kstDayStart(now)) / DAY_MS);
  if (daysAway === 0) return { text: `오늘 ${time} 마감`, urgent: false };
  if (daysAway === 1) return { text: `내일 ${time} 마감`, urgent: false };

  const kst = toKst(endTime);
  return {
    text: `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${time} 마감`,
    urgent: false,
  };
};
