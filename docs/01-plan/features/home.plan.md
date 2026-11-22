# home 계획서

> **요약**: 임시 화면인 홈(`/`)을 "오늘의 딜 배너(최대 3개) · 오늘 마감 · 곧 오픈 · 베스트" 구성으로 채운다.
>
> **Project**: deal-flow
> **Version**: 0.3.0
> **Author**: Park sian
> **Date**: 2026-11-18
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 첫 화면이 `home page` 글자와 `Click me` 버튼뿐이라, 처음 온 사람(면접관 포함)이 무슨 사이트인지 알 수 없다. |
| **Solution** | 맨 위에 가장 먼저 끝나는 딜 최대 3개를 큰 배너 캐러셀(자동 넘김 + 일시정지)로 보여주고, 아래에 오늘 마감(가로 목록) · 곧 오픈 · 베스트 순위를 서로 다른 모양으로 배치한다. 같은 딜이 여러 섹션에 겹치지 않게 고른다. |
| **Function/UX Effect** | 들어오자마자 어디를 봐야 할지 보이고, 마감은 카운트다운 대신 "오늘 18:00 마감"처럼 차분하게 알려준다. "전체보기"로 `/today`, `/best`에 바로 갈 수 있다. |
| **Core Value** | 재촉하지 않으면서도 "오늘만 살 수 있는 딜"이라는 특가 커머스의 성격을 첫 화면에서 보여준다. |

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

### 1.1 Purpose
배포 주소로 들어왔을 때 첫 화면에서 서비스가 무엇인지, 지금 무엇을 살 수 있는지 보이게 한다.

### 1.2 Background
- 프론트엔드 이직 준비용 프로젝트라 배포 링크의 첫인상이 중요하다.
- 데이터 함수(`getAllDeals`, `getDealsByTab`)와 카드(`DealCard`)는 이미 있고 테스트도 되어 있다. 홈은 이것들을 조합하는 일이다.
- bkit PDCA를 처음 적용해 보는 기능이다. do 다음 `/jest-test`를 돌리는 흐름(`docs/testing-notes.md` 5번)을 실제로 확인한다.

### 1.3 Related Documents
- 할 일: `docs/todo.md` 1번
- 테스트 진행 방식: `docs/testing-notes.md` 5번
- 개선 기록: `docs/improvement-notes.md`
- 레퍼런스: 11번가 PC 홈 (2026-11-22 확인). 맨 위 배너 캐러셀(`01 / 16` 표시, 일시정지 버튼)의 **배치와 동작만** 참고한다. 11번가는 Next.js가 아닌 React CSR(서버는 빈 HTML, 브라우저에서 그림)이고, 우리는 같은 형태를 서버 컴포넌트로 만든다

---

## 2. Scope

### 2.1 In Scope
- [ ] 홈(`/`) 페이지를 서버 컴포넌트로 다시 만들기
- [ ] 오늘의 딜 배너(최대 3개) · 오늘 마감 · 곧 오픈 · 베스트 네 영역
- [ ] 배너 캐러셀: 자동 넘김, 일시정지 버튼, `01 / 03` 표시, 동작 줄이기 설정 대응
- [ ] 영역별 딜을 고르는 순수 함수를 `lib/`에 두고 Jest로 테스트
- [ ] 영역이 비었을 때 안내 문구
- [ ] 마감 표시를 카운트다운에서 "오늘 HH:MM 마감"으로 바꾸고 `DealCard`도 같은 방식으로 통일
- [ ] 상품과 맞지 않는 사진 교체, 흑백 처리 제거
- [ ] `/best`도 같은 베스트 기준(리뷰 수)으로 정렬

### 2.2 화면 초안

세 가지 방향(A 큰 딜+목록, B 시간표, C 요약+탭)을 목업으로 비교해 **A**를 골랐다. 처음 안(같은 4칸 줄 세 번)은 위계가 없고 같은 딜이 겹쳐서 버렸다.

v0.3에서 맨 위 큰 딜 1개를 11번가 홈처럼 **배너 캐러셀**로 바꿨다. 한 장에 딜 하나를 크게 보여주는 모양은 그대로 두고, 같은 자리에서 마감이 빠른 딜 3개까지 넘겨 볼 수 있게 했다.

