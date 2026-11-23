# home 설계서

> **요약**: 홈(`/`)을 요청마다 서버에서 그린다. 영역 선택 규칙은 `lib/home.ts`, 마감 문구는 `lib/dealTime.ts`, 기획전 배너 데이터는 `lib/banners.ts`로 분리한다. 클라이언트는 캐러셀뿐이다: 배너·곧 오픈·베스트가 함께 쓰는 `PagedCarousel`과 오늘 마감의 shadcn `Carousel`.
>
> **Project**: deal-flow
> **Version**: 0.3.0
> **Author**: Park sian
> **Date**: 2026-11-22
> **Status**: Draft
> **Planning Doc**: [home.plan.md](../../01-plan/features/home.plan.md) (v0.5)
> **개념 정리**: [nextjs-rendering-guide.md 3-1](../../nextjs-rendering-guide.md) (children vs import, hydration)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 첫 화면이 임시 화면이라 서비스가 무엇인지 전달되지 않는다 |
| **WHO** | 처음 방문한 사용자, 포트폴리오를 보는 면접관 |
| **RISK** | 목 데이터가 모두 같은 날 열리고 닫혀서, 밤늦게는 진행 중인 딜이 없어 섹션이 비어 보일 수 있다 |
| **SUCCESS** | 각 영역이 규칙대로(끝난 딜 제외, 정렬, 개수, 중복 없음) 나오고, 영역 선택 로직과 마감 표시 규칙이 Jest로 검증된다 |
| **SCOPE** | 홈 페이지 + 영역 선택 함수(`lib/`) + 배너 목 데이터(`lib/banners.ts`) + 마감 표시를 `DealCard`까지 통일 + 상품 사진 정리 + `/best` 정렬 맞추기. 새 API 없음. 클라이언트 컴포넌트는 캐러셀(배너, 오늘 마감, 곧 오픈, 베스트)뿐 |

---

## 1. Overview

### 1.1 Design Goals
- 화면이 "지금 시각"에 따라 정확하다: 끝난 딜과 기간이 지난 배너가 보이지 않는다 (FR-05).
- 판단 규칙(어느 딜이 어느 영역에, 어느 배너가 보이는지, 마감 문구)은 화면과 떨어진 순수 함수라 `now`만 바꿔 Jest로 검증한다.
- 브라우저로 가는 JS는 캐러셀 동작뿐이다.
- Supabase로 바꿀 때 `getHomeSections(now)` 안쪽(데이터 꺼내기)만 고치면 된다.

### 1.2 Design Principles
- **시각은 한 번만 정한다**: `page.tsx`가 `now`를 만들어 아래로 내려준다. 컴포넌트 안에서 `new Date()`를 부르지 않는다.
- **규칙과 모양을 나눈다**: `lib/`는 무엇을 보여줄지, `components/`는 어떻게 보여줄지.
- **상품과 전시를 나눈다**: 딜(`Deal`)은 판매 단위, 배너(`Banner`)는 보여주기 단위. 배너 정보를 `Deal`에 붙이지 않는다.
- **클라이언트는 껍데기**: 캐러셀은 children을 받아 넘기기만 한다. 내용은 서버에서 그린다.

---

## 2. Architecture

### 2.0 Architecture Comparison

| 기준 | A: 최소 변경 | B: 클린 | C: 실용 |
|------|:-:|:-:|:-:|
| **방식** | 목업 A안을 `page.tsx` 한 파일에 | 저장소 인터페이스·도메인·뷰모델·화면 층 분리 | 규칙은 `lib/`, 섹션마다 컴포넌트 하나 |
| **새 파일** | 3 | 14+ | 11 |
| **수정 파일** | 4 | 5 | 6 |
| **복잡도** | 낮음 | 높음 | 중간 |
| **테스트 쉬움** | 낮음 (page 한 덩어리) | 높음 | 높음 |
| **Supabase 교체** | page 수정 필요 | 구현체만 교체 | `getHomeSections` 안만 교체 |

**Selected**: **C (실용)** — 규칙을 순수 함수로 떼어 테스트하기 좋고, 데이터 경계(`getHomeSections`)가 하나라 Supabase 교체 지점이 분명하다. B의 저장소 인터페이스는 구현체가 둘(목·Supabase)이 생기는 Supabase 단계에서 필요해지면 그때 만든다.

