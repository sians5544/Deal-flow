# home 완료 보고서

> **Status**: Complete (다음 작업으로 넘긴 것은 4번)
>
> **Project**: deal-flow
> **Version**: 0.5.0 (plan 기준)
> **Author**: Park sian
> **Completion Date**: 2026-11-23
> **PDCA Cycle**: #1 (bkit 첫 적용)

---

## Executive Summary

### 1.1 Project Overview

| Item | Content |
|------|---------|
| Feature | 홈 화면(`/`): 기획전 배너 · 오늘 마감 · 곧 오픈 · 베스트 |
| Start Date | 2026-11-18 (plan 첫 작성) |
| End Date | 2026-11-23 |
| Duration | 약 6일 (기획 → 설계 → 구현 → 테스트 → 분석 → 보고) |

### 1.2 Results Summary

```
┌─────────────────────────────────────────────────┐
│  Match Rate: 99% (정적 98% + 실행 확인 9/9)      │
├─────────────────────────────────────────────────┤
│  ✅ FR 완료:            11 / 11                  │
│  ✅ 성공 조건 완료:       8 / 8                  │
│  반복(iterate):          0회                     │
│  Jest: 127 통과 (14 suites), it.failing 0개      │
└─────────────────────────────────────────────────┘
```

### 1.3 Value Delivered

| Perspective | Content |
|-------------|---------|
| **Problem** | 첫 화면이 `home page`와 `Click me` 버튼뿐이라 방문자가 서비스 성격을 알 수 없었다. 화면에 들어갈 규칙(끝난 딜 제외, 정렬, 개수)을 검증하는 코드도 없었다. |
| **Solution** | 홈을 서버 컴포넌트로 다시 만들고, 영역 선택 규칙을 `selectHomeSections(deals, banners, now)` 순수 함수로 분리해 `now`만 바꿔 Jest로 검증했다. 새 클라이언트 파일은 캐러셀 `PagedCarousel` 하나(오늘 마감은 기존 shadcn `Carousel`). 배너는 딜과 별개인 운영자 기획전 데이터로 두고, 요청마다 그린다(`force-dynamic`). |
| **Function/UX Effect** | 영역 4개가 규칙대로 나온다: 배너 최대 5장, 오늘 마감 최대 6개, 곧 오픈·베스트 각 최대 15개를 5개씩 3장으로 넘김. 마감 카운트다운은 "오늘 20:00 마감"(1시간 미만만 빨강)으로 바뀌었다. Jest 53개 → 127개(+74), 개발 중 버그 4개를 배포 전에 잡았다. 성능 수치는 측정하지 않았다(plan 4.3). |
| **Core Value** | 첫 화면에서 지금 살 수 있는 딜이 무엇인지 보인다. 마감·오픈·자정 같은 시간 판단은 경계 시각까지 테스트로 고정해 두어, 면접에서 근거와 함께 설명할 수 있다. |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 첫 화면이 임시 화면이라 서비스가 무엇인지 전달되지 않는다 |
| **WHO** | 처음 방문한 사용자, 포트폴리오를 보는 면접관 |
| **RISK** | 목 데이터가 같은 날 열리고 닫혀서 밤늦게는 섹션이 비어 보일 수 있다 |
| **SUCCESS** | 각 영역이 규칙대로 나오고, 영역 선택 로직과 마감 표시 규칙이 Jest로 검증된다 |
| **SCOPE** | 홈 + 영역 선택 함수 + 배너 목 데이터 + 마감 표시(`DealCard`까지 통일) + 사진 정리 + `/best` 정렬. 새 API 없음 |

---

## 1.4 Success Criteria Final Status

> plan 4.1(완료 기준), 4.2(품질 기준) 기준.

