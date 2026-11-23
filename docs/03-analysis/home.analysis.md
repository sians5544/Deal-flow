# home 분석 보고서

> **분석 종류**: 갭 분석 (설계 ↔ 구현) + 실제 화면 확인
>
> **Project**: deal-flow
> **Analyst**: Park sian (gap-detector + 브라우저 확인)
> **Date**: 2026-11-23
> **Design Doc**: [home.design.md](../02-design/features/home.design.md)
> **Jest 보고서**: [home.jest.md](./home.jest.md) (module-1~3, `it.failing` 0개)
> **성능 측정**: 하지 않음 (plan 4.3 "선택 안 함")

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 첫 화면이 임시 화면이라 서비스가 무엇인지 전달되지 않는다 |
| **WHO** | 처음 방문한 사용자, 포트폴리오를 보는 면접관 |
| **RISK** | 목 데이터가 모두 같은 날 열리고 닫혀서, 밤늦게는 진행 중인 딜이 없어 섹션이 비어 보일 수 있다 |
| **SUCCESS** | 각 영역이 규칙대로(끝난 딜 제외, 정렬, 개수, 중복 없음) 나오고, 영역 선택 로직과 마감 표시 규칙이 Jest로 검증된다 |
| **SCOPE** | 홈 페이지 + 영역 선택 함수(`lib/`) + 배너 목 데이터 + 마감 표시를 `DealCard`까지 통일 + 사진 정리 + `/best` 정렬 |

---

## Strategic Alignment Check (전략 정합성)

- **WHY 해결 여부**: ✅ 임시 화면(`home page`, `Click me`)이 배너·오늘 마감·곧 오픈·베스트로 바뀌었다. 배포 전 로컬 빌드에서 확인.
- **RISK 대응**: ✅ 밤(23:24)에 확인한 화면에서 곧 오픈은 안내 문구, 오늘 마감은 `곧 마감 · 23:30`처럼 남은 딜이 나온다. 빈 영역이 "고장"처럼 보이지 않는다.
- PRD 없음 (plan부터 시작).

### 성공 조건 (plan 4)

| 조건 | 상태 | 근거 |
|------|:-:|------|
| FR-01 ~ FR-11 구현 | ✅ | 아래 2.4, gap-detector 11/11 |
| 섹션 선택 함수 Jest 통과 | ✅ | `home.jest.md`, 전체 126 통과 |
| `it.failing`이 남지 않음 | ✅ | module-1 3개, module-2 1개 모두 고침 |
| `improvement-notes.md`에 문제→원인→해결→이유 | ⚠️ | 5번(잘못된 시각), 6번(카드 마감 문구)은 있음. 홈 화면 자체(force-dynamic, 서버/클라 경계, `PagedCarousel`·`useAutoplay`, `useSyncExternalStore`) 항목이 없음 → 갭 #1 |
| `todo.md`에서 홈 항목 제거 | ⏳ | report 단계에서 |
| 섹션 선택 함수 분기 coverage 100% | ✅ | `home.ts` 분기 100% |
| `test`·`tsc`·`lint` 통과, `build` 성공 | ✅ | module-4에서 실행, `/`는 `ƒ` |

### 결정 기록 확인

| 결정 | 지켰나 | 근거 |
|------|:-:|------|
| C안: 규칙은 `lib/`, 섹션마다 컴포넌트 | ✅ | `lib/home.ts`(순수 `selectHomeSections` + 경계 `getHomeSections`) |
| `force-dynamic` | ✅ | `app/page.tsx:23`, 빌드 결과 `ƒ /` |
| 새 `"use client"`는 `PagedCarousel` 하나 | ✅ | `PagedCarousel.tsx:1` |
| autoplay는 플러그인 대신 직접 만든 `useAutoplay` | ✅ | `useAutoplay.ts`, 의존성 추가 없음 |
| 시각은 페이지에서 한 번만 | ⚠️ | 홈은 지킴. `/today`는 `getDealsByTab`이 자기 `now`를 따로 만든다 → 갭 #2 |
| 새 API 없음, `/api/deals` 순서 유지 | ✅ | `getAllDeals`는 정렬하지 않음 (`deals.ts:430-433`) |

---

## 1. 분석 범위