### 2.1 Component Diagram (서버 / 클라이언트 경계)

```
app/page.tsx                       서버  dynamic = "force-dynamic"
│  now = new Date()
│  sections = getHomeSections(now) ──▶ lib/home.ts ──▶ lib/deals.ts   (딜 목 데이터)
│                                                  └─▶ lib/banners.ts (배너 목 데이터)
├─ <h1 className="sr-only">
├─ 기획전 배너 (banners.length > 0 일 때만)
│   └─ PagedCarousel autoplay                       [클라이언트]
│        └─ BannerSlide × 최대 5 (children)         서버에서 그림
├─ 오늘 마감
│   ├─ SectionHeader                                서버
│   ├─ closing.length === 0 → EmptyNotice           서버
│   └─ Carousel (shadcn)                            [클라이언트]
│        └─ DealCard × 최대 6 (children)            서버에서 그림
├─ 곧 오픈
│   ├─ SectionHeader                                서버
│   ├─ upcomingPages.length === 0 → EmptyNotice     서버
│   └─ PagedCarousel (자동 넘김 없음)               [클라이언트]
│        └─ UpcomingPage × 최대 3 (children)        서버에서 그림 (한 장 = 5개)
└─ 베스트
    ├─ SectionHeader                                서버
    ├─ bestPages.length === 0 → EmptyNotice         서버
    └─ PagedCarousel (자동 넘김 없음)               [클라이언트]
         └─ BestPage × 최대 3 (children)            서버에서 그림 (한 장 = 5개)
```

### 2.2 Data Flow

```
요청 → page.tsx(now 결정) → getHomeSections(now)
     → getAllDeals(undefined, now) : 그 날짜 기준 딜 목 데이터
     → getBanners(now)             : 그 날짜 기준 배너 목 데이터
     → selectHomeSections(deals, banners, now): 거르기·정렬·자르기
     → 섹션 컴포넌트에 결과 + now 전달 → HTML (+ 캐러셀 JS만 hydration)
```

캐러셀을 넘길 때는 서버에 요청하지 않는다. 모든 장이 처음 HTML에 들어 있고, 캐러셀은 그 줄을 옆으로 옮기기만 한다. 서버 컴포넌트가 다시 실행되는 것은 페이지 이동, URL 쿼리 변경, `router.refresh()`, 서버 액션, 캐시 만료 때뿐이다.

### 2.3 렌더링 방식: 요청마다 (`force-dynamic`)

| 후보 | 결과 | 판단 |
|------|------|------|
| 아무것도 안 붙임 | 홈은 `searchParams`를 안 쓰므로 **빌드 때 한 번 그려 고정**된다. `now`가 빌드 시각에 멈춤 | ❌ |
| `revalidate = 60` (ISR) | stale-while-revalidate라서, 방문이 드문 포트폴리오는 첫 방문자(면접관)가 몇 시간 전 화면을 본다. FR-05 위반 | ❌ |
| `dynamic = "force-dynamic"` | 요청마다 그림. 목 데이터 거르기는 몇 ms라 비용이 거의 없음 | ✅ |

- `/today`, `/best`는 `searchParams`를 읽어서 이미 요청마다 그려진다. `/today`의 `revalidate = 30`은 실제로 페이지 캐시에 영향이 없으므로 이번 범위에서 건드리지 않는다 (`docs/todo.md`에 추가함).
- Supabase 단계: 페이지가 아니라 **DB 조회 결과를 캐시**(태그 + 관리자 저장 시 `revalidateTag`)하고, 시간 판단은 계속 요청마다 한다.

### 2.4 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `app/page.tsx` | `lib/home.ts`, 섹션 컴포넌트 | 조립 |
| `lib/home.ts` | `lib/deals.ts`, `lib/banners.ts`, `lib/dealTime.ts` | 영역 선택 |
| `lib/banners.ts` | `lib/deals.ts`의 `kstDayStart` | 오늘 기준 노출 기간 만들기 |
| `DealCard`, `UpcomingPage`, `BestPage` | `lib/dealTime.ts` | 마감·오픈 시각 문구 |
| `PagedCarousel` | `components/ui/carousel.tsx`, `useAutoplay` | 넘김·장 표시·자동 재생 |

---

## 3. Data Model

`Deal`은 바꾸지 않는다. 배너는 별도 타입이다.