| # | Criteria | Status | Evidence |
|---|---------|:------:|----------|
| SC-1 | FR-01 ~ FR-11 구현 | ✅ Met | gap-detector 11/11, 실행 확인 9/9 (`docs/03-analysis/home.analysis.md` 2.4, 2.7) |
| SC-2 | 섹션 선택 함수 Jest 테스트 통과 | ✅ Met | 127 통과. `lib/__tests__/home.test.ts` 등 (`home.jest.md`) |
| SC-3 | `/jest-test`에서 `it.failing`이 남지 않음 | ✅ Met | 찾은 4개 모두 do에서 고치고 `it`으로 전환. 남은 것 0 |
| SC-4 | `improvement-notes.md`에 문제 → 원인 → 해결 → 이유 | ✅ Met | 5번(잘못된 시각), 6번(마감 문구·할인율 0), 7번(홈 전체, 0a957d6) |
| SC-5 | `todo.md`에서 홈 항목 제거 | ✅ Met | report 단계에서 1번 삭제. 남은 캐러셀 화살표 문제는 3번, `?category=` 정책은 "정할 것"으로 옮김 |
| SC-6 | 섹션 선택 함수 분기 coverage 100% | ✅ Met | `home.ts` 분기 100%, `dealTime.ts` 100% |
| SC-7 | `pnpm test`, `tsc --noEmit`, `lint` 통과 | ✅ Met | 127 통과, tsc·lint 통과 |
| SC-8 | `pnpm build` 성공 | ✅ Met | 성공. `/`는 `ƒ`(요청마다 렌더링) |

**Success Rate**: 8 / 8 criteria met (100%). 성능 측정(4.3)은 "선택 안 함"이라 성공 조건에서 뺐다.

---

## 1.5 Decision Record Summary

> PRD는 없고 plan부터 시작했다. 아래는 plan·design의 결정과 결과.

| Source | Decision | Followed? | Outcome |
|--------|----------|:---------:|---------|
| [Plan] | 화면 방향 A안 (목업 3안 비교 후 선택) | ✅ | 큰 배너 + 목록 3줄 구조로 구현. 처음 안(같은 4칸 줄 세 번)은 위계가 없어 버림 |
| [Plan] | 배너는 "마감 빠른 딜"이 아니라 운영자가 정한 기획전 데이터 (11번가 참고, v0.4) | ✅ | 배너와 딜 목록이 서로 겹치지 않음. 배너 3장 노출을 실행 화면에서 확인. 기획전 전용 페이지는 보류 |
| [Plan] | 카운트다운 대신 "오늘 HH:MM 마감" 문구 | ✅ | 목록 카드에서 `DealTimer` 제거. 상세 페이지는 아직 `DealTimer` 사용 (이월) |
| [Plan] | 곧 오픈·베스트는 5개씩 넘기는 캐러셀 (v0.5) | ✅ | 상위 15개를 처음 HTML에 모두 넣고 서버 요청 없이 넘김. 5개 이하면 장치 없음 확인 |
| [Plan] | 성능 측정 선택 안 함 | ✅ | 측정하지 않음. Supabase 단계에서 직접 측정 |
| [Design] | C안 (규칙은 `lib/`, 섹션마다 컴포넌트 하나) | ✅ | `lib/home.ts`에 순수 함수와 데이터 경계(`getHomeSections`)를 나눔. Supabase 때 경계만 교체 |
| [Design] | `force-dynamic` (ISR 아님) | ✅ | 빌드 시각에 `now`가 멈추는 것과 ISR의 오래된 화면을 모두 피함. 목 데이터라 비용 거의 없음 |
| [Design] | `PagedCarousel` 하나만 클라이언트, 내용은 children | ✅ | 새 `"use client"` 파일 1개(`PagedCarousel.tsx`). 카드는 서버에서 그림 |
| [Design] | 자동 넘김은 직접 만든 `useAutoplay` (플러그인 대신) | ✅ | 의존성 추가 없음. 가짜 시간으로 6개 테스트 |
| [Design] | 동작 줄이기는 `useSyncExternalStore`로 읽음 | ✅ | hydration 경고 없음 (브라우저 콘솔 확인). 사용자가 재생을 누르면 그 선택 우선 |
| [Design] | 시각(`now`)은 페이지에서 한 번만 만듦 | ✅ | 홈·`/today`·`/best` 모두 페이지가 `now`를 내려줌. `getDealsByTab`은 분석 단계에서 맞춤 |
| [Test] | 잘못된 시각 입력은 `it.failing`으로 기록 후 고침 (`it.todo` 대신) | ✅ | 사용자 판단: "관리자 단계까지 미루는 건 프론트엔드 테스트답지 않다". NaN 문구·베스트 누수 고침 |

---

## 2. 관련 문서