```
데스크톱
┌──────────────────────────────────────────────────────────┐
│ (기존 헤더 + 카테고리 탭)                                │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────┬─────────────────────┐                 │
│ │                │ 오늘의 딜           │ ← 진행 중 딜 중 │
│ │   큰 사진      │ 브랜드 / 상품명     │   마감 빠른 순  │
│ │                │ 72% 13,900원        │   최대 3장      │
│ │                │ 오늘 18:00까지      │                 │
│ └────────────────┴─────────────────────┘                 │
│  ━━━━───────          ‹  01 / 03  ›   ⏸                 │
│  진행 막대             이전·다음  현재 장  일시정지      │
│                                                          │
│ 오늘 마감                                  전체보기 →    │
│ ‹ [사진][사진][사진][사진][사진] ›   캐러셀, 최대 6     │
│  가격 / 오늘 20:00 마감                                  │
│                                                          │
│ 곧 오픈                                    전체보기 →    │
│ 16:00   17:00   18:00   19:00   20:00   ← 한 줄, 최대 6  │
│ [사진]  [사진]  [사진]  [사진]  [사진]                   │
│                                                          │
│ 베스트                                     전체보기 →    │
│ 1 [□] 상품 · 리뷰 수        4 [□] 상품 · 리뷰 수         │
│ 2 [□] 상품 · 리뷰 수        5 [□] 상품 · 리뷰 수         │
│ 3 [□] 상품 · 리뷰 수        6 [□] 상품 · 리뷰 수         │
└──────────────────────────────────────────────────────────┘

모바일: 배너는 사진 위·글 아래이고 손으로 밀어 넘김, 곧 오픈은 2열, 베스트는 1열

빈 상태 (예: 밤늦게)
│   지금 진행 중인 딜이 없어요. 내일 오전 9시에 새 딜이 열려요. │
```

마감 표시 규칙: 평소에는 회색 작은 글씨 "오늘 20:00 마감". 1시간 미만 남았을 때만 빨간 "곧 마감 · 20:00". 초 단위로 줄어드는 카운트다운은 재촉하는 느낌이 강해서 쓰지 않는다.

배너 동작 규칙:

| 상황 | 동작 |
|------|------|
| 기본 | 5초마다 다음 장으로 자동 넘김. 마지막 장 다음은 첫 장 |
| 일시정지 버튼 누름 | 자동 넘김 멈춤. 버튼이 재생(▶)으로 바뀜 |
| 마우스를 올리거나 키보드로 배너 안에 들어옴 | 그동안 자동 넘김 멈춤 (읽는 중에 넘어가지 않게) |
| 운영체제의 "동작 줄이기" 켜짐 (`prefers-reduced-motion`) | 처음부터 자동 넘김 안 함. 화살표와 밀기로만 넘김 |
| 딜이 1개뿐 | 캐러셀 장치(화살표, `01 / 01`, 일시정지) 없이 큰 딜 하나만 |
| 딜이 0개 | 배너 자리에 빈 상태 안내(FR-08) |

### 2.3 서버 / 클라이언트 경계

기준: **브라우저에서만 할 수 있는 일(상태, 클릭·드래그, 타이머, 브라우저 API)이 있는 부분만 클라이언트 컴포넌트**로 만든다.

```
app/page.tsx                 서버 (async)  now를 정하고 영역별 딜을 고름
├─ HeroCarousel             [클라이언트]  자동 넘김 타이머, 일시정지 상태, 동작 줄이기 확인
│   └─ HeroSlide × 최대 3    서버에서 그려 children으로 넘김
├─ 오늘 마감 섹션            서버          제목, 전체보기 링크
│   └─ Carousel(shadcn)     [클라이언트]  화살표, 손으로 밀기
│       └─ DealCard × 6      서버에서 그려 children으로 넘김
├─ 곧 오픈 섹션              서버
├─ 베스트 섹션               서버
└─ 빈 상태 안내              서버
```

| 원칙 | 이유 |
|------|------|
| 캐러셀은 children을 받는 껍데기로 만든다 | `"use client"` 파일이 **import**한 컴포넌트는 함께 클라이언트가 되지만, **children으로 받은** 컴포넌트는 서버에서 그려진 결과라 서버로 남는다. 브라우저가 받는 JS가 넘김 동작뿐이 된다 |
| "지금 시각"은 `page.tsx`에서 한 번만 정한다 | 클라이언트에서 `new Date()`로 마감 표시를 계산하면 서버가 그린 시각과 달라 hydration 불일치가 난다. 서버 시간대(UTC)도 한국과 다르다 |
| `DealCard`에서 `DealTimer`(1초 타이머)를 뺀다 | 카드마다 1초에 한 번 다시 그리는 일이 없어지고, 카드가 JS 없는 서버 컴포넌트가 된다 (`/today`, `/best`도 같이 가벼워짐) |
| 배너 첫 장 사진만 `priority` | 첫 화면에서 가장 큰 요소(LCP)라서 미리 받는다. 나머지 장은 지연 로딩 |

