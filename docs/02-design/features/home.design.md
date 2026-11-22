# home 설계서

> **요약**: 홈(`/`)을 요청마다 서버에서 그리고, 영역 선택 규칙은 `lib/home.ts` 순수 함수로, 마감 표시는 `lib/dealTime.ts`로 분리한다. 클라이언트는 배너 캐러셀(`HeroCarousel`)과 오늘 마감 캐러셀 두 곳뿐이다.
>
> **Project**: deal-flow
> **Version**: 0.1.0
> **Author**: Park sian
> **Date**: 2026-11-22
> **Status**: Draft
> **Planning Doc**: [home.plan.md](../../01-plan/features/home.plan.md) (v0.3)
> **개념 정리**: [nextjs-rendering-guide.md 3-1](../../nextjs-rendering-guide.md) (children vs import, hydration)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 첫 화면이 임시 화면이라 서비스가 무엇인지 전달되지 않는다 |
| **WHO** | 처음 방문한 사용자, 포트폴리오를 보는 면접관 |
| **RISK** | 목 데이터가 모두 같은 날 열리고 닫혀서, 밤늦게는 진행 중인 딜이 없어 섹션이 비어 보일 수 있다 |
| **SUCCESS** | 각 영역이 규칙대로(끝난 딜 제외, 정렬, 개수, 중복 없음) 나오고, 영역 선택 로직과 마감 표시 규칙이 Jest로 검증된다 |
| **SCOPE** | 홈 페이지 + 영역 선택 함수(`lib/`) + 마감 표시를 `DealCard`까지 통일 + 상품 사진 정리 + `/best` 정렬 맞추기. 새 API 없음. 클라이언트 컴포넌트는 캐러셀 두 개(배너, 오늘 마감)뿐 |

---

## 1. Overview

### 1.1 Design Goals
- 화면이 "지금 시각"에 따라 정확하다: 끝난 딜이 절대 보이지 않는다 (FR-05).
- 판단 규칙(어느 딜이 어느 영역에, 마감 문구)은 화면과 떨어진 순수 함수라 `now`만 바꿔 Jest로 검증한다.
- 브라우저로 가는 JS는 캐러셀 동작뿐이다.
- Supabase로 바꿀 때 `getHomeSections(now)` 안쪽만 고치면 된다.

### 1.2 Design Principles
- **시각은 한 번만 정한다**: `page.tsx`가 `now`를 만들어 아래로 내려준다. 컴포넌트 안에서 `new Date()`를 부르지 않는다.
- **규칙과 모양을 나눈다**: `lib/`는 무엇을 보여줄지, `components/`는 어떻게 보여줄지.
- **클라이언트는 껍데기**: 캐러셀은 children을 받아 넘기기만 한다. 내용은 서버에서 그린다.

---

## 2. Architecture

### 2.0 Architecture Comparison

| 기준 | A: 최소 변경 | B: 클린 | C: 실용 |
|------|:-:|:-:|:-:|
| **방식** | 목업 A안을 `page.tsx` 한 파일에 | 저장소 인터페이스·도메인·뷰모델·화면 층 분리 | 규칙은 `lib/`, 섹션마다 컴포넌트 하나 |
| **새 파일** | 2 | 12+ | 9 |
| **수정 파일** | 4 | 5 | 6 |
| **복잡도** | 낮음 | 높음 | 중간 |
| **테스트 쉬움** | 낮음 (page 한 덩어리) | 높음 | 높음 |
| **Supabase 교체** | page 수정 필요 | 구현체만 교체 | `getHomeSections` 안만 교체 |

**Selected**: **C (실용)** — 규칙을 순수 함수로 떼어 테스트하기 좋고, 데이터 경계(`getHomeSections`)가 하나라 Supabase 교체 지점이 분명하다. B의 저장소 인터페이스는 구현체가 둘(목·Supabase)이 생기는 Supabase 단계에서 필요해지면 그때 만든다.

### 2.1 Component Diagram (서버 / 클라이언트 경계)