| Phase | Document | Status |
|-------|----------|--------|
| Plan | [home.plan.md](../01-plan/features/home.plan.md) (v0.5) | ✅ Draft (FR 상태·3.2 문장 정리 필요, 4.2 참고) |
| Design | [home.design.md](../02-design/features/home.design.md) (v0.5) | ✅ 분석·보고 반영 |
| Check | [home.analysis.md](../03-analysis/home.analysis.md) | ✅ Complete |
| Check (Jest) | [home.jest.md](../03-analysis/home.jest.md) (module-1~3) | ✅ Complete |
| Learn | [improvement-notes.md](../improvement-notes.md) 5·6·7번 | ✅ |
| Learn | [testing-notes.md](../testing-notes.md) 5번 (진행 방식) | ✅ 실제 흐름(module마다 `/jest-test`, analyze에서 화면 확인)으로 고침 |
| Act | 현재 문서 | ✅ |

---

## 3. 완료 항목

### 3.1 Functional Requirements

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-01 | 기획전 배너 최대 5장 (노출 기간 안, 순서대로), 화살표, `01 / 05`, 없으면 영역 숨김 | ✅ Complete | `lib/home.ts` 배너 규칙, `PagedCarousel` `padIndex` |
| FR-02 | 오늘 마감 최대 6개, shadcn `Carousel`, 데스크톱 화살표·모바일 밀기 | ✅ Complete | 실행 확인 (1280px / 390px) |
| FR-03 | 곧 오픈 최대 15개, 오픈 시각 순, 5개씩 한 장, 카드 위 `HH:MM`, 자동 넘김 없음 | ✅ Complete | 장 표시는 `1 / 3` |
| FR-04 | 베스트 리뷰 순 최대 15개, 5개씩, 순위 번호는 장을 넘어 이어짐 | ✅ Complete | 2장 첫 카드 = 6위 (테스트) |
| FR-05 | 마감 지난 딜은 홈 어디에도 없음 | ✅ Complete | 경계(마감 = now) 테스트 |
| FR-06 | 마감 문구 "오늘 HH:MM 마감"(회색), 1시간 미만 "곧 마감 · HH:MM"(빨강), `DealCard`도 통일 | ✅ Complete | 실행에서 `곧 마감 · 23:30` 확인 |
| FR-07 | 영역별 "전체보기" 링크 (`/today?tab=closing`, `/today?tab=open`, `/best`) | ✅ Complete | HTML 링크 확인 |
| FR-08 | 진행 중 딜 없을 때 안내 + 다음 오픈 시각 | ✅ Complete | 23시 곧 오픈 빈 문구 확인. 낮 시간 "다음 딜은 HH:MM" 문구는 Jest로만 확인 |
| FR-09 | 맞지 않는 사진 교체, 흑백 처리 제거 | ✅ Complete | 6장 교체. 화면 확인 (`grayscale` 없음) |
| FR-10 | `/best` 리뷰 순 정렬 | ✅ Complete | `getBestDeals`. `/api/deals` 순서는 그대로 |
| FR-11 | 배너 자동 넘김 5초, 일시정지, 포커스·마우스 중 멈춤, 동작 줄이기 대응 | ✅ Complete | `useAutoplay` 6개, `PagedCarousel` 14개 테스트 |

### 3.2 Non-Functional Requirements

| Item | Target | Achieved | Status |
|------|--------|----------|--------|
| 렌더링 | 홈은 서버 컴포넌트, 새 `"use client"`는 `PagedCarousel` 하나 | `PagedCarousel.tsx:1`만 새로 추가. 빌드 `ƒ /` | ✅ |
| 배너 접근성 | 일시정지 버튼 이름이 상태에 맞게 바뀜, 화살표 이름, 현재 장 읽기 | `getByRole('button', { name })` 테스트, `aria-live` (재생 중 off) | ✅ |
| 시간 | 섹션 판단은 한국 시간, 서버 시간대와 무관 | Jest `TZ=UTC` 고정, KST 경계 테스트 | ✅ |
| 반응형 | 목록 그리드 390px 2열, 홈 오늘 마감은 한 장 반, 곧 오픈·베스트는 모바일 목록 5줄 (plan v0.6에서 나눠 적음) | 그대로 나옴. 가로 넘침 없음 (`scrollWidth` 390) | ✅ |
| 접근성 | 섹션 제목 `h2`, 더보기 링크 이름 | h2 3개, `오늘 마감 전체보기` 등 이름 확인 | ✅ |
| 성능 | 측정 안 함 (plan 4.3 선택 안 함) | - | - |

### 3.3 Deliverables