### 2.4 Out of Scope
- 개인화 추천, 광고·기획전 배너 (배너에는 딜만 넣는다)
- 11번가 디자인·이미지 복제 (배치와 동작만 참고)
- CSR과의 성능 비교, 대량 데이터 측정 (Supabase 단계에서 직접 진행)
- 찜·장바구니, 검색 (`docs/todo.md`의 다른 항목)
- 새 데이터 필드, API 라우트 변경, Supabase
- 관리자 페이지·AI 상품 등록 도우미 (홈 다음 기능으로 `docs/todo.md`에 추가)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | **오늘의 딜 배너**: 진행 중인 딜(오픈 ≤ 지금 < 마감) 중 마감이 빠른 순으로 최대 3개를 한 장에 하나씩 크게. 이전·다음 화살표, `01 / 03` 현재 장 표시 | High | Pending |
| FR-02 | **오늘 마감**: 진행 중인 딜에서 배너 딜을 뺀 나머지를 마감 빠른 순으로 최대 6개. 기존 shadcn `Carousel`(상세 페이지 사진과 같은 컴포넌트)로 넘겨 본다. 데스크톱은 화살표 버튼, 모바일은 손으로 밀기 | High | Pending |
| FR-03 | **곧 오픈**: 오늘 오픈 예정이고 아직 열리지 않은 딜을 오픈 시각 순으로 최대 6개를 한 줄로(데스크톱 6칸, 모바일 2칸). 카드 위에 오픈 시각 | High | Pending |
| FR-04 | **베스트**: 마감 전인 딜을 리뷰 수 순으로 1~6위 번호 목록(데스크톱 2열 x 3줄) (작은 목록이라 위 영역과 겹쳐도 허용) | High | Pending |
| FR-05 | 마감 시간이 지난 딜은 홈 어디에도 나오지 않는다 | High | Pending |
| FR-06 | 마감 표시: "오늘 HH:MM 마감"(회색). 1시간 미만이면 "곧 마감 · HH:MM"(빨강). `DealCard`도 같은 표시로 바꾼다 | High | Pending |
| FR-07 | 영역마다 "전체보기" 링크: 오늘 마감 → `/today?tab=closing`, 곧 오픈 → `/today?tab=open`, 베스트 → `/best` | Medium | Pending |
| FR-08 | 진행 중인 딜이 없으면 배너 자리에 "지금 진행 중인 딜이 없어요"와 다음 오픈 시각(없으면 "내일 오전 9시")을 보여준다 | Medium | Pending |
| FR-09 | 상품과 맞지 않는 사진을 교체하고 카드 사진의 흑백 처리를 없앤다 | Medium | Pending |
| FR-10 | `/best` 목록도 리뷰 수가 많은 순으로 정렬 | Medium | Pending |
| FR-11 | **배너 자동 넘김**: 5초 간격. 일시정지·재생 버튼, 마우스·키보드 포커스가 있는 동안 멈춤, `prefers-reduced-motion`이면 자동 넘김 끔. 딜이 1개면 캐러셀 장치 없이 표시 (2.2 배너 동작 규칙) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 렌더링 | 홈은 서버 컴포넌트. 마감 표시가 시각만 보여주므로 1초마다 도는 클라이언트 타이머가 필요 없다. 새 `"use client"`는 `HeroCarousel` 하나 | 빌드 결과, `"use client"` 파일 목록 |
| 배너 접근성 | 일시정지 버튼이 있고 이름(`aria-label`)이 상태에 맞게 바뀜, 화살표에 이름, 현재 장을 스크린리더가 읽음 | Testing Library `getByRole('button', { name })` |
| 시간 | 섹션 판단은 한국 시간 기준, 서버 시간대와 무관 | `TZ=UTC` Jest |
| 반응형 | 390px에서 2열, 데스크톱 4열 (기존 그리드와 같음) | 브라우저 확인 |
| 접근성 | 섹션 제목은 `h2`, "더보기"는 이동할 곳을 알 수 있는 링크 이름 | Testing Library `getByRole` |

---

## 4. Success Criteria

### 4.1 Definition of Done
- [ ] FR-01 ~ FR-11 구현
- [ ] 섹션 선택 함수 Jest 테스트 통과 (do 다음 `/jest-test`, 보고서 `docs/03-analysis/home.jest.md`)
- [ ] `/jest-test`에서 `it.failing`이 남지 않음 (남으면 do로 돌아감)
- [ ] `docs/improvement-notes.md`에 문제 → 원인 → 해결 → 이유 기록
- [ ] `docs/todo.md`에서 홈 항목 제거