```
app/page.tsx                       서버  dynamic = "force-dynamic"
│  now = new Date()
│  sections = getHomeSections(now) ──▶ lib/home.ts ──▶ lib/deals.ts (목 데이터)
│
├─ <h1 className="sr-only">
├─ 배너 영역
│   ├─ hero.length === 0 → EmptyNotice              서버
│   └─ HeroCarousel                                 [클라이언트]
│        └─ HeroSlide × 최대 3 (children)           서버에서 그림
├─ 오늘 마감 (closing.length > 0 일 때만)
│   ├─ SectionHeader                                서버
│   └─ Carousel (shadcn)                            [클라이언트]
│        └─ DealCard × 최대 6 (children)            서버에서 그림
├─ 곧 오픈:  SectionHeader + UpcomingList | EmptyNotice   서버
└─ 베스트:   SectionHeader + BestRanking  | EmptyNotice   서버
```

### 2.2 Data Flow

```
요청 → page.tsx(now 결정) → getHomeSections(now)
     → getAllDeals(undefined, now)  : 그 날짜 기준 목 데이터
     → selectHomeSections(deals, now): 거르기·정렬·자르기·중복 제거
     → 섹션 컴포넌트에 Deal[] + now 전달 → HTML (+ 캐러셀 JS만 hydration)
```

### 2.3 렌더링 방식: 요청마다 (`force-dynamic`)

| 후보 | 결과 | 판단 |
|------|------|------|
| 아무것도 안 붙임 | 홈은 `searchParams`를 안 쓰므로 **빌드 때 한 번 그려 고정**된다. `now`가 빌드 시각에 멈춤 | ❌ |
| `revalidate = 60` (ISR) | stale-while-revalidate라서, 방문이 드문 포트폴리오는 첫 방문자(면접관)가 몇 시간 전 화면을 본다. FR-05 위반 | ❌ |
| `dynamic = "force-dynamic"` | 요청마다 그림. 목 데이터 거르기는 몇 ms라 비용이 거의 없음 | ✅ |

- `/today`, `/best`는 `searchParams`를 읽어서 이미 요청마다 그려진다. `/today`의 `revalidate = 30`은 실제로 페이지 캐시에 영향이 없으므로 이번 범위에서 건드리지 않는다 (정리는 `docs/todo.md`에 추가).
- Supabase 단계: 페이지가 아니라 **DB 조회 결과를 캐시**(태그 + 관리자 저장 시 `revalidateTag`)하고, 시간 판단은 계속 요청마다 한다.

### 2.4 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `app/page.tsx` | `lib/home.ts`, 섹션 컴포넌트 | 조립 |
| `lib/home.ts` | `lib/deals.ts`, `lib/dealTime.ts`(KST 날짜) | 영역 선택 |
| `HeroSlide`, `DealCard`, `UpcomingList`, `BestRanking` | `lib/dealTime.ts` | 마감·오픈 시각 문구 |
| `HeroCarousel` | `components/ui/carousel.tsx`, `useAutoplay` | 넘김·자동 재생 |

---

## 3. Data Model

새 필드 없음. 기존 `Deal`(`types/deal.ts`)을 그대로 쓴다.

### 3.1 새 타입

```typescript
// lib/home.ts
export type HomeSections = {
  hero: Deal[];          // 최대 3
  closing: Deal[];       // 최대 6, hero와 겹치지 않음
  upcoming: Deal[];      // 최대 6
  best: Deal[];          // 최대 6, 다른 영역과 겹쳐도 됨
  nextOpenAt: string | null; // 빈 상태 안내용 (upcoming[0]의 openTime)
};

export const HOME_LIMITS = { hero: 3, closing: 6, upcoming: 6, best: 6 } as const;

// lib/dealTime.ts
export type EndLabel = { text: string; urgent: boolean };
```

### 3.2 영역 선택 규칙 (`selectHomeSections(deals, now)`)