| Deliverable | Location | Status |
|-------------|----------|--------|
| 홈 페이지 | `app/page.tsx` | ✅ |
| 영역 규칙 | `lib/home.ts`, `lib/dealTime.ts`, `lib/banners.ts`, `lib/utils.ts`(`chunk`) | ✅ |
| 배너 타입 | `types/banner.ts` | ✅ |
| 홈 컴포넌트 | `components/features/home/components/` (`PagedCarousel`, `useAutoplay`, `BannerSlide`, `UpcomingPage`, `BestPage`, `SectionHeader`, `EmptyNotice`) | ✅ |
| 카드 변경 | `components/features/deal/components/DealCard.tsx`, `DealCardGrid.tsx` | ✅ |
| Tests | `lib/__tests__/`, `components/features/home/components/__tests__/`, `DealCard.test.tsx` | ✅ 127 통과 |
| Docs | plan, design, analysis, jest 보고서, improvement-notes 7번 | ✅ |
| 목업 | `app/home-mockup/` | ✅ 삭제 (커밋 안 된 상태라 되돌릴 수 없음, 6.2 참고) |

---

## 4. 미완료 / 이월

### 4.1 이월 (다음 작업으로 넘김)

| Item | Reason | Priority | 근거 |
|------|--------|----------|------|
| Playwright E2E (L2·L3) | Playwright 미설치 | High | todo 6번. 홈 조립, 스와이프, 배너 → `/best?category=`, 낮 시간 화면 |
| 상세 페이지 정리, `DealTimer` 제거 여부 | 상세가 아직 `DealTimer` 사용 | Medium | todo 3번 |
| `/today`의 `revalidate = 30` 정리 | `searchParams`를 읽어 이미 요청마다 그려짐 (효과 없음) | Low | todo 정책 항목, 설계 2.3 |
| 모르는 `?category=` 값이면 전체 목록이 나옴 | 기존 동작 (관찰). 정책 미정 | Low | 정책 항목 (404 또는 전체) |
| Supabase 단계 DB 결과 캐시 | 목 데이터 단계에서는 해당 없음 | - | 설계 2.3 |

### 4.2 의도적으로 남긴 결정 (분석 Minor 5~7번)

| # | 내용 | 결정 | 이유 |
|---|------|------|------|
| 5 | 오늘 마감 화살표가 첫·마지막 카드 사진 위에 겹치고, 넘길 게 없어도 흐린 화살표가 남음 | 보류 (디자인 판단) | 상세 캐러셀 정리(todo 3번)와 같이 봄 |
| 6 | 가격 표시가 `DealCard`, `UpcomingPage`, `BestPage` 세 곳에 중복 | 합치지 않음 | 모양(카드 / 한 줄 목록)과 정보량이 달라 지금 합치면 억지. 할인율 규칙(`discountRate > 0`)은 세 곳 모두 같음 (확인: `DealCard.tsx:14`, `UpcomingPage.tsx:33`, `BestPage.tsx:40`). 세 번째 가격 표시가 늘면 다시 검토 |
| 7 | 오늘 마감 캐러셀이 모바일에서 카드 한 장 반(`basis-[70%]`)을 보여 옆으로 밀 수 있음 | 의도로 둠 | 옆 카드가 보여야 밀 수 있다는 신호가 됨. plan 3.2 "390px 2열"은 목록 그리드 기준이라 v0.6에서 홈 캐러셀과 나눠 적음 |

### 4.3 문서 정리 (분석 "문서만 고칠 것", report 단계에서 처리함)