### 3.1 새 타입

```typescript
// types/banner.ts
// 기획전 배너. 운영자가 정하는 전시 데이터라 딜(Deal)과 따로 둔다.
export interface Banner {
  id: number;
  category: CategoryId;  // 누르면 /best?category={category}
  image: string;         // 기획전용 가로 이미지
  title: string;         // "겨울 아우터 특가전"
  subtitle?: string;     // "패딩·코트 최대 60%"
  startAt: string;       // ISO 8601, 노출 시작 (포함)
  endAt: string;         // ISO 8601, 노출 끝 (미포함)
  order: number;         // 작을수록 앞
}

// lib/home.ts
export type HomeSections = {
  banners: Banner[];         // 최대 5
  closing: Deal[];           // 최대 6
  upcomingPages: Deal[][];   // 최대 15개를 5개씩 나눈 장 목록 (최대 3장)
  bestPages: Deal[][];       // 최대 15개를 5개씩 나눈 장 목록 (최대 3장)
  nextOpenAt: string | null; // 오늘 마감이 비었을 때 안내용 (첫 오픈 예정 딜의 openTime)
};

export const HOME_LIMITS = { banners: 5, closing: 6, upcoming: 15, best: 15, pageSize: 5 } as const;

// lib/utils.ts
export function chunk<T>(items: T[], size: number): T[][];  // [1..12], 5 → [[1..5],[6..10],[11,12]]

// lib/dealTime.ts
export type EndLabel = { text: string; urgent: boolean };
```

- 링크 주소는 데이터에 저장하지 않고 `bannerHref(banner)` → `/best?category=${category}`로 만든다. 운영자가 주소를 잘못 적을 일이 없고, 나중에 기획전 페이지가 생기면 이 함수만 바꾼다.
- Supabase 단계에서는 `banners` 테이블이 되고, 관리자 화면의 "배너 관리" 메뉴가 이 데이터를 편집한다.

### 3.2 목 데이터 (`lib/banners.ts`)

딜처럼 "오늘"을 기준으로 노출 기간을 만든다 (`buildBanners(now)`). 테스트에서 기간 규칙이 보이도록 일부러 섞는다.

| id | category | title | 노출 기간 (KST) | order |
|----|----------|-------|----------------|:-----:|
| 1 | fashion | 겨울 아우터 특가전 | 어제 00:00 ~ 7일 뒤 | 1 |
| 2 | tech | 디지털 위크 | 오늘 00:00 ~ 내일 00:00 | 2 |
| 3 | food | 오늘 저녁 장보기 | 오늘 15:00 ~ 오늘 21:00 | 3 |
| 4 | beauty | 환절기 보습 기획전 | 오늘 00:00 ~ 3일 뒤 | 4 |
| 5 | living | 지난 기획전 (노출 안 됨) | 7일 전 ~ 어제 | 5 |

이미지는 `images.unsplash.com`의 가로형 사진(`?w=1200`)을 Do에서 고른다.

### 3.3 영역 선택 규칙 (`selectHomeSections(deals, banners, now)`)

| 영역 | 조건 | 정렬 | 개수 |
|------|------|------|------|
| **banners** | `startAt <= now < endAt` | `order` 오름차순, 같으면 `id` | 5 |
| live (내부) | 딜 `endTime > now` | - | - |
| active (내부) | live 중 `openTime <= now` | `endTime` 오름차순, 같으면 `id` | - |
| **closing** | active 앞에서부터 | 위와 같음 | 6 |
| **upcomingPages** | `now < openTime < 오늘(KST) 끝` → 15개 → `chunk(…, 5)` | `openTime` 오름차순, 같으면 `id` | 15 (5 × 3장) |
| **bestPages** | live 전체 → 15개 → `chunk(…, 5)` | `reviewCount` 내림차순, 같으면 `id` | 15 (5 × 3장) |
| **nextOpenAt** | upcomingPages[0]?.[0]?.openTime ?? null | - | - |

