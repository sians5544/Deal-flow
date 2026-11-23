// lib/banners.ts
// 기획전 배너 목 데이터. 운영자가 정하는 값을 흉내 냅니다 (관리자 기능 단계에서 Supabase banners 테이블로 바뀜).
// Design Ref: §3.2 — 딜처럼 "오늘"을 기준으로 노출 기간을 만들고, 기간 규칙이 보이도록 일부러 섞습니다.

import { Banner } from "@/types/banner";
import { DAY_MS, kstDayStart } from "@/lib/deals";

const HOUR_MS = 60 * 60 * 1000;

export const buildBanners = (now: Date): Banner[] => {
  const today = kstDayStart(now);
  const at = (ms: number) => new Date(ms).toISOString();

  return [
    {
      id: 1,
      category: "fashion",
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200",
      title: "겨울 아우터 특가전",
      subtitle: "패딩·코트 최대 60%",
      startAt: at(today - DAY_MS), // 어제 00:00
      endAt: at(today + 7 * DAY_MS), // 7일 뒤
      order: 1,
    },
    {
      id: 2,
      category: "tech",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      title: "디지털 위크",
      subtitle: "이어폰·스마트워치 특가",
      startAt: at(today), // 오늘 00:00
      endAt: at(today + DAY_MS), // 내일 00:00
      order: 2,
    },
    {
      id: 3,
      category: "food",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
      title: "오늘 저녁 장보기",
      subtitle: "15시부터 21시까지만",
      startAt: at(today + 15 * HOUR_MS), // 오늘 15:00
      endAt: at(today + 21 * HOUR_MS), // 오늘 21:00
      order: 3,
    },
    {
      id: 4,
      category: "beauty",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200",
      title: "환절기 보습 기획전",
      subtitle: "크림·세럼 1+1",
      startAt: at(today), // 오늘 00:00
      endAt: at(today + 3 * DAY_MS), // 3일 뒤
      order: 4,
    },
    {
      id: 5,
      category: "living",
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
      title: "지난 기획전",
      subtitle: "노출 기간이 끝나 보이지 않아야 합니다",
      startAt: at(today - 7 * DAY_MS), // 7일 전
      endAt: at(today), // 어제까지 (오늘 00:00 미포함)
      order: 5,
    },
  ];
};

// 노출 기간 거르기·정렬은 lib/home.ts의 selectHomeSections가 합니다. 여기서는 데이터만 꺼냅니다.
export const getBanners = (now: Date = new Date()): Banner[] => buildBanners(now);

// 링크 주소는 데이터에 저장하지 않고 카테고리로 만듭니다. 기획전 페이지가 생기면 이 함수만 바꿉니다.
// Design Ref: §3.1
export const bannerHref = (banner: Pick<Banner, "category">): string =>
  `/best?category=${banner.category}`;