### 4.2 Quality Criteria
- [ ] 섹션 선택 함수 분기 coverage 100% (돈·시간 판단이라 우선순위 1)
- [ ] `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint` 통과
- [ ] `pnpm build` 성공

### 4.3 성능 측정 (선택)

| 항목 | 값 |
|------|-----|
| **선택 여부** | 선택 안 함 (CSR 비교와 대량 데이터 측정은 Supabase 단계에서 직접 진행하기로 함) |

선택하면 아래 순서로 analyze에 포함한다.

1. **do 전**: 배포본에서 바꾸기 전 값을 기록 (`/today`, `/best`. 홈은 지금 임시 화면이라 바꾸기 전 값이 의미 없음)
2. **analyze**: 같은 조건으로 다시 재서 `docs/03-analysis/home.perf.md`에 비교
3. 목표에 못 미치면 Act(iterate)로 돌아감

| 지표 | 측정 방법 | 목표 (모바일) |
|------|-----------|---------------|
| LCP | chrome-devtools 성능 trace, 3회 중앙값 | 2.5초 이하 |
| TBT | 같음 | 200ms 이하 |
| CLS | 같음 | 0.1 이하 |
| 브라우저가 받은 JS | 네트워크 요청 중 script 크기 합계 | 바꾸기 전보다 감소 (`DealTimer` 제거 효과) |

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 목 데이터가 모두 같은 날 09~20시 오픈, 18~23:59 마감이라 자정 전후·이른 아침에는 진행 중 딜이 없음 | Medium | High | FR-06 빈 상태 문구. 섹션 함수가 `now`를 인자로 받아 시간대별로 테스트 |
| 홈이 요청 시점의 "지금"에 따라 달라지는데 정적 생성되면 빌드 시각에 고정됨 | High | Medium | `/today`처럼 `revalidate`를 두거나 동적 렌더링. Design에서 결정 |
| 영역끼리 같은 딜이 겹쳐 보임 | Low | High | 오늘의 딜·오늘 마감·곧 오픈은 서로 겹치지 않게 고름. 베스트만 작은 순위 목록이라 겹침 허용 |
| `DealCard` 마감 표시 변경이 `/today`, `/best`와 기존 `DealTimer` 테스트에 영향 | Medium | High | 6.2에서 확인. `DealTimer` 테스트는 새 표시 규칙 테스트로 바꿈 |
| 홈 마감 표시가 서버 렌더 시각 기준이라 오래 띄워 두면 "곧 마감"으로 바뀌지 않음 | Low | Medium | `revalidate`로 주기적으로 다시 그림. Design에서 주기 결정 |
| `/best` 정렬 변경이 기존 테스트에 영향 | Low | Medium | 영향 범위(6.2)에서 확인 후 테스트 갱신 |
| 자동 넘김 배너가 읽는 중에 넘어가거나 어지러움을 줌 | Medium | Medium | FR-11: 일시정지 버튼, 포커스 중 멈춤, 동작 줄이기 대응 |
| 배너 안 딜 카드를 캐러셀 파일에서 import해 클라이언트 범위가 커짐 | Medium | Medium | 2.3 원칙대로 children으로 넘김. 빌드 후 `"use client"` 파일 목록 확인 |
| 자동 넘김 타이머 테스트가 실제 시간에 의존 | Low | High | `jest.useFakeTimers()`로 5초를 앞당겨 확인 (`DealTimer` 테스트와 같은 방식) |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `app/page.tsx` | Page | 임시 화면을 네 영역 홈으로 교체 |
| `HeroCarousel` (새 파일) | Component (client) | 배너 자동 넘김·일시정지. 내용은 children으로 받음 |
| `lib/` (새 함수) | Logic | 영역별 딜 선택 함수, 마감 표시 문구 함수 추가 (`now`를 인자로) |
| `DealCard` / `DealTimer` | Component | 카운트다운 띠 → "오늘 HH:MM 마감" 표시, 흑백 처리 제거 |
| `lib/deals.ts` 썸네일 | Data | 상품과 맞지 않는 사진 교체 |
| `getAllDeals` 또는 `/best` | Logic | 리뷰 수 정렬 추가 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `app/page.tsx` | READ | 사용하는 곳 없음 (라우트 `/`) | None |
| `getAllDeals` | READ | `DealCardGrid` → `/best` | Needs verification (정렬 순서 변경) |
| `getAllDeals` | READ | `app/api/deals/route.ts` (tab 없을 때) | Needs verification (응답 순서 변경) |
| `getAllDeals` | READ | `lib/__tests__/deals.test.ts`, `app/api/deals/__tests__/route.test.ts` | Needs verification |
| `DealCard` | READ | `DealCardGrid`(`/best`), `/today` | Needs verification (마감 표시 변경) |
| `DealTimer` | READ | `DealCard`, 상세 페이지 | Needs verification (상세에서 계속 쓸지 Design에서 결정) |