- 배너는 딜을 가리키지 않으므로 영역 간 중복 제거가 필요 없다. 오늘 마감(진행 중)과 곧 오픈(오픈 전)은 조건상 겹치지 않고, 베스트는 순위 목록이라 겹쳐도 된다 (plan FR-04).
- 베스트 순위 번호는 장을 넘어 이어진다 (2장 첫 카드 = 6위). `BestPage`에 `startRank`를 넘긴다.
- 정렬 값이 같을 때 `id`로 순서를 고정해 테스트 결과가 흔들리지 않게 한다.
- 경계: `endTime === now`는 끝난 딜(제외), `openTime === now`는 진행 중. 배너도 `startAt === now`는 노출, `endAt === now`는 안 함.

### 3.4 마감 문구 규칙 (`formatEndLabel(endTime, now)`)

| 남은 시간 / 날짜 | text | urgent |
|------|------|:-:|
| 0 이하 | `마감` | false |
| 1시간 미만 (`< 3600000ms`) | `곧 마감 · HH:MM` | true |
| 같은 KST 날짜 | `오늘 HH:MM 마감` | false |
| 다음 KST 날짜 | `내일 HH:MM 마감` | false |
| 그 이후 | `M월 D일 HH:MM 마감` | false |

- 정확히 60분 남으면 urgent가 아니다.
- `/best`는 끝난 딜도 보여주므로 카드에 `마감`이 표시된다 (plan 2.4).
- `formatKstTime(iso)` → `HH:MM` (곧 오픈 시각 표시에도 사용).
- KST 날짜 계산은 `lib/deals.ts`의 `kstDayStart`를 export해서 같이 쓴다 (11-17에 고친 시간대 버그를 다시 만들지 않기 위해 한 곳만 둔다).

---

## 4. API Specification

해당 없음. 새 API 라우트 없음. `GET /api/deals`의 응답 순서도 바꾸지 않는다 (`getAllDeals`는 정렬하지 않고, 베스트 정렬은 새 함수 `getBestDeals`로).

---

## 5. UI/UX Design

### 5.1 Screen Layout

plan 2.2 화면 초안을 따른다. 오늘 마감과 곧 오픈 카드 모양은 목업 `/home-mockup/a`의 마크업과 Tailwind 클래스를 옮겨 쓴다. 곧 오픈·베스트 한 장은 데스크톱에서 카드 5칸 한 줄, 모바일에서 목록 5줄(곧 오픈은 왼쪽에 시각, 베스트는 왼쪽에 순위). 배너는 목업의 큰 딜 영역 모양(왼쪽 이미지, 오른쪽 어두운 글 영역)을 기획전 내용으로 바꾼다.

### 5.2 Component List

| Component | Location | 서버/클라 | Props | Responsibility |
|-----------|----------|:-:|-------|----------------|
| `Home` | `app/page.tsx` | 서버 | - | `now` 결정, 영역 조립 |
| `PagedCarousel` | `components/features/home/components/` | **클라** | `children`, `label`, `itemName`, `autoplay = false`, `intervalMs = 5000`, `padIndex = false` | 넘김, 장 표시(`01 / 05`), 위치 막대. `autoplay`면 자동 재생·일시정지 추가. 배너·곧 오픈·베스트 공용 |
| `useAutoplay` | 같은 폴더 | 클라 훅 | `(enabled, intervalMs, onTick, resetKey)` | `setInterval` 관리. `resetKey`가 바뀌면 타이머 다시 시작 |
| `BannerSlide` | 같은 폴더 | 서버 | `banner`, `priority` | 기획전 이미지 + 카테고리 이름 + 제목 + 부제목, 전체가 `/best?category=` 링크. 첫 장만 `priority` |
| `SectionHeader` | 같은 폴더 | 서버 | `title`, `sub`, `href` | `h2` + "전체보기" 링크 (`aria-label="{title} 전체보기"`) |
| `UpcomingPage` | 같은 폴더 | 서버 | `deals`(최대 5) | 곧 오픈 한 장. 오픈 시각 · 썸네일 · 상품명 · 가격, 각 카드가 `/deals/{id}` 링크 |
| `BestPage` | 같은 폴더 | 서버 | `deals`(최대 5), `startRank` | 베스트 한 장. 순위 뱃지 · 썸네일 · 상품명 · 가격 · 리뷰 수, 각 카드가 `/deals/{id}` 링크 |
| `EmptyNotice` | 같은 폴더 | 서버 | `children` | 빈 상태 안내 상자 |
| `DealCard` (수정) | `components/features/deal/components/` | 서버 | `deal`, `now` | 카운트다운 → 마감 문구, 흑백·덮개 제거 |