- plan v0.6: FR 상태 `Done`, 성공 조건 체크, 배너 표시 `01 / 05`, 2.3 클라이언트 캐러셀 목록에 곧 오픈 추가, 3.2 반응형을 목록 그리드와 홈 캐러셀로 나눠 적음
- design v0.5: 헤더 버전과 이력 순서, §8.4(embla를 가짜로 바꿔 `matchMedia`만), §3.3·§3.4 잘못된 시각 규칙, §2.4 `lib/home.ts` 의존 관계, §5.3 region 역할은 shadcn `Carousel`이 붙임
- `testing-notes.md` 5번: 실제로 진행한 흐름으로 다시 씀
- `todo.md`: 홈(1번) 삭제, 캐러셀 화살표(갭 #5)는 3번으로, 모르는 `?category=` 값은 "정할 것"으로

---

## 5. 품질 지표

### 5.1 Final Analysis Results

| Metric | Target | Final | Change |
|--------|--------|-------|--------|
| Design Match Rate | 90% | 99% (정적 98%) | 반복 0회 |
| Jest 통과 수 | - | 127 (14 suites) | 53 → 127 (+74) |
| `it.failing` | 0 | 0 | 찾은 4개 모두 고침 |
| 섹션 선택 분기 coverage | 100% | `home.ts` 100%, `dealTime.ts` 100%, `useAutoplay` 100%, `PagedCarousel` 분기 100% | ✅ |
| `tsc` / `lint` / `build` | 통과 | 통과 / 통과 / 통과 (`/`는 `ƒ`) | ✅ |
| 실행 확인 | - | 9 / 9 (`pnpm start`, 한국 23:24) | ✅ |
| 성능 (LCP, TBT, CLS, JS 크기) | - | 측정 안 함 | plan 4.3 |

### 5.2 Resolved Issues (개발 중 발견, 배포 전에 고침)

| Issue | 찾은 곳 | Resolution | Result |
|-------|---------|------------|--------|
| `formatEndLabel`이 날짜가 아닌 값에서 `"NaN월 NaN일 NaN:NaN 마감"` 출력 | `/jest-test` module-1 | 잘못된 시각이면 `마감 시간 미정` 먼저 반환 | ✅ |
| `formatKstTime`이 `"NaN:NaN"` 출력 | `/jest-test` module-1 | 잘못된 시각이면 `--:--` | ✅ |
| 오픈 시각만 잘못된 딜이 베스트에 남음 | `/jest-test` module-1 | `live`에서 오픈 시각이 올바른 딜만 남김 | ✅ |
| 할인율 0이면 빨간 `0%` 표시 | `/jest-test` module-2 (`DealCard`) | `discountRate > 0`일 때만 표시 | ✅ |
| `/today`가 목록과 카드의 `now`를 따로 만듦 | analyze (gap #2) | `getDealsByTab(…, now)`로 같은 시각 사용 + 테스트 1개 | ✅ |
| `/best` 빈 문구가 실제 동작과 다름 | analyze (gap #4) | "이 카테고리에는 아직 딜이 없어요." | ✅ |
| 배너 파일에 `TODO(module-2)` 주석이 남음 | analyze (gap #3) | 주석 삭제 | ✅ |

---

## 6. 회고 (Lessons Learned & Retrospective)

### 6.1 Keep (잘한 것)

- **규칙을 화면 밖 순수 함수로 뺌**: `now`만 바꿔 경계 시각(마감 = 지금, 오픈 = 지금, 자정 직후)을 테스트. 나중에 시간 버그를 찾는 데 쓸 수 있는 구조.
- **`/jest-test`를 module마다 돌림**: 버그 4개를 do 안에서 잡았다. 마지막에 한꺼번에 돌렸다면 원인을 다시 찾아야 했을 것.
- **module 단위 세션 분리** (`/clear` 후 `/pdca do home --scope module-N`): 세션마다 맥락이 짧아 작업이 끊기지 않았다.
- **analyze에서 실제로 띄워 확인**: 빌드 후 `pnpm start`로 응답·HTML·콘솔을 확인해 `/today` 시각 불일치를 찾았다. 정적 분석만으로는 안 보이던 것.

### 6.2 Problem (아쉬운 것)

- **목업을 커밋하지 않아 삭제가 되돌릴 수 없었음**: `app/home-mockup/`을 지울 때 복구할 방법이 없었다. 이미 목업에서 실제 화면으로 옮긴 뒤라 큰 피해는 없었지만 위험한 방식이었다.
- **설계서를 구현 중에 늦게 고침**: `padIndex`, `useSyncExternalStore`, `browserMocks` 범위가 구현 뒤에야 설계서에 반영됐다. 설계서의 버전 표기도 순서가 어긋나 있다.
- **밤에 확인한 화면이 전부**: 실행 확인은 밤 23:24에 했다. 낮 시간 화면(배너 3장째 노출, 오늘 마감 "다음 딜은 HH:MM")은 Jest로만 확인했다.
- **계획 문서가 구현보다 늦게 따라감**: 계획서 v0.1 → v0.5로 배너 기준과 베스트 형태가 두 번 바뀌었다. 문서 안에서 바꾼 것은 싸지만, 실행 확인에서 본 것(FR 상태, 390px 문장)은 report 단계에서야 계획서에 반영됐다.

### 6.3 Try (다음에 해 볼 것)

- **목업도 커밋**: 목업은 별도 브랜치나 커밋에 두고, 버리는 것은 `git revert`로 되돌릴 수 있게 한다.
- **module 완료 체크리스트에 설계서 갱신 포함**: module을 끝낼 때마다 설계서 Version History와 체크박스를 같이 갱신한다.
- **E2E에서 시각 고정**: Playwright의 시계 기능으로 `now`를 고정해 낮·밤 화면을 모두 자동으로 확인한다.
- **반응형 기준은 화면별로**: "390px에서 2열"처럼 한 줄로 적으면 목록 그리드와 캐러셀이 섞인다. 화면(영역)별로 나눠 적고, 실제 화면을 보고 바뀌면 계획서를 먼저 고친다.

---

## 7. 프로세스 개선 제안

### 7.1 PDCA Process

| Phase | Current | Improvement Suggestion |
|-------|---------|------------------------|
| Plan | 화면 방향을 목업으로 비교해 정함 (효과 좋음). 배너 기준은 구현 전 문서에서 두 번 바뀜 | 참고 사례(11번가)를 plan에 먼저 적고, 바꿀 때 근거를 남김 (이미 함) |
| Design | 3안 비교 후 C안 선택 (효과 좋음). 구현 중 변경을 늦게 반영 | module 완료마다 Version History 갱신 |
| Do | module 4개, 세션 분리 잘 됨. 목업 삭제가 되돌릴 수 없었음 | 목업은 커밋 또는 별도 브랜치에 둔 뒤 삭제 |
| Check | analyze에서 실행 확인까지 함. 문서 정리 항목은 빠짐 | 분석 보고서의 "문서만 고칠 것"을 analyze 끝에 같이 처리 |
| Act | 문서 정리(todo, testing-notes, 낡은 문장)를 report 단계에서 몰아서 함 | analyze 끝에 "문서만 고칠 것"을 같이 처리 |

### 7.2 Tools / Environment

| Area | Improvement Suggestion | Expected Benefit |
|------|------------------------|------------------|
| 테스트 | `/jest-test`를 module마다 실행 (이번에 함) | 버그를 do 안에서 발견 |
| E2E | Playwright 설치 후 홈·배너 흐름, 낮 시간 고정 | 밤·낮 화면을 자동 확인 (todo 6번) |
| 문서 | 설계서 Version과 이력 순서 자동 점검은 없음 | 수동 확인 필요. 작은 체크리스트로 대신 |

---

## 8. 다음 단계

### 8.1 Immediate

- [ ] 커밋 확인 후 푸시 (main 푸시 = Vercel 배포). 배포본에서 `/`를 두 번 새로고침해 요청마다 그려지는지 확인
- [ ] `/pdca archive home`

### 8.2 Next PDCA Cycle / todo

| Item | Priority | 근거 |
|------|----------|------|
| Playwright E2E (홈 조립, 스와이프, 배너 → `/best?category=`, 낮 시간) | High | todo 6번 |
| 관리자 + Supabase 연결 (목 데이터 → DB, 배너도 같이) | High | todo 2번 |
| 상세 페이지 정리 (서버 컴포넌트, `DealTimer` 제거 여부) | Medium | todo 3번 |
| 검색 (`?q=`) | Medium | todo 4번 |
| 찜·장바구니 | Low | todo 5번 |
| 정책 결정: `?page=`, `?tab=` 잘못된 값, `?category=` 잘못된 값 | Low | todo 정책 항목 |

---

## 9. Changelog

### 홈 화면 (2026-11-23)

**Added:**
- 홈(`/`): 기획전 배너(최대 5장, 자동 넘김·일시정지), 오늘 마감(최대 6개), 곧 오픈(15개, 5개씩), 베스트(15개, 5개씩, 순위)
- `lib/home.ts` `selectHomeSections`, `lib/dealTime.ts` `formatEndLabel`·`formatKstTime`, `lib/banners.ts`, `chunk`, `getBestDeals`
- `PagedCarousel`, `useAutoplay` 훅
- Jest 74개 (127 통과)

**Changed:**
- 목록 카드의 카운트다운을 "오늘 HH:MM 마감" 문구로 바꿈 (`DealCard`, 목록 카드 JS 제거)
- `/best` 리뷰 수 순 정렬, 빈 문구 수정
- `/today`가 페이지의 `now`로 목록을 거름
- 상품 사진 6장 교체, 흑백 처리와 덮개 제거

**Fixed:**
- 잘못된 시각 값이 마감 문구(`NaN`)와 베스트에 새는 문제
- 할인율 0일 때 빨간 `0%` 표시

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-11-23 | 완료 보고서 작성 | Park sian |