| 영역 | 조건 | 정렬 | 개수 |
|------|------|------|------|
| live (내부) | `endTime > now` | - | - |
| active (내부) | live 중 `openTime <= now` | `endTime` 오름차순, 같으면 `id` 오름차순 | - |
| **hero** | active 앞에서부터 | 위와 같음 | 3 |
| **closing** | active에서 hero 다음부터 | 위와 같음 | 6 |
| **upcoming** | `now < openTime < 오늘(KST) 끝` | `openTime` 오름차순, 같으면 `id` | 6 |
| **best** | live 전체 | `reviewCount` 내림차순, 같으면 `id` 오름차순 | 6 |
| **nextOpenAt** | upcoming[0]?.openTime ?? null | - | - |

- 정렬이 같은 값일 때 `id`로 순서를 고정해 테스트 결과가 흔들리지 않게 한다.
- 경계: `endTime === now`는 끝난 딜(제외), `openTime === now`는 진행 중.

### 3.3 마감 문구 규칙 (`formatEndLabel(endTime, now)`)

| 남은 시간 / 날짜 | text | urgent |
|------|------|:-:|
| 0 이하 | `마감` | false |
| 1시간 미만 (`< 3600000ms`) | `곧 마감 · HH:MM` | true |
| 같은 KST 날짜 | `오늘 HH:MM 마감` | false |
| 다음 KST 날짜 | `내일 HH:MM 마감` | false |
| 그 이후 | `M월 D일 HH:MM 마감` | false |

- 정확히 60분 남으면 urgent가 아니다.
- `formatKstTime(iso)` → `HH:MM` (곧 오픈 시각 표시에도 사용).
- KST 날짜 계산은 `lib/deals.ts`의 `kstDayStart`를 export해서 같이 쓴다 (11-17에 고친 시간대 버그를 다시 만들지 않기 위해 한 곳만 둔다).

---

## 4. API Specification

해당 없음. 새 API 라우트 없음. `GET /api/deals`의 응답 순서도 바꾸지 않는다 (`getAllDeals`는 정렬하지 않고, 베스트 정렬은 새 함수 `getBestDeals`로).

---

## 5. UI/UX Design

### 5.1 Screen Layout

plan 2.2 화면 초안을 따른다. 목업 `/home-mockup/a`의 마크업과 Tailwind 클래스를 옮겨 쓴다.

### 5.2 Component List

| Component | Location | 서버/클라 | Props | Responsibility |
|-----------|----------|:-:|-------|----------------|
| `Home` | `app/page.tsx` | 서버 | - | `now` 결정, 영역 조립 |
| `HeroCarousel` | `components/features/home/components/` | **클라** | `children`, `label`, `intervalMs = 5000` | 넘김, 자동 재생, 일시정지, `01 / 03`, 위치 막대 |
| `useAutoplay` | 같은 폴더 | 클라 훅 | `(enabled, intervalMs, onTick, resetKey)` | `setInterval` 관리. `resetKey`가 바뀌면 타이머 다시 시작 |
| `HeroSlide` | 같은 폴더 | 서버 | `deal`, `now`, `priority` | 큰 사진 + 글. 첫 장만 `priority` |
| `SectionHeader` | 같은 폴더 | 서버 | `title`, `sub`, `href` | `h2` + "전체보기" 링크 (`aria-label="{title} 전체보기"`) |
| `UpcomingList` | 같은 폴더 | 서버 | `deals` | 오픈 시각 + 카드, 데스크톱 6칸 / 모바일 2칸 |
| `BestRanking` | 같은 폴더 | 서버 | `deals` | 1~6위 번호 목록, 데스크톱 2열 x 3줄 |
| `EmptyNotice` | 같은 폴더 | 서버 | `children` | 빈 상태 안내 상자 |
| `DealCard` (수정) | `components/features/deal/components/` | 서버 | `deal`, `now` | 카운트다운 → 마감 문구, 흑백·덮개 제거 |

### 5.3 `HeroCarousel` 상세

```
상태
  api          : embla API (shadcn Carousel의 setApi)
  index        : 현재 장 (api의 "select" 이벤트로 갱신)
  paused       : 사용자가 일시정지를 눌렀나 (동작 줄이기면 처음부터 true)
  interacting  : 마우스가 올라가 있거나 키보드 포커스가 안에 있나

playing = !paused && !interacting && count > 1
useAutoplay(playing, intervalMs, () => api?.scrollNext(), index)
```