### 5.3 `PagedCarousel` 상세 (배너·곧 오픈·베스트 공용)

```
상태
  api          : embla API (shadcn Carousel의 setApi)
  index        : 현재 장 (api의 "select" 이벤트로 갱신)
  paused       : 사용자가 일시정지를 눌렀나 (동작 줄이기면 처음부터 true)
  interacting  : 마우스가 올라가 있거나 키보드 포커스가 안에 있나

playing = autoplay && !paused && !interacting && count > 1
useAutoplay(playing, intervalMs, () => api?.scrollNext(), index)
```

| 결정 | 내용 | 이유 |
|------|------|------|
| 공용으로 만드는 이유 | 세 영역 모두 "서버에서 그린 장을 children으로 받아 넘긴다"는 구조가 같고 자동 넘김 여부만 다르다 | 같은 동작(장 표시, 화살표, 1장일 때 숨김)을 여러 번 만들지 않는다 |
| autoplay 구현 | embla autoplay 플러그인 대신 **직접 만든 `useAutoplay` 훅** | 의존성 추가 없음. 훅만 떼어 가짜 시간으로 테스트할 수 있고, 면접에서 동작을 직접 설명할 수 있다 |
| 무한 반복 | `opts={{ loop: true }}` | 마지막 장 다음 첫 장 (plan 2.2) |
| 손으로 넘기면 | `index`가 바뀌어 타이머가 처음부터 다시 | 넘기자마자 또 넘어가지 않게 |
| 자동 넘김 없음 (`autoplay = false`) | 일시정지 버튼을 그리지 않고 `useAutoplay`도 꺼짐 | 곧 오픈·베스트는 사용자가 직접 넘긴다 |
| 동작 줄이기 | `useSyncExternalStore`로 `matchMedia('(prefers-reduced-motion: reduce)')`를 읽음 (서버 값은 `false`). `paused = 사용자 선택 ?? 동작 줄이기` | 렌더 중에 바로 읽으면 서버 HTML과 달라져 hydration 불일치. `useSyncExternalStore`는 hydration 동안 서버 값을 쓰고 그 뒤 실제 값으로 다시 그려서, effect 안 setState 없이 "마운트 후 읽기"와 같은 결과. 사용자가 재생을 누르면 그 선택을 존중 |
| 장이 1개 | Carousel 없이 children만 그림 | 화살표·`01 / 01`·일시정지가 의미 없음 |
| 장 표시 자릿수 | `padIndex`면 `01 / 05`(배너), 아니면 `1 / 3`(곧 오픈·베스트) | plan FR-01과 FR-03·04의 표기가 다름 |
| `onTick` 보관 | `useAutoplay` 안에서 `useEffectEvent`로 감쌈 | 렌더마다 새 콜백이 와도 타이머를 다시 만들지 않음 (React 19.2) |
| 현재 장 읽기 | `aria-live`: 재생 중 `off`, 멈춤이거나 자동 넘김 없음이면 `polite` | 5초마다 스크린리더가 읽어 대지 않게 (WAI 캐러셀 패턴) |
| 영역 이름 | `<div aria-roledescription="carousel" aria-label={label}>` (배너 `기획전`, 곧 오픈 `곧 오픈 딜`, 베스트 `베스트 순위`) | 슬라이드는 shadcn `CarouselItem`이 이미 `role="group" aria-roledescription="slide"` |
| 일시정지 버튼 이름 | 재생 중 `자동 넘김 멈추기`, 멈춤 `자동 넘김 시작` | 상태에 맞는 이름 (plan NFR) |
| 화살표 이름 | `이전 {itemName}`, `다음 {itemName}` (배너 `기획전`, 곧 오픈·베스트 `목록`) | shadcn 기본값이 영어 sr-only라 덮어씀 |
| children 처리 | `Children.toArray(children)`를 `CarouselItem`으로 감쌈 | children은 서버에서 그려진 결과라 그대로 놓기만 한다 |

### 5.4 Page UI Checklist