| 항목 | 내용 |
|------|------|
| 설계서 | `docs/02-design/features/home.design.md` |
| 구현 | `app/page.tsx`, `app/today`, `app/best`, `lib/{home,dealTime,banners,deals,utils}.ts`, `types/banner.ts`, `components/features/home/components/*`, `DealCard`, `DealCardGrid` |
| 방법 | gap-detector 정적 분석 + 운영 빌드(`pnpm start`)를 띄워 응답·HTML·브라우저 화면 확인 |

---

## 2. Gap Analysis (갭 분석)

### 2.1 API
새 라우트 없음. `GET /api/deals` 200, id 순서 그대로. 계약 100%.

### 2.2 데이터 모델
`Banner`(§3.1), `HomeSections`, `HOME_LIMITS`(5/6/15/15/5), `chunk`, `EndLabel` 모두 설계와 같다.

### 2.3 컴포넌트 구조
§11.1 파일 19개 모두 있음, `app/home-mockup/` 없음. §5.2 컴포넌트 8개 props 일치. 구조 100%.

### 2.4 기능 깊이 / 2.5 Page UI Checklist
§5.4 13/13, FR 11/11. 근거는 gap-detector 결과 (`page.tsx:34` h1, `home.ts:31-78` 영역 규칙, `PagedCarousel.tsx:84,111-143` 장치, `BestPage` `startRank`, `DealCard.tsx:52-60` 마감 문구, `DealCardGrid.tsx:10` `getBestDeals`). 기능 96%.

### 2.6 코드에만 있는 것 (무해)
- 잘못된 시각 방어: `마감 시간 미정`, `--:--`, 오픈 시각이 잘못된 딜 제외 (`/jest-test`로 찾은 버그 수정분)
- `chunk`의 RangeError, 슬라이드마다 `aria-label="N / M"`, 오늘 마감 캐러셀의 `이전 딜`/`다음 딜`, sr-only `오픈`·`순위`

### 2.7 실행 확인 (한국 시각 23:24, `pnpm start`)

| # | 확인 | 결과 |
|---|------|:-:|
| 1 | `/`, `/today?tab=closing`, `/today?tab=open`, `/best`, `/best?category=fashion`, `/api/deals` 응답 | ✅ 모두 200 |
| 2 | 홈 HTML: `오늘의 특가 딜` h1, h2 3개, `오늘 마감 전체보기` 등 링크 이름, `tab=closing`/`tab=open`/`best?category=` | ✅ |
| 3 | 마감 문구: `곧 마감 · 23:30`, `곧 마감 · 23:59` (1시간 안), `NaN`·`grayscale` 없음 | ✅ |
| 4 | 배너: `이전 기획전`, `자동 넘김 멈추기`, `01 / 03` → `02 / 03`로 자동 넘어감 | ✅ |
| 5 | 곧 오픈 빈 문구 `오늘 남은 오픈 예정 딜이 없어요.` (23시) | ✅ |
| 6 | 데스크톱 1280px: 배너 왼쪽 사진·오른쪽 글, 베스트 5칸 줄 | ✅ |
| 7 | 모바일 390px: 배너 사진 위·글 아래, 베스트 목록 줄, 가로 넘침 없음 (`scrollWidth` 390) | ✅ |
| 8 | `/best`: 리뷰 순 4,521 → 234, 끝난 딜 포함 12개 | ✅ |
| 9 | 콘솔: hydration 경고 없음 (헤더 검색창 id/name 안내 1건, 홈과 무관) | ✅ |

L2·L3(Playwright)는 설치되어 있지 않아 건너뜀 (`docs/todo.md` 6번). 낮 시간(배너 3번 노출, 오늘 마감 빈 상태 `다음 딜은 HH:MM`)과 동작 줄이기는 Jest(`home.test.ts`, `PagedCarousel.test.tsx`)로 대신 확인했다.

### 2.8 Overall Score (일치율)

| 항목 | 점수 |
|------|:-:|
| 구조 | 100% |
| 기능 | 96% |
| 계약 | 100% |
| 실행 | 100% (확인한 9개 모두 통과) |
| **전체** (구조×0.15 + 기능×0.25 + 계약×0.25 + 실행×0.35) | **99%** |

정적만 계산하면 98% (gap-detector).

---

## 3. Recommended Actions (갭 목록)