| 결정 | 내용 | 이유 |
|------|------|------|
| autoplay 구현 | embla autoplay 플러그인 대신 **직접 만든 `useAutoplay` 훅** | 의존성 추가 없음. 훅만 떼어 가짜 시간으로 테스트할 수 있고, 면접에서 동작을 직접 설명할 수 있다 |
| 무한 반복 | `opts={{ loop: true }}` | 마지막 장 다음 첫 장 (plan 2.2) |
| 손으로 넘기면 | `index`가 바뀌어 타이머가 처음부터 다시 | 넘기자마자 또 넘어가지 않게 |
| 동작 줄이기 | 마운트 후 `matchMedia('(prefers-reduced-motion: reduce)')`가 참이면 `paused = true` | 렌더 중에 읽으면 서버 HTML과 달라져 hydration 불일치. 사용자가 재생을 누르면 존중 |
| 장이 1개 | Carousel 없이 children만 그림 | 화살표·`01 / 01`·일시정지가 의미 없음 |
| 현재 장 읽기 | `aria-live`: 재생 중 `off`, 멈춤 `polite` | 5초마다 스크린리더가 읽어 대지 않게 (WAI 캐러셀 패턴) |
| 영역 이름 | `<section aria-roledescription="carousel" aria-label="오늘의 딜">` | 슬라이드는 shadcn `CarouselItem`이 이미 `role="group" aria-roledescription="slide"` |
| 일시정지 버튼 이름 | 재생 중 `자동 넘김 멈추기`, 멈춤 `자동 넘김 시작` | 상태에 맞는 이름 (plan NFR) |
| 화살표 이름 | `이전 딜`, `다음 딜` | shadcn 기본값이 영어 sr-only라 덮어씀 |
| children 처리 | `Children.toArray(children)`를 `CarouselItem`으로 감쌈 | children은 서버에서 그려진 결과라 그대로 놓기만 한다 |

### 5.4 Page UI Checklist

#### 홈 `/`
- [ ] 제목: 화면에는 안 보이는 `h1` ("오늘의 특가 딜")
- [ ] 배너: 진행 중 딜 최대 3장, 장마다 사진 · 브랜드 · 상품명 · 할인율 · 판매가 · 마감 문구, 누르면 `/deals/{id}`
- [ ] 배너: 이전·다음 화살표 (`이전 딜`, `다음 딜`), `01 / 03` 표시, 위치 막대, 일시정지·재생 버튼
- [ ] 배너: 딜 1개면 장치 없이 표시, 0개면 "지금 진행 중인 딜이 없어요." + "다음 딜은 HH:MM에 열려요." 또는 "내일 오전 9시에 새 딜이 열려요."
- [ ] 오늘 마감: `h2`, "마감 빠른 순", `오늘 마감 전체보기` → `/today?tab=closing`, `DealCard` 캐러셀 최대 6, 비면 영역 숨김
- [ ] 곧 오픈: `h2`, "오픈 시각 순", `곧 오픈 전체보기` → `/today?tab=open`, 카드 위 `HH:MM`, 최대 6, 비면 "오늘 남은 오픈 예정 딜이 없어요."
- [ ] 베스트: `h2`, "리뷰 많은 순", `베스트 전체보기` → `/best`, 1~6위 번호 · 썸네일 · 상품명 · 가격 · 리뷰 수, 비면 "지금 살 수 있는 딜이 없어요."

#### `DealCard` (홈, `/today`, `/best` 공통)
- [ ] 마감 문구 (3.3 규칙, urgent면 빨강 굵게, 아니면 회색)
- [ ] 카운트다운(`DealTimer`) 없음, 사진 흑백·어둡게 처리 없음, 안 쓰는 덮개 `div` 없음

#### `/best`
- [ ] 리뷰 수 많은 순 (`getBestDeals`)

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| 진행 중 딜 0개 | 배너 자리 빈 상태 안내 (FR-08), 오늘 마감 영역 숨김 |
| 곧 오픈 / 베스트 0개 | 각 영역 안내 문구 |
| 사진 로드 실패 | `next/image` 기본 동작 (회색 배경 `bg-[#F3F4F6]` 유지) |