#### 홈 `/`
- [ ] 제목: 화면에는 안 보이는 `h1` ("오늘의 특가 딜")
- [ ] 배너: 노출 기간 안의 기획전 최대 5장, 장마다 이미지 · 카테고리 이름 · 제목 · 부제목, 누르면 `/best?category={카테고리}`
- [ ] 배너: 이전·다음 화살표 (`이전 기획전`, `다음 기획전`), `01 / 05` 표시, 위치 막대, 일시정지·재생 버튼
- [ ] 배너: 1장이면 장치 없이 표시, 0장이면 영역 없음
- [ ] 오늘 마감: `h2`, "마감 빠른 순", `오늘 마감 전체보기` → `/today?tab=closing`, `DealCard` 캐러셀 최대 6
- [ ] 오늘 마감이 비면: "지금 진행 중인 딜이 없어요." + "다음 딜은 HH:MM에 열려요." 또는 "내일 오전 9시에 새 딜이 열려요."
- [ ] 곧 오픈: `h2`, "오픈 시각 순", `곧 오픈 전체보기` → `/today?tab=open`, 최대 15개를 5개씩 한 장, 카드 위 `HH:MM`, 비면 "오늘 남은 오픈 예정 딜이 없어요."
- [ ] 베스트: `h2`, "리뷰 많은 순", `베스트 전체보기` → `/best`, 최대 15개를 5개씩 한 장, 순위 번호(장을 넘어 이어짐) · 썸네일 · 상품명 · 가격 · 리뷰 수, 비면 "지금 살 수 있는 딜이 없어요."
- [ ] 곧 오픈·베스트 공통: `이전 목록`·`다음 목록` 화살표, `1 / 3` 장 표시, 자동 넘김·일시정지 없음, 5개 이하면 장치 없음

#### `DealCard` (홈, `/today`, `/best` 공통)
- [ ] 마감 문구 (3.4 규칙, urgent면 빨강 굵게, 아니면 회색, 끝났으면 `마감`)
- [ ] 카운트다운(`DealTimer`) 없음, 사진 흑백·어둡게 처리 없음, 안 쓰는 덮개 `div` 없음

#### `/best`
- [ ] 리뷰 수 많은 순 (`getBestDeals`), 끝난 딜도 포함
- [ ] `?category=`로 들어오면 그 카테고리만 (기존 동작 유지)

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| 노출할 배너 0장 | 배너 영역을 그리지 않음 |
| 진행 중 딜 0개 | 오늘 마감 자리에 빈 상태 안내 (FR-08) |
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
| 단위 (규칙) | `selectHomeSections`, `chunk`, `formatEndLabel`, `formatKstTime`, `bannerHref`, `getBestDeals` | Jest (`TZ=UTC` 고정) |
| 훅 | `useAutoplay` | Jest `renderHook` + `jest.useFakeTimers()` |
| 컴포넌트 | `PagedCarousel`, `DealCard` | Testing Library + user-event |
| 페이지 | `app/page.tsx` | Jest 대상 아님 (조립만). E2E로 |

### 8.2 `selectHomeSections` 시나리오 (한국 시각 기준 `now`)

| # | now | 기대 |
|---|-----|------|
| 1 | 08:00 | closing 비어 있음, upcomingPages는 오픈 시각 순 5개씩, nextOpenAt = 첫 오픈 시각 |
| 2 | 14:00 | closing은 마감 빠른 순 |
| 3 | 진행 중 7개 이상 | closing 6에서 자름 |
| 4 | 마감 시각과 같은 순간 | 그 딜은 어디에도 없음 (FR-05) |
| 5 | 오픈 시각과 같은 순간 | 진행 중으로 분류 |
| 6 | 23:59:30 / 다음 날 00:30 | 어제 딜이 남지 않음 |
| 7 | 리뷰 수 동점 | `id` 오름차순 |
| 8 | 내일 오픈 딜 | upcomingPages에 없음 |
| 9 | 배너 노출 시작·끝과 같은 순간 | 시작은 노출, 끝은 안 함 |
| 10 | 노출 중 배너 6개 이상 | `order` 순 5개 |
| 11 | `order` 동점 | `id` 오름차순 |
| 12 | 노출 중 배너 0개 | `banners`가 빈 배열 |
| 13 | 끝나지 않은 딜 12개 | bestPages = 5, 5, 2개짜리 3장 |
| 14 | 끝나지 않은 딜 20개 | 15개만, 5개씩 3장 |
| 15 | 끝나지 않은 딜 0개 / 오픈 예정 0개 | bestPages / upcomingPages가 빈 배열 |