| # | 심각도 | 내용 | 근거 | 고칠 방향 |
|---|:-:|------|------|-----------|
| 1 | Important | 개선 노트에 홈 화면 항목이 없음 (plan 4.1 DoD, CLAUDE.md 규칙). "다음에 고칠 것"에 "홈 화면"이 남아 있음 | `docs/improvement-notes.md:119-124` | 7번 항목 추가: 요청마다 렌더링(force-dynamic) 선택, children으로 넘기는 서버/클라 경계, `useAutoplay` 직접 구현, `useSyncExternalStore`로 동작 줄이기 |
| 2 | Minor | `/today`에서 `getDealsByTab`이 `now`를 따로 만들어, 목록을 거른 시각과 카드 문구 시각이 다를 수 있음 (설계 §1.2) | `lib/deals.ts:452`, `app/today/page.tsx:18,21` | `getDealsByTab(…, now)` 인자 추가 |
| 3 | Minor | 배너 이미지를 이미 골랐는데 `TODO(module-2): 임시 주소` 주석이 남음 | `lib/banners.ts:10` | 주석 삭제 |
| 4 | Minor | `/best` 빈 문구 "지금 진행 중인 딜이 없어요"가 실제 동작(끝난 딜도 포함)과 맞지 않음 | `DealCardGrid.tsx:15` | "이 카테고리에는 아직 딜이 없어요." |
| 5 | Minor | 오늘 마감 캐러셀 화살표가 첫·마지막 카드 사진 위에 겹치고, 카드가 다 보여 넘길 게 없을 때도 흐린 화살표가 남음 (실행 확인에서 발견) | `app/page.tsx:71-78` | 화살표를 사진 밖으로 빼거나 넘길 게 없으면 숨김. 디자인 판단이라 선택 |
| 6 | Minor | 가격 표시가 세 곳에 중복 (`DealCard`, `UpcomingPage`, `BestPage`). 개선 노트에 "module-3에서 합칠지 본다"고 적었는데 결정이 없음 | `improvement-notes.md:117` | 합치거나, "모양이 달라 합치지 않음"으로 결정 기록 |
| 7 | Minor | 오늘 마감 캐러셀은 모바일에서 `basis-[70%]`(한 장 반)인데 plan NFR은 "390px 2열" | `app/page.tsx:65` | 의도라면 plan NFR 문장 수정 |

### 문서만 고칠 것
- 설계 §8.4 마지막 줄: `IntersectionObserver`·`ResizeObserver` mock 예상 → embla를 가짜로 바꿔 `matchMedia`만 둠
- 설계 Version History 순서(0.4가 0.3 위), 헤더 Version 0.3.0
- 설계 §3.3·§3.4에 잘못된 시각 규칙 추가
- 설계 §2.4: `lib/home.ts`는 `lib/dealTime.ts`에 의존하지 않음
- 설계 §5.3 "영역 이름": region 역할은 shadcn `Carousel`이 붙임
- plan 2.3 클라이언트 캐러셀 목록에 곧 오픈 추가, 2.1 `01 / 03` → `01 / 05`, FR 상태 Pending → Done

---

### 처리 결과 (2026-11-23, 사용자 선택: 1~4번만 수정)

| # | 결과 |
|---|------|
| 1 | ✅ `improvement-notes.md` 7번 추가 (force-dynamic, children 경계, 시각 한 번, `useAutoplay`, `useSyncExternalStore`, 읽는 중 멈춤). "다음에 고칠 것"에서 홈 삭제 |
| 2 | ✅ `getDealsByTab(…, now)` 인자 추가, `/today`가 페이지의 `now`를 넘김. 테스트 "now를 넘기면 그 한국 날짜에 열리는 딜로 거른다" 추가 |
| 3 | ✅ `lib/banners.ts` TODO 주석 삭제 |
| 4 | ✅ `/best` 빈 문구 → "이 카테고리에는 아직 딜이 없어요." |
| 5~7 | report의 결정 기록으로 남김 (디자인 판단) |

수정 뒤 `pnpm test` 127 통과, `tsc`·`lint` 통과, `pnpm build` 성공, `/today?tab=open` 200.

## 4. Next Steps (판정)

전체 99% (정적 98%), Critical 없음 → iterate 없이 report로 갈 수 있다. Important 1건과 Minor 2~4번은 위처럼 고쳤다.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-11-23 | 첫 분석 (gap-detector + 운영 빌드 화면 확인) |