---

## 7. Security Considerations

해당 없음 (입력, 인증, 외부 호출 없음). 사진 도메인은 기존 `images.unsplash.com` 허용 목록 그대로.

---

## 8. Test Plan

Jest는 do 다음 `/jest-test`로 작성·실행하고 보고서는 `docs/03-analysis/home.jest.md`. 화면 흐름 E2E(Playwright)는 `docs/todo.md` 6번에서.

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 단위 (규칙) | `selectHomeSections`, `formatEndLabel`, `formatKstTime`, `getBestDeals` | Jest (`TZ=UTC` 고정) |
| 훅 | `useAutoplay` | Jest `renderHook` + `jest.useFakeTimers()` |
| 컴포넌트 | `HeroCarousel`, `DealCard` | Testing Library + user-event |
| 페이지 | `app/page.tsx` | Jest 대상 아님 (조립만). E2E로 |

### 8.2 `selectHomeSections` 시나리오 (한국 시각 기준 `now`)

| # | now | 기대 |
|---|-----|------|
| 1 | 08:00 | hero·closing 비어 있음, upcoming은 오픈 시각 순, nextOpenAt = 첫 오픈 시각 |
| 2 | 14:00 | hero 3개가 마감 빠른 순, closing은 hero와 겹치지 않음 |
| 3 | 진행 중 9개 이상 | hero 3, closing 6에서 자름 |
| 4 | 마감 시각과 같은 순간 | 그 딜은 어디에도 없음 (FR-05) |
| 5 | 오픈 시각과 같은 순간 | 진행 중으로 분류 |
| 6 | 23:59:30 / 다음 날 00:30 | 어제 딜이 남지 않음 |
| 7 | 리뷰 수 동점 | `id` 오름차순 |
| 8 | 내일 오픈 딜 | upcoming에 없음 |

### 8.3 `formatEndLabel` 시나리오
59분 59초(urgent) / 정확히 60분(일반) / 0 / 지남 / 같은 날 / 다음 날 / 이틀 뒤 / UTC 날짜와 KST 날짜가 다른 시각(예: UTC 15:30 = KST 다음 날 00:30).

### 8.4 컴포넌트 시나리오

| # | 대상 | 행동 | 기대 |
|---|------|------|------|
| 1 | `useAutoplay` | enabled, 5초 진행 | `onTick` 1회 |
| 2 | `useAutoplay` | enabled → false | 더 이상 호출 안 됨 |
| 3 | `useAutoplay` | 3초 뒤 `resetKey` 변경, 3초 더 | 호출 안 됨 (타이머 재시작) |
| 4 | `HeroCarousel` | 장 1개 | 화살표·일시정지 버튼 없음 |
| 5 | `HeroCarousel` | 일시정지 클릭 | 버튼 이름이 `자동 넘김 시작`으로 |
| 6 | `HeroCarousel` | 동작 줄이기 켜짐 | 처음부터 `자동 넘김 시작` |
| 7 | `DealCard` | 마감 30분 전 | `곧 마감 · HH:MM` |
| 8 | `DealCard` | 마감 5시간 전 | `오늘 HH:MM 마감`, 카운트다운 없음 |

- embla는 jsdom에서 `matchMedia`, `IntersectionObserver`, `ResizeObserver`가 필요하다. `test-utils/browserMocks.ts`에 모아 `HeroCarousel` 테스트에서 불러온다.

### 8.5 Seed Data
기존 목 데이터 + `test-utils/factories.ts`로 시각을 지정한 가짜 딜.

---

## 9. Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| 섹션 컴포넌트, `HeroCarousel`, `useAutoplay` | Presentation | `components/features/home/components/` |
| `page.tsx` | Presentation (조립) | `app/` |
| `selectHomeSections`, `formatEndLabel` | Domain (순수 규칙) | `lib/home.ts`, `lib/dealTime.ts` |
| `getHomeSections`, `getAllDeals`, `getBestDeals` | Infrastructure (데이터 경계) | `lib/home.ts`, `lib/deals.ts` |