### 8.3 `formatEndLabel` 시나리오
59분 59초(urgent) / 정확히 60분(일반) / 0 / 지남 / 같은 날 / 다음 날 / 이틀 뒤 / UTC 날짜와 KST 날짜가 다른 시각(예: UTC 15:30 = KST 다음 날 00:30).

### 8.4 컴포넌트 시나리오

| # | 대상 | 행동 | 기대 |
|---|------|------|------|
| 1 | `useAutoplay` | enabled, 5초 진행 | `onTick` 1회 |
| 2 | `useAutoplay` | enabled → false | 더 이상 호출 안 됨 |
| 3 | `useAutoplay` | 3초 뒤 `resetKey` 변경, 3초 더 | 호출 안 됨 (타이머 재시작) |
| 4 | `PagedCarousel` | 장 1개 | 화살표·일시정지 버튼·장 표시 없음 |
| 5 | `PagedCarousel` autoplay | 일시정지 클릭 | 버튼 이름이 `자동 넘김 시작`으로 |
| 6 | `PagedCarousel` autoplay | 동작 줄이기 켜짐 | 처음부터 `자동 넘김 시작` |
| 6-1 | `PagedCarousel` 자동 넘김 없음 | 장 3개 | 일시정지 버튼 없음, `1 / 3` 표시, 5초 지나도 그대로 |
| 7 | `DealCard` | 마감 30분 전 | `곧 마감 · HH:MM` |
| 8 | `DealCard` | 마감 5시간 전 | `오늘 HH:MM 마감`, 카운트다운 없음 |
| 9 | `DealCard` | 마감 지남 | `마감` |

- embla는 jsdom에서 `matchMedia`, `IntersectionObserver`, `ResizeObserver`가 필요하다. `test-utils/browserMocks.ts`에 모아 `PagedCarousel` 테스트에서 불러온다.

### 8.5 Seed Data
기존 목 데이터 + `test-utils/factories.ts`에 `makeBanner()` 추가 (시각·순서를 지정한 가짜 배너).

---

## 9. Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| 섹션 컴포넌트, `PagedCarousel`, `useAutoplay` | Presentation | `components/features/home/components/` |
| `page.tsx` | Presentation (조립) | `app/` |
| `Banner` | Domain (타입) | `types/banner.ts` |
| `selectHomeSections`, `chunk`, `formatEndLabel`, `bannerHref` | Domain (순수 규칙) | `lib/home.ts`, `lib/dealTime.ts` |
| `getHomeSections`, `getAllDeals`, `getBestDeals`, `getBanners` | Infrastructure (데이터 경계) | `lib/home.ts`, `lib/deals.ts`, `lib/banners.ts` |

`lib/home.ts` 안에서 순수 함수(`selectHomeSections`)와 데이터 경계(`getHomeSections`)를 나눠 둔다. Supabase 단계에서 경계 함수만 async DB 조회로 바뀐다.

---

## 10. Coding Convention

| Item | Convention |
|------|-----------|
| 컴포넌트 | PascalCase 파일, `const X = () => {}; export default X;` (기존 `DealCard`와 같음) |
| 함수 | camelCase, 시각 인자는 항상 `now: Date` |
| 이름 | 배너 관련은 `Banner*`로 통일 ("hero"는 쓰지 않음). 공용 캐러셀은 `PagedCarousel`, 한 장은 `*Page` |
| 폴더 | `components/features/home/components/` + `index.ts` re-export (기존 `deal`과 같음) |
| 테스트 이름 | 한국어 "~하면 ~한다" |
| 주석 | 핵심 결정에 `// Design Ref: §번호 — 이유` |
| 색 | 목업과 같은 회색 계열(`#111827`, `#6B7280`, `#9CA3AF`, `#F3F4F6`), 할인·urgent는 `red-600` |

---

## 11. Implementation Guide

### 11.1 File Structure

