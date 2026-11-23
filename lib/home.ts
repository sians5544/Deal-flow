// lib/home.ts
// 홈 네 영역(배너 · 오늘 마감 · 곧 오픈 · 베스트)에 무엇을 보여줄지 정하는 규칙.
// Design Ref: §9 — 순수 함수(selectHomeSections)와 데이터 경계(getHomeSections)를 나눠 둡니다.
//   Supabase 단계에서는 getHomeSections 안쪽(데이터 꺼내기)만 async DB 조회로 바뀝니다.

import { Banner } from "@/types/banner";
import { Deal } from "@/types/deal";
import { DAY_MS, byReviewCountDesc, getAllDeals, kstDayStart } from "@/lib/deals";
import { getBanners } from "@/lib/banners";
import { chunk } from "@/lib/utils";

export const HOME_LIMITS = {
  banners: 5,
  closing: 6,
  upcoming: 15,
  best: 15,
  pageSize: 5,
} as const;

export type HomeSections = {
  banners: Banner[]; // 최대 5
  closing: Deal[]; // 최대 6
  upcomingPages: Deal[][]; // 최대 15개를 5개씩 나눈 장 목록 (최대 3장)
  bestPages: Deal[][]; // 최대 15개를 5개씩 나눈 장 목록 (최대 3장)
  nextOpenAt: string | null; // 오늘 마감이 비었을 때 안내용 (첫 오픈 예정 딜의 openTime)
};

const time = (iso: string) => new Date(iso).getTime();

// 정렬 값이 같으면 id 순으로 고정해 결과가 흔들리지 않게 합니다 (Design §3.3).
const byOrder = (a: Banner, b: Banner) => a.order - b.order || a.id - b.id;
const byEndTime = (a: Deal, b: Deal) => time(a.endTime) - time(b.endTime) || a.id - b.id;
const byOpenTime = (a: Deal, b: Deal) => time(a.openTime) - time(b.openTime) || a.id - b.id;

// Design Ref: §3.3 — 경계: endTime === now는 끝난 딜, openTime === now는 진행 중.
//   배너는 startAt === now면 노출, endAt === now면 안 함.
export const selectHomeSections = (
  deals: Deal[],
  banners: Banner[],
  now: Date,
): HomeSections => {
  const nowMs = now.getTime();
  const todayEnd = kstDayStart(now) + DAY_MS;

  // Plan SC: FR-01 노출 기간 안(시작 ≤ 지금 < 끝)의 배너만, 순서대로 최대 5장
  const visibleBanners = banners
    .filter((b) => time(b.startAt) <= nowMs && nowMs < time(b.endAt))
    .sort(byOrder)
    .slice(0, HOME_LIMITS.banners);

  // Plan SC: FR-05 끝난 딜은 어느 영역에도 들어가지 않습니다. 모든 영역이 live에서 출발합니다.
  const live = deals.filter((d) => time(d.endTime) > nowMs);

  // Plan SC: FR-02 진행 중인 딜을 마감 빠른 순으로 최대 6개
  const closing = live
    .filter((d) => time(d.openTime) <= nowMs)
    .sort(byEndTime)
    .slice(0, HOME_LIMITS.closing);

  // Plan SC: FR-03 오늘(한국 날짜) 안에 열릴 예정인 딜을 오픈 시각 순으로 최대 15개, 5개씩 한 장
  const upcoming = live
    .filter((d) => nowMs < time(d.openTime) && time(d.openTime) < todayEnd)
    .sort(byOpenTime)
    .slice(0, HOME_LIMITS.upcoming);

  // Plan SC: FR-04 마감 전인 딜을 리뷰 수 순으로 최대 15개, 5개씩 한 장 (위 영역과 겹쳐도 됨)
  const best = [...live].sort(byReviewCountDesc).slice(0, HOME_LIMITS.best);

  return {
    banners: visibleBanners,
    closing,
    upcomingPages: chunk(upcoming, HOME_LIMITS.pageSize),
    bestPages: chunk(best, HOME_LIMITS.pageSize),
    // Plan SC: FR-08 오늘 마감이 비었을 때 "다음 딜은 HH:MM에 열려요" 안내용
    nextOpenAt: upcoming[0]?.openTime ?? null,
  };
};

// 데이터 경계: 목 데이터를 꺼내 순수 함수에 넘깁니다. now는 page.tsx가 한 번만 정해 내려줍니다 (Design §1.2).
export const getHomeSections = (now: Date): HomeSections =>
  selectHomeSections(getAllDeals(undefined, now), getBanners(now), now);