`lib/home.ts` 안에서 순수 함수(`selectHomeSections`)와 데이터 경계(`getHomeSections`)를 나눠 둔다. Supabase 단계에서 경계 함수만 async DB 조회로 바뀐다.

---

## 10. Coding Convention

| Item | Convention |
|------|-----------|
| 컴포넌트 | PascalCase 파일, `const X = () => {}; export default X;` (기존 `DealCard`와 같음) |
| 함수 | camelCase, 시각 인자는 항상 `now: Date` |
| 폴더 | `components/features/home/components/` + `index.ts` re-export (기존 `deal`과 같음) |
| 테스트 이름 | 한국어 "~하면 ~한다" |
| 주석 | 핵심 결정에 `// Design Ref: §번호 — 이유` |
| 색 | 목업과 같은 회색 계열(`#111827`, `#6B7280`, `#9CA3AF`, `#F3F4F6`), 할인·urgent는 `red-600` |

---

## 11. Implementation Guide

### 11.1 File Structure

```
app/page.tsx                                   수정 (임시 화면 → 홈)
lib/dealTime.ts                                새 (formatEndLabel, formatKstTime)
lib/home.ts                                    새 (HomeSections, selectHomeSections, getHomeSections)
lib/deals.ts                                   수정 (kstDayStart export, getAllDeals에 now 인자, getBestDeals, 사진 교체)
components/features/home/components/
  HeroCarousel.tsx   useAutoplay.ts   HeroSlide.tsx
  SectionHeader.tsx  UpcomingList.tsx BestRanking.tsx  EmptyNotice.tsx  index.ts
components/features/deal/components/DealCard.tsx      수정
components/features/deal/components/DealCardGrid.tsx  수정 (getBestDeals, now 전달)
app/today/page.tsx                                    수정 (DealCard에 now 전달)
app/home-mockup/                                      삭제 (커밋 안 된 목업)
```

`DealTimer`는 상세 페이지(`DealInfos`)에서 계속 쓰므로 남긴다. 상세 정리는 `docs/todo.md` 3번.

### 11.2 Implementation Order

1. [ ] `lib/dealTime.ts`, `kstDayStart` export
2. [ ] `lib/home.ts` (`getAllDeals(categoryId?, now?)` 확장 포함)
3. [ ] `getBestDeals` + `DealCardGrid` 정렬 (FR-10)
4. [ ] `DealCard` 마감 문구·흑백 제거·덮개 제거, `/today`·`/best`에 `now` 전달 (FR-06, FR-09 일부)
5. [ ] 상품과 안 맞는 썸네일 교체 (FR-09)
6. [ ] 서버 섹션 컴포넌트 (`SectionHeader`, `EmptyNotice`, `HeroSlide`, `UpcomingList`, `BestRanking`)
7. [ ] `useAutoplay`, `HeroCarousel` (FR-01, FR-11)
8. [ ] `app/page.tsx` 조립, `force-dynamic` (FR-01~05, 07, 08)
9. [ ] `app/home-mockup/` 삭제, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build`
10. [ ] `/jest-test` → `docs/03-analysis/home.jest.md`

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Estimated Turns |
|--------|-----------|-------------|:---------------:|
| 규칙 | `module-1` | `dealTime.ts`, `home.ts`, `getBestDeals` (순서 1~3) | 10-15 |
| 카드 | `module-2` | `DealCard` 변경, 사진 교체, `/today`·`/best` 연결 (순서 4~5) | 10-15 |
| 홈 화면 | `module-3` | 섹션 컴포넌트, `HeroCarousel`, `page.tsx` (순서 6~8) | 20-30 |
| 마무리 | `module-4` | 목업 삭제, 검사 명령, `/jest-test` (순서 9~10) | 10-20 |

#### Recommended Session Plan

| Session | Phase | Scope |
|---------|-------|-------|
| 1 | Do | `--scope module-1,module-2` |
| 2 | Do | `--scope module-3,module-4` |
| 3 | `/jest-test` → Check | 전체 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-11-22 | 첫 작성. C안(실용) 선택, 요청마다 렌더링, 직접 만든 `useAutoplay`, 영역 선택·마감 문구 규칙 확정 | Park sian |