```
app/page.tsx                                   수정 (임시 화면 → 홈)
types/banner.ts                                새 (Banner)
types/index.ts                                 수정 (banner re-export)
lib/banners.ts                                 새 (buildBanners, getBanners, bannerHref)
lib/dealTime.ts                                새 (formatEndLabel, formatKstTime)
lib/home.ts                                    새 (HomeSections, selectHomeSections, getHomeSections)
lib/utils.ts                                   수정 (chunk)
lib/deals.ts                                   수정 (kstDayStart export, getAllDeals에 now 인자, getBestDeals, 사진 교체)
components/features/home/components/
  PagedCarousel.tsx   useAutoplay.ts   BannerSlide.tsx  UpcomingPage.tsx  BestPage.tsx
  SectionHeader.tsx   EmptyNotice.tsx  index.ts
components/features/deal/components/DealCard.tsx      수정
components/features/deal/components/DealCardGrid.tsx  수정 (getBestDeals, now 전달)
app/today/page.tsx                                    수정 (DealCard에 now 전달)
test-utils/factories.ts                               수정 (makeBanner)
app/home-mockup/                                      삭제 (커밋 안 된 목업)
```

`DealTimer`는 상세 페이지(`DealInfos`)에서 계속 쓰므로 남긴다. 상세 정리는 `docs/todo.md` 3번.

### 11.2 Implementation Order

1. [x] `lib/dealTime.ts`, `kstDayStart` export
2. [x] `types/banner.ts`, `lib/banners.ts`
3. [x] `chunk`, `lib/home.ts` (`getAllDeals(categoryId?, now?)` 확장 포함)
4. [x] `getBestDeals` + `DealCardGrid` 정렬 (FR-10)
5. [x] `DealCard` 마감 문구·흑백 제거·덮개 제거, `/today`·`/best`에 `now` 전달 (FR-06, FR-09 일부)
6. [x] 상품과 안 맞는 썸네일 교체 (FR-09), 배너 이미지 고르기
7. [x] 서버 섹션 컴포넌트 (`SectionHeader`, `EmptyNotice`, `BannerSlide`, `UpcomingPage`, `BestPage`)
8. [x] `useAutoplay`, `PagedCarousel` (FR-01, FR-03, FR-04, FR-11)
9. [x] `app/page.tsx` 조립, `force-dynamic` (FR-01~05, 07, 08)
10. [ ] `app/home-mockup/` 삭제, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build`
11. [ ] `/jest-test` → `docs/03-analysis/home.jest.md`

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Estimated Turns |
|--------|-----------|-------------|:---------------:|
| 규칙 | `module-1` | `dealTime.ts`, 배너 타입·목 데이터, `chunk`, `home.ts`, `getBestDeals` (순서 1~4) | 10-15 |
| 카드 | `module-2` | `DealCard` 변경, 사진 교체, `/today`·`/best` 연결 (순서 5~6) | 10-15 |
| 홈 화면 | `module-3` | 섹션 컴포넌트, `PagedCarousel`, `page.tsx` (순서 7~9) | 20-30 |
| 마무리 | `module-4` | 목업 삭제, 검사 명령, `/jest-test` (순서 10~11) | 10-20 |

#### Recommended Session Plan

module마다 새 세션에서 진행한다 (`/clear` 후 `/pdca do home --scope module-N`). 규칙 함수는 module-1 끝에서 바로 `/jest-test`로 검증한다.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-11-22 | 첫 작성. C안(실용) 선택, 요청마다 렌더링, 직접 만든 `useAutoplay`, 영역 선택·마감 문구 규칙 확정 | Park sian |
| 0.2 | 2026-11-22 | 배너를 "마감 빠른 딜 3개"에서 "카테고리 기획전(`Banner` 별도 데이터, 최대 5장, `/best?category=` 연결)"으로 변경. 이름을 hero → Banner로 통일. 오늘 마감은 진행 중 딜 전체에서 고르고, 빈 상태 안내는 오늘 마감 자리로 이동 | Park sian |
| 0.4 | 2026-11-23 | module-3 구현 반영: `PagedCarousel`에 `padIndex` 추가, 동작 줄이기를 `useSyncExternalStore`로 읽음, `useAutoplay`의 `useEffectEvent` | Park sian |
| 0.3 | 2026-11-22 | 곧 오픈·베스트를 "최대 15개를 5개씩 넘기는 캐러셀"로 변경(11번가 베스트 참고). 배너·곧 오픈·베스트가 함께 쓰는 `PagedCarousel`(autoplay 켜고 끄기)로 통합, `UpcomingList`/`BestRanking` → `UpcomingPage`/`BestPage`, `chunk` 추가. 캐러셀 넘김은 서버 요청 없음을 2.2에 명시 | Park sian |