### 6.3 Verification
- [ ] `/best`와 `/api/deals` 응답 순서 변경이 의도대로인지 확인
- [ ] 기존 테스트 53개 통과

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

현재 구조(`app/`, `components/features/`, `lib/`)를 그대로 따른다. Supabase는 나중 단계.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 App Router | Next.js | 기존 프로젝트 |
| 렌더링 | 서버 컴포넌트 / 클라이언트 | 서버 컴포넌트 + 캐러셀만 클라이언트 | 데이터가 서버에 있고, 상호작용은 캐러셀 넘김뿐이다 (2.3) |
| 배너 구현 | shadcn `Carousel`(embla) 위에 자동 넘김 추가 / 직접 구현 | Design에서 결정 | embla autoplay 플러그인 사용 여부, 테스트 쉬운 쪽 |
| State Management | 없음 | 없음 | 홈은 읽기 전용 |
| 데이터 접근 | `lib/` 함수 직접 호출 / API fetch | `lib/` 직접 호출 | 서버 컴포넌트에서 자기 API를 HTTP로 부르지 않는다(개선 노트) |
| Styling | Tailwind 4 + shadcn/ui | Tailwind | 기존 |
| Testing | Jest / Playwright | Jest(섹션 함수), Playwright는 todo 5번 | async 서버 컴포넌트는 Jest로 그리지 않는다 |
| Backend | 목 데이터 | 목 데이터 | 범위 밖 |

### 7.3 Folder Structure Preview

```
app/page.tsx                                  ← 홈 (async 서버 컴포넌트)
components/features/home/components/          ← HeroCarousel("use client"), HeroSlide, 오픈 예정, 베스트 순위 (Design에서 확정)
lib/home.ts                                   ← 영역 선택 함수, now를 인자로
lib/dealTime.ts (또는 lib/home.ts 안)          ← "오늘 HH:MM 마감 / 곧 마감" 문구 규칙
lib/__tests__/home.test.ts
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions
- [x] `CLAUDE.md`에 작업 규칙(커밋 형식, 설명 방식)
- [ ] `docs/01-plan/conventions.md` 없음
- [x] ESLint 설정 (`eslint.config.mjs`)
- [ ] Prettier 설정 없음
- [x] TypeScript 설정 (`tsconfig.json`)

### 8.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | 컴포넌트 PascalCase, 함수 camelCase, 테스트 이름은 한국어 "~하면 ~한다" | High |
| **Folder structure** | exists | 기능 컴포넌트는 `components/features/<도메인>/components/`, 로직은 `lib/` | High |
| **Import order** | missing | `@/` 별칭 사용만 지킴 | Low |
| **Environment variables** | 해당 없음 | - | - |
| **Error handling** | exists | 빈 목록은 안내 문구 | Medium |

### 8.3 Environment Variables Needed
없음.

---

## 9. Next Steps

1. [ ] `/pdca design home`: 섹션 함수 위치, 렌더링 방식(revalidate), 섹션 컴포넌트 구조, 배너 구현 방식(embla autoplay 여부) 결정
2. [ ] `/pdca do home`
3. [ ] `/jest-test` → (`it.failing` 있으면 do로) → `/pdca analyze home`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-11-18 | 첫 작성 (섹션·기준·개수·끝난 딜 처리 확정) | Park sian |
| 0.2 | 2026-11-22 | 오늘 마감 영역을 `Carousel`로, 곧 오픈·베스트를 좌우 배치에서 위아래 전체 폭으로. 목업 3안 비교 후 A안(큰 딜 + 오늘 마감 + 곧 오픈 + 베스트 순위)으로 변경. 카운트다운 대신 시각 표시, 영역 간 중복 제거, 사진 정리 추가 | Park sian |
| 0.3 | 2026-11-22 | 11번가 홈을 참고해 맨 위 큰 딜 1개를 배너 캐러셀(최대 3장, 자동 넘김, 일시정지, 동작 줄이기 대응)로 변경. FR-11 추가, 서버/클라이언트 경계(2.3) 추가, 성능 비교는 Supabase 단계로 미룸 | Park sian |
